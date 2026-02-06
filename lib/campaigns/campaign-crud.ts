import { CampaignStatus } from "@prisma/client";

import { prisma } from "../prisma";

const MAX_CAMPAIGN_NAME_LENGTH = 120;

export class CampaignValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignValidationError";
  }
}

export class CampaignNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignNotFoundError";
  }
}

export type CampaignListItem = {
  id: string;
  workspaceId: string;
  name: string;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
};

function validateWorkspaceId(workspaceId: string): string {
  const normalized = workspaceId.trim();

  if (!normalized) {
    throw new CampaignValidationError("Workspace id is required.");
  }

  return normalized;
}

function validateCampaignId(campaignId: string): string {
  const normalized = campaignId.trim();

  if (!normalized) {
    throw new CampaignValidationError("Campaign id is required.");
  }

  return normalized;
}

function validateCampaignName(name: string): string {
  const normalized = name.trim();

  if (!normalized) {
    throw new CampaignValidationError("Campaign name is required.");
  }

  if (normalized.length > MAX_CAMPAIGN_NAME_LENGTH) {
    throw new CampaignValidationError(
      `Campaign name must be ${MAX_CAMPAIGN_NAME_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

export async function listCampaignsForWorkspace(workspaceId: string): Promise<CampaignListItem[]> {
  const validatedWorkspaceId = validateWorkspaceId(workspaceId);

  return prisma.campaign.findMany({
    where: {
      workspaceId: validatedWorkspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createCampaignForWorkspace(input: {
  workspaceId: string;
  name: string;
}): Promise<CampaignListItem> {
  const validatedWorkspaceId = validateWorkspaceId(input.workspaceId);
  const validatedName = validateCampaignName(input.name);

  return prisma.campaign.create({
    data: {
      workspaceId: validatedWorkspaceId,
      name: validatedName,
      status: CampaignStatus.DRAFT,
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function renameCampaignForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  name: string;
}): Promise<CampaignListItem> {
  const validatedWorkspaceId = validateWorkspaceId(input.workspaceId);
  const validatedCampaignId = validateCampaignId(input.campaignId);
  const validatedName = validateCampaignName(input.name);

  const existing = await prisma.campaign.findUnique({
    where: {
      id: validatedCampaignId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!existing || existing.workspaceId !== validatedWorkspaceId) {
    throw new CampaignNotFoundError("Campaign not found.");
  }

  return prisma.campaign.update({
    where: {
      id: validatedCampaignId,
    },
    data: {
      name: validatedName,
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
