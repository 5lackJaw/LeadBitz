import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CSV_ROWS = 5000;

type CsvColumnKey = "email" | "firstName" | "lastName" | "title" | "companyName" | "companyDomain";

const DEFAULT_HEADER_ALIASES: Record<CsvColumnKey, string[]> = {
  email: ["email", "e-mail", "email address"],
  firstName: ["first name", "firstname", "given name"],
  lastName: ["last name", "lastname", "surname", "family name"],
  title: ["title", "job title", "role"],
  companyName: ["company", "company name", "organization", "organisation"],
  companyDomain: ["domain", "company domain", "website", "company website"],
};

export class CsvImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvImportValidationError";
  }
}

export class CsvImportNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvImportNotFoundError";
  }
}

export type CsvImportOutcomeCode =
  | "IMPORTED"
  | "LINKED_EXISTING"
  | "SUPPRESSED"
  | "DUPLICATE"
  | "INVALID";

export type CsvImportRowOutcome = {
  rowNumber: number;
  email: string | null;
  outcome: CsvImportOutcomeCode;
  message: string;
};

export type CsvImportResult = {
  importedCount: number;
  linkedExistingCount: number;
  suppressedCount: number;
  duplicateCount: number;
  invalidCount: number;
  outcomes: CsvImportRowOutcome[];
};

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new CsvImportValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeOptionalCell(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentCell += "\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function findHeaderIndex(headers: string[], aliases: string[]): number {
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  for (const alias of aliases) {
    const index = normalizedHeaders.indexOf(alias.trim().toLowerCase());
    if (index >= 0) {
      return index;
    }
  }
  return -1;
}

function resolveColumnIndexes(input: {
  headers: string[];
  columnMapping?: Partial<Record<CsvColumnKey, string>>;
}): Record<CsvColumnKey, number> {
  const { headers, columnMapping } = input;
  const resolved = {} as Record<CsvColumnKey, number>;

  for (const key of Object.keys(DEFAULT_HEADER_ALIASES) as CsvColumnKey[]) {
    const explicitHeader = columnMapping?.[key]?.trim();
    if (explicitHeader) {
      const explicitIndex = findHeaderIndex(headers, [explicitHeader]);
      if (explicitIndex < 0) {
        throw new CsvImportValidationError(`Mapped header "${explicitHeader}" not found for ${key}.`);
      }
      resolved[key] = explicitIndex;
      continue;
    }

    const inferredIndex = findHeaderIndex(headers, DEFAULT_HEADER_ALIASES[key]);
    resolved[key] = inferredIndex;
  }

  if (resolved.email === -1) {
    throw new CsvImportValidationError("CSV must include an email column.");
  }

  return resolved;
}

function normalizeEmail(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
}

async function assertCampaignInWorkspace(input: {
  workspaceId: string;
  campaignId: string;
}) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: input.campaignId,
      workspaceId: input.workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new CsvImportNotFoundError("Campaign not found.");
  }
}

function buildProvenanceRows(input: {
  leadId: string;
  leadSourceId: string;
  fields: Record<CsvColumnKey, string | null>;
}): Prisma.LeadFieldProvenanceCreateManyInput[] {
  const now = new Date();
  const rows: Prisma.LeadFieldProvenanceCreateManyInput[] = [];

  for (const [fieldName, fieldValue] of Object.entries(input.fields)) {
    if (!fieldValue) {
      continue;
    }

    rows.push({
      leadId: input.leadId,
      leadSourceId: input.leadSourceId,
      fieldName,
      fieldValue,
      capturedAt: now,
    });
  }

  return rows;
}

