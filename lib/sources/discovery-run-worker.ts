import { CandidateStatus, CandidateVerificationStatus, Prisma, SourceConnectorType, SourceRunStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PdlCandidate, PdlClient, PdlClientValidationError } from "@/lib/sources/pdl-client";

export class DiscoveryRunWorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscoveryRunWorkerError";
  }
}

type DiscoveryClient = {
  fetchAllCandidates(input: { filters?: Record<string, unknown>; limit: number }): Promise<PdlCandidate[]>;
};

type CandidatePreparedRow = Prisma.CandidateCreateManyInput & {
  dedupeKeyEmail: string;
  dedupeKeyPersonProviderId: string | null;
  dedupeKeyCompanyProviderId: string | null;
};

function normalizeQueryJson(queryJson: unknown): { filters: Record<string, unknown>; limit: number } {
  const root = queryJson && typeof queryJson === "object" && !Array.isArray(queryJson)
    ? (queryJson as Record<string, unknown>)
    : {};

  const filters =
    root.filters && typeof root.filters === "object" && !Array.isArray(root.filters)
      ? (root.filters as Record<string, unknown>)
      : {};

  const rawLimit = root.limit;
  const limit = typeof rawLimit === "number" && Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 100;

  return { filters, limit };
}

function toCandidateCreateInput(input: {
  workspaceId: string;
  campaignId: string;
  sourceRunId: string;
  candidate: PdlCandidate;
}): CandidatePreparedRow | null {
  const email = input.candidate.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return null;
  }

  return {
    workspaceId: input.workspaceId,
    campaignId: input.campaignId,
    sourceRunId: input.sourceRunId,
    personProviderId: input.candidate.personProviderId,
    companyProviderId: input.candidate.company.id,
    email,
    firstName: input.candidate.firstName,
    lastName: input.candidate.lastName,
    title: input.candidate.title,
    seniority: input.candidate.seniority,
    department: input.candidate.department,
    companyName: input.candidate.company.name,
    companyDomain: input.candidate.company.domain,
    companyWebsite: input.candidate.company.website,
    locationJson: input.candidate.location ? { value: input.candidate.location } : Prisma.JsonNull,
    confidenceScore: null,
    verificationStatus: CandidateVerificationStatus.UNKNOWN,
    status: CandidateStatus.NEW,
    dedupeKeyEmail: email,
    dedupeKeyPersonProviderId: input.candidate.personProviderId,
    dedupeKeyCompanyProviderId: input.candidate.company.id,
  };
}

function normalizeNonEmptyStringSet(values: Array<string | null | undefined>): Set<string> {
  const normalized = values
    .map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""))
    .filter((value) => value.length > 0);

  return new Set(normalized);
}

