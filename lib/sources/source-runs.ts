import { Prisma, SourceRunStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  SourceConnectorDisabledError,
  SourceConnectorNotFoundError,
  assertSourceConnectorEnabledForWorkspace,
} from "@/lib/sources/source-connectors";

const MAX_RUN_LABEL_LENGTH = 120;
const MAX_DISCOVERY_LIMIT = 1000;

export class SourceRunValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceRunValidationError";
  }
}

export class SourceRunNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceRunNotFoundError";
  }
}

function validateCampaignId(campaignId: string): string {
  const normalized = campaignId.trim();

  if (!normalized) {
    throw new SourceRunValidationError("campaignId is required.");
  }

  return normalized;
}

function validateConnectorId(connectorId: string): string {
  const normalized = connectorId.trim();

  if (!normalized) {
    throw new SourceRunValidationError("connectorId is required.");
  }

  return normalized;
}

function validateRunLabel(runLabel?: string): string | null {
  if (runLabel === undefined) {
    return null;
  }

  const normalized = runLabel.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > MAX_RUN_LABEL_LENGTH) {
    throw new SourceRunValidationError(
      `runLabel must be ${MAX_RUN_LABEL_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

function validateLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return 100;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_DISCOVERY_LIMIT) {
    throw new SourceRunValidationError(`limit must be an integer between 1 and ${MAX_DISCOVERY_LIMIT}.`);
  }

  return limit;
}

function validateFilters(filters: unknown): Prisma.InputJsonObject {
  if (filters === undefined) {
    return {};
  }

  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new SourceRunValidationError("filters must be an object when provided.");
  }

  return JSON.parse(JSON.stringify(filters)) as Prisma.InputJsonObject;
}

function validateIcpProfileId(icpProfileId?: string): string | null {
  if (icpProfileId === undefined) {
    return null;
  }

  const normalized = icpProfileId.trim();
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
    throw new SourceRunNotFoundError("Campaign not found.");
  }
}

async function assertIcpProfileInWorkspace(input: {
  workspaceId: string;
  icpProfileId: string | null;
}) {
  if (!input.icpProfileId) {
    return;
  }

  const profile = await prisma.icpProfile.findFirst({
    where: {
      id: input.icpProfileId,
      workspaceId: input.workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    throw new SourceRunNotFoundError("ICP profile not found.");
  }
}

export type DiscoveryRunRecord = {
  id: string;
  workspaceId: string;
  campaignId: string;
  connectorId: string;
  runLabel: string | null;
  icpProfileId: string | null;
  queryJson: unknown;
  status: SourceRunStatus;
  statsJson: unknown;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function createDiscoveryRunForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  connectorId: string;
  icpProfileId?: string;
  filters?: unknown;
  limit?: number;
  runLabel?: string;
}): Promise<DiscoveryRunRecord> {
  const campaignId = validateCampaignId(input.campaignId);
  const connectorId = validateConnectorId(input.connectorId);
  const icpProfileId = validateIcpProfileId(input.icpProfileId);
  const filters = validateFilters(input.filters);
  const limit = validateLimit(input.limit);
  const runLabel = validateRunLabel(input.runLabel);

  await assertCampaignInWorkspace({
    workspaceId: input.workspaceId,
    campaignId,
  });

  await assertSourceConnectorEnabledForWorkspace({
    workspaceId: input.workspaceId,
    sourceConnectorId: connectorId,
  });

  await assertIcpProfileInWorkspace({
    workspaceId: input.workspaceId,
    icpProfileId,
  });

  const queryJson: Prisma.InputJsonObject = {
    filters,
    limit,
  };

  return prisma.sourceRun.create({
    data: {
      workspaceId: input.workspaceId,
      campaignId,
      connectorId,
      runLabel,
      icpProfileId,
      queryJson,
      status: SourceRunStatus.QUEUED,
    },
  });
}

export {
  SourceConnectorDisabledError,
  SourceConnectorNotFoundError,
};