export async function importCsvLeadsForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  csvText: string;
  columnMapping?: Partial<Record<CsvColumnKey, string>>;
}): Promise<CsvImportResult> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const csvText = input.csvText;

  if (typeof csvText !== "string" || csvText.trim().length === 0) {
    throw new CsvImportValidationError("csvText is required.");
  }

  await assertCampaignInWorkspace({
    workspaceId,
    campaignId,
  });

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new CsvImportValidationError("CSV must include a header row and at least one data row.");
  }

  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);
  if (dataRows.length > MAX_CSV_ROWS) {
    throw new CsvImportValidationError(`CSV row limit exceeded. Maximum supported rows: ${MAX_CSV_ROWS}.`);
  }

  const columnIndexes = resolveColumnIndexes({
    headers,
    columnMapping: input.columnMapping,
  });

  const normalizedEmailSet = new Set<string>();
  for (const row of dataRows) {
    const email = normalizeEmail(normalizeOptionalCell(row[columnIndexes.email]));
    if (email) {
      normalizedEmailSet.add(email);
    }
  }

  const [suppressionRows, existingLeadRows] = await Promise.all([
    prisma.suppression.findMany({
      where: {
        workspaceId,
        email: {
          in: [...normalizedEmailSet],
        },
      },
      select: {
        email: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        workspaceId,
        email: {
          in: [...normalizedEmailSet],
        },
      },
      select: {
        id: true,
        email: true,
      },
    }),
  ]);

  const suppressedEmails = new Set(suppressionRows.map((row) => row.email.trim().toLowerCase()));
  const existingLeadByEmail = new Map(existingLeadRows.map((row) => [row.email.trim().toLowerCase(), row]));

  const csvLeadSource = await prisma.leadSource.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: "csv_import",
      },
    },
    create: {
      workspaceId,
      name: "csv_import",
      constraintsNote: "CSV fallback import with row-level dedupe/suppression checks.",
      isEnabled: true,
    },
    update: {
      isEnabled: true,
    },
  });

  const seenEmails = new Set<string>();
  const outcomes: CsvImportRowOutcome[] = [];
  let importedCount = 0;
  let linkedExistingCount = 0;
  let suppressedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < dataRows.length; index += 1) {
      const row = dataRows[index] ?? [];
      const rowNumber = index + 2;

      const rawEmail = normalizeOptionalCell(row[columnIndexes.email]);
      const email = normalizeEmail(rawEmail);
      const firstName = columnIndexes.firstName >= 0 ? normalizeOptionalCell(row[columnIndexes.firstName]) : null;
      const lastName = columnIndexes.lastName >= 0 ? normalizeOptionalCell(row[columnIndexes.lastName]) : null;
      const title = columnIndexes.title >= 0 ? normalizeOptionalCell(row[columnIndexes.title]) : null;
      const companyName = columnIndexes.companyName >= 0 ? normalizeOptionalCell(row[columnIndexes.companyName]) : null;
      const companyDomain =
        columnIndexes.companyDomain >= 0 ? normalizeOptionalCell(row[columnIndexes.companyDomain]) : null;

      if (!email || !EMAIL_PATTERN.test(email)) {
        invalidCount += 1;
        outcomes.push({
          rowNumber,
          email: email ?? null,
          outcome: "INVALID",
          message: "Invalid or missing email.",
        });
        continue;
      }

      if (seenEmails.has(email)) {
        duplicateCount += 1;
        outcomes.push({
          rowNumber,
          email,
          outcome: "DUPLICATE",
          message: "Duplicate email in CSV payload.",
        });
        continue;
      }
      seenEmails.add(email);

      if (suppressedEmails.has(email)) {
        suppressedCount += 1;
        outcomes.push({
          rowNumber,
          email,
          outcome: "SUPPRESSED",
          message: "Email exists in suppression list.",
        });
        continue;
      }

      const existingLead = existingLeadByEmail.get(email);

      const lead =
        existingLead ??
        (await tx.lead.create({
          data: {
            workspaceId,
            email,
            firstName,
            lastName,
            title,
            companyName,
            companyDomain,
            metadata: {
              importSource: "csv_import",
            } satisfies Prisma.InputJsonValue,
          },
          select: {
            id: true,
            email: true,
          },
        }));

      if (!existingLead) {
        existingLeadByEmail.set(email, lead);
      }

      await tx.campaignLead.upsert({
        where: {
          campaignId_leadId: {
            campaignId,
            leadId: lead.id,
          },
        },
        create: {
          campaignId,
          leadId: lead.id,
        },
        update: {},
      });

      const provenanceRows = buildProvenanceRows({
        leadId: lead.id,
        leadSourceId: csvLeadSource.id,
        fields: {
          email,
          firstName,
          lastName,
          title,
          companyName,
          companyDomain,
        },
      });

      if (provenanceRows.length > 0) {
        await tx.leadFieldProvenance.createMany({
          data: provenanceRows,
        });
      }

      if (existingLead) {
        linkedExistingCount += 1;
        outcomes.push({
          rowNumber,
          email,
          outcome: "LINKED_EXISTING",
          message: "Existing lead linked to campaign.",
        });
      } else {
        importedCount += 1;
        outcomes.push({
          rowNumber,
          email,
          outcome: "IMPORTED",
          message: "Lead imported and linked to campaign.",
        });
      }
    }
  });

  return {
    importedCount,
    linkedExistingCount,
    suppressedCount,
    duplicateCount,
    invalidCount,
    outcomes,
  };
}