async function applySuppressionAndDedupe(input: {
  workspaceId: string;
  campaignId: string;
  candidateRows: CandidatePreparedRow[];
}): Promise<{
  rows: Prisma.CandidateCreateManyInput[];
  suppressedByBlocklist: number;
  suppressedByDuplicate: number;
}> {
  const emails = Array.from(new Set(input.candidateRows.map((row) => row.dedupeKeyEmail)));
  const personProviderIds = Array.from(
    new Set(
      input.candidateRows
        .map((row) => row.dedupeKeyPersonProviderId?.trim().toLowerCase() ?? "")
        .filter(Boolean),
    ),
  );
  const companyProviderIds = Array.from(
    new Set(
      input.candidateRows
        .map((row) => row.dedupeKeyCompanyProviderId?.trim().toLowerCase() ?? "")
        .filter(Boolean),
    ),
  );

  const [suppressionRows, leadRows, existingCandidateRows] = await Promise.all([
    prisma.suppression.findMany({
      where: {
        workspaceId: input.workspaceId,
        email: {
          in: emails,
        },
      },
      select: {
        email: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        workspaceId: input.workspaceId,
        email: {
          in: emails,
        },
      },
      select: {
        email: true,
      },
    }),
    prisma.candidate.findMany({
      where: {
        campaignId: input.campaignId,
        OR: [
          {
            email: {
              in: emails,
            },
          },
          ...(personProviderIds.length > 0
            ? [
                {
                  personProviderId: {
                    in: personProviderIds,
                  },
                },
              ]
            : []),
          ...(companyProviderIds.length > 0
            ? [
                {
                  companyProviderId: {
                    in: companyProviderIds,
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        email: true,
        personProviderId: true,
        companyProviderId: true,
      },
    }),
  ]);

  const blockedEmails = normalizeNonEmptyStringSet([...suppressionRows.map((row) => row.email), ...leadRows.map((row) => row.email)]);
  const existingCandidateEmails = normalizeNonEmptyStringSet(existingCandidateRows.map((row) => row.email));
  const existingCandidatePersonIds = normalizeNonEmptyStringSet(
    existingCandidateRows.map((row) => row.personProviderId),
  );
  const existingCandidateCompanyIds = normalizeNonEmptyStringSet(
    existingCandidateRows.map((row) => row.companyProviderId),
  );

  const seenEmails = new Set<string>();
  const seenPersonIds = new Set<string>();
  const seenCompanyIds = new Set<string>();

  let suppressedByBlocklist = 0;
  let suppressedByDuplicate = 0;

  const rows = input.candidateRows.map((row) => {
    const email = row.dedupeKeyEmail;
    const personId = row.dedupeKeyPersonProviderId?.trim().toLowerCase() ?? "";
    const companyId = row.dedupeKeyCompanyProviderId?.trim().toLowerCase() ?? "";

    const isBlocked = blockedEmails.has(email);
    const isDuplicate =
      existingCandidateEmails.has(email) ||
      seenEmails.has(email) ||
      (personId.length > 0 && (existingCandidatePersonIds.has(personId) || seenPersonIds.has(personId))) ||
      (companyId.length > 0 && (existingCandidateCompanyIds.has(companyId) || seenCompanyIds.has(companyId)));

    if (isBlocked) {
      suppressedByBlocklist += 1;
    } else if (isDuplicate) {
      suppressedByDuplicate += 1;
    }

    seenEmails.add(email);
    if (personId.length > 0) {
      seenPersonIds.add(personId);
    }
    if (companyId.length > 0) {
      seenCompanyIds.add(companyId);
    }

    return {
      workspaceId: row.workspaceId,
      campaignId: row.campaignId,
      sourceRunId: row.sourceRunId,
      personProviderId: row.personProviderId,
      companyProviderId: row.companyProviderId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      title: row.title,
      seniority: row.seniority,
      department: row.department,
      companyName: row.companyName,
      companyDomain: row.companyDomain,
      companyWebsite: row.companyWebsite,
      locationJson: row.locationJson,
      confidenceScore: row.confidenceScore,
      verificationStatus: row.verificationStatus,
      status:
        isBlocked || isDuplicate
          ? CandidateStatus.SUPPRESSED
          : CandidateStatus.NEW,
    };
  });

  return {
    rows,
    suppressedByBlocklist,
    suppressedByDuplicate,
  };
}

async function buildDiscoveryClient(input: {
  connectorType: SourceConnectorType;
  providerKey: string;
  configJson: unknown;
}): Promise<DiscoveryClient> {
  if (input.connectorType !== SourceConnectorType.LICENSED_PROVIDER || input.providerKey !== "pdl") {
    throw new DiscoveryRunWorkerError("Unsupported source connector provider.");
  }

  const config =
    input.configJson && typeof input.configJson === "object" && !Array.isArray(input.configJson)
      ? (input.configJson as Record<string, unknown>)
      : {};

  const apiKey = typeof config.apiKey === "string" ? config.apiKey.trim() : "";

  if (!apiKey) {
    throw new PdlClientValidationError("PDL connector config must include apiKey.");
  }

  return new PdlClient({ apiKey });
}

export async function executeDiscoveryRun(input: {
  sourceRunId: string;
  clientFactory?: (params: {
    connectorType: SourceConnectorType;
    providerKey: string;
    configJson: unknown;
  }) => Promise<DiscoveryClient> | DiscoveryClient;
}) {
  const sourceRun = await prisma.sourceRun.findUnique({
    where: {
      id: input.sourceRunId,
    },
    include: {
      connector: {
        select: {
          type: true,
          providerKey: true,
          configJson: true,
        },
      },
    },
  });

  if (!sourceRun) {
    throw new DiscoveryRunWorkerError("Source run not found.");
  }

  await prisma.sourceRun.update({
    where: {
      id: sourceRun.id,
    },
    data: {
      status: SourceRunStatus.RUNNING,
      startedAt: new Date(),
      statsJson: {
        state: "running",
      },
    },
  });

  try {
    const client =
      (await input.clientFactory?.({
        connectorType: sourceRun.connector.type,
        providerKey: sourceRun.connector.providerKey,
        configJson: sourceRun.connector.configJson,
      })) ??
      (await buildDiscoveryClient({
        connectorType: sourceRun.connector.type,
        providerKey: sourceRun.connector.providerKey,
        configJson: sourceRun.connector.configJson,
      }));

    const normalizedQuery = normalizeQueryJson(sourceRun.queryJson);
    const fetchedCandidates = await client.fetchAllCandidates({
      filters: normalizedQuery.filters,
      limit: normalizedQuery.limit,
    });

    const preparedCandidateRows = fetchedCandidates
      .map((candidate) =>
        toCandidateCreateInput({
          workspaceId: sourceRun.workspaceId,
          campaignId: sourceRun.campaignId,
          sourceRunId: sourceRun.id,
          candidate,
        }),
      )
      .filter((candidate): candidate is CandidatePreparedRow => candidate !== null);

    const dedupedCandidates = await applySuppressionAndDedupe({
      workspaceId: sourceRun.workspaceId,
      campaignId: sourceRun.campaignId,
      candidateRows: preparedCandidateRows,
    });

    if (dedupedCandidates.rows.length > 0) {
      await prisma.candidate.createMany({
        data: dedupedCandidates.rows,
      });
    }

    const approvableCount = dedupedCandidates.rows.filter((row) => row.status === CandidateStatus.NEW).length;
    const stats = {
      fetched: fetchedCandidates.length,
      candidatesCreated: dedupedCandidates.rows.length,
      approvableCandidates: approvableCount,
      suppressedByBlocklist: dedupedCandidates.suppressedByBlocklist,
      suppressedByDuplicate: dedupedCandidates.suppressedByDuplicate,
      skippedMissingEmail: fetchedCandidates.length - preparedCandidateRows.length,
    };

    await prisma.sourceRun.update({
      where: {
        id: sourceRun.id,
      },
      data: {
        status: SourceRunStatus.COMPLETED,
        finishedAt: new Date(),
        statsJson: stats,
      },
    });

    return stats;
  } catch (error) {
    await prisma.sourceRun.update({
      where: {
        id: sourceRun.id,
      },
      data: {
        status: SourceRunStatus.FAILED,
        finishedAt: new Date(),
        statsJson: {
          error: error instanceof Error ? error.message : "Unknown discovery worker error.",
        },
      },
    });

    throw error;
  }
}
