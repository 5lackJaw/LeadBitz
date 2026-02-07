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
}): Prisma.CandidateCreateManyInput | null {
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

    const candidateRows = fetchedCandidates
      .map((candidate) =>
        toCandidateCreateInput({
          workspaceId: sourceRun.workspaceId,
          campaignId: sourceRun.campaignId,
          sourceRunId: sourceRun.id,
          candidate,
        }),
      )
      .filter((candidate): candidate is Prisma.CandidateCreateManyInput => candidate !== null);

    if (candidateRows.length > 0) {
      await prisma.candidate.createMany({
        data: candidateRows,
      });
    }

    const stats = {
      fetched: fetchedCandidates.length,
      candidatesCreated: candidateRows.length,
      skippedMissingEmail: fetchedCandidates.length - candidateRows.length,
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
