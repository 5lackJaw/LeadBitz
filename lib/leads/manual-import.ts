import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MANUAL_ROWS = 1000;

type ManualLeadInput = {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
};

export class ManualImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManualImportValidationError";
  }
}

export class ManualImportNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManualImportNotFoundError";
  }
}

export type ManualImportOutcomeCode =
  | "IMPORTED"
  | "LINKED_EXISTING"
  | "SUPPRESSED"
  | "DUPLICATE"
  | "INVALID";

export type ManualImportRowOutcome = {
  index: number;
  email: string | null;
  outcome: ManualImportOutcomeCode;
  message: string;
};

export type ManualImportResult = {
  importedCount: number;
  linkedExistingCount: number;
  suppressedCount: number;
  duplicateCount: number;
  invalidCount: number;
  outcomes: ManualImportRowOutcome[];
};

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new ManualImportValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
}

function normalizeEmail(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
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
    throw new ManualImportNotFoundError("Campaign not found.");
  }
}

function buildProvenanceRows(input: {
  leadId: string;
  leadSourceId: string;
  fields: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    title: string | null;
    companyName: string | null;
    companyDomain: string | null;
  };
}): Prisma.LeadFieldProvenanceCreateManyInput[] {
  const now = new Date();
  const fields = [
    { fieldName: "email", fieldValue: input.fields.email },
    { fieldName: "firstName", fieldValue: input.fields.firstName },
    { fieldName: "lastName", fieldValue: input.fields.lastName },
    { fieldName: "title", fieldValue: input.fields.title },
    { fieldName: "companyName", fieldValue: input.fields.companyName },
    { fieldName: "companyDomain", fieldValue: input.fields.companyDomain },
  ];

  return fields
    .filter((field) => field.fieldValue && field.fieldValue.trim().length > 0)
    .map((field) => ({
      leadId: input.leadId,
      leadSourceId: input.leadSourceId,
      fieldName: field.fieldName,
      fieldValue: field.fieldValue,
      capturedAt: now,
    }));
}

export async function importManualLeadsForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  rows: ManualLeadInput[];
}): Promise<ManualImportResult> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const rows = input.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ManualImportValidationError("rows must include at least one lead input.");
  }

  if (rows.length > MAX_MANUAL_ROWS) {
    throw new ManualImportValidationError(`rows cannot exceed ${MAX_MANUAL_ROWS} records per request.`);
  }

  await assertCampaignInWorkspace({
    workspaceId,
    campaignId,
  });

  const normalizedEmails = rows.map((row) => normalizeEmail(row.email)).filter(Boolean) as string[];

  const [suppressionRows, existingLeadRows] = await Promise.all([
    prisma.suppression.findMany({
      where: {
        workspaceId,
        email: {
          in: normalizedEmails,
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
          in: normalizedEmails,
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

  const manualLeadSource = await prisma.leadSource.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: "manual_import",
      },
    },
    create: {
      workspaceId,
      name: "manual_import",
      constraintsNote: "Manual lead import with row-level dedupe/suppression checks.",
      isEnabled: true,
    },
    update: {
      isEnabled: true,
    },
  });

  const seenEmails = new Set<string>();
  const outcomes: ManualImportRowOutcome[] = [];
  let importedCount = 0;
  let linkedExistingCount = 0;
  let suppressedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] ?? {};
      const email = normalizeEmail(row.email);
      const firstName = normalizeOptionalString(row.firstName);
      const lastName = normalizeOptionalString(row.lastName);
      const title = normalizeOptionalString(row.title);
      const companyName = normalizeOptionalString(row.companyName);
      const companyDomain = normalizeOptionalString(row.companyDomain);

      if (!email || !EMAIL_PATTERN.test(email)) {
        invalidCount += 1;
        outcomes.push({
          index,
          email: email ?? null,
          outcome: "INVALID",
          message: "Invalid or missing email.",
        });
        continue;
      }

      if (seenEmails.has(email)) {
        duplicateCount += 1;
        outcomes.push({
          index,
          email,
          outcome: "DUPLICATE",
          message: "Duplicate email in request payload.",
        });
        continue;
      }
      seenEmails.add(email);

      if (suppressedEmails.has(email)) {
        suppressedCount += 1;
        outcomes.push({
          index,
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
              importSource: "manual_import",
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
        leadSourceId: manualLeadSource.id,
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
          index,
          email,
          outcome: "LINKED_EXISTING",
          message: "Existing lead linked to campaign.",
        });
      } else {
        importedCount += 1;
        outcomes.push({
          index,
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
