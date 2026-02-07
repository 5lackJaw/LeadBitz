import { CampaignStatus, Prisma } from "@prisma/client";

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
  inboxConnectionId: string | null;
  name: string;
  status: CampaignStatus;
  messagingRules: string | null;
  discoveryRules: string | null;
  wizardState: unknown;
  icpProfileId: string | null;
  icpProfileName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CampaignOverview = CampaignListItem & {
  inboxEmail: string | null;
  icpSummary: unknown;
};

type CampaignRecord = {
  id: string;
  workspaceId: string;
  inboxConnectionId: string | null;
  name: string;
  status: CampaignStatus;
  messagingRules: string | null;
  discoveryRules: string | null;
  wizardState: unknown;
  icpProfileId: string | null;
  createdAt: Date;
  updatedAt: Date;
  icpProfile: {
    name: string;
    icp?: unknown;
  } | null;
  inboxConnection?: {
    email: string;
  } | null;
};

function toCampaignListItem(campaign: CampaignRecord): CampaignListItem {
  return {
    id: campaign.id,
    workspaceId: campaign.workspaceId,
    inboxConnectionId: campaign.inboxConnectionId,
    name: campaign.name,
    status: campaign.status,
    messagingRules: campaign.messagingRules,
    discoveryRules: campaign.discoveryRules,
    wizardState: campaign.wizardState,
    icpProfileId: campaign.icpProfileId,
    icpProfileName: campaign.icpProfile?.name ?? null,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

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

async function validateWorkspaceInboxConnection(input: {
  workspaceId: string;
  inboxConnectionId: string;
}) {
  const inbox = await prisma.inboxConnection.findUnique({
    where: {
      id: input.inboxConnectionId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!inbox || inbox.workspaceId !== input.workspaceId) {
    throw new CampaignValidationError("Inbox connection not found.");
  }
}

export async function listCampaignsForWorkspace(workspaceId: string): Promise<CampaignListItem[]> {
  const validatedWorkspaceId = validateWorkspaceId(workspaceId);

  const campaigns = await prisma.campaign.findMany({
    where: {
      workspaceId: validatedWorkspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      workspaceId: true,
      inboxConnectionId: true,
      name: true,
      status: true,
      messagingRules: true,
      discoveryRules: true,
      wizardState: true,
      icpProfileId: true,
      icpProfile: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return campaigns.map(toCampaignListItem);
}

export async function getCampaignOverviewForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
}): Promise<CampaignOverview> {
  const validatedWorkspaceId = validateWorkspaceId(input.workspaceId);
  const validatedCampaignId = validateCampaignId(input.campaignId);

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: validatedCampaignId,
    },
    select: {
      id: true,
      workspaceId: true,
      inboxConnectionId: true,
      name: true,
      status: true,
      messagingRules: true,
      discoveryRules: true,
      wizardState: true,
      icpProfileId: true,
      createdAt: true,
      updatedAt: true,
      inboxConnection: {
        select: {
          email: true,
        },
      },
      icpProfile: {
        select: {
          name: true,
          icp: true,
        },
      },
    },
  });

  if (!campaign || campaign.workspaceId !== validatedWorkspaceId) {
    throw new CampaignNotFoundError("Campaign not found.");
  }

  return {
    ...toCampaignListItem(campaign),
    inboxEmail: campaign.inboxConnection?.email ?? null,
    icpSummary: campaign.icpProfile?.icp ?? null,
  };
}

export async function createCampaignForWorkspace(input: {
  workspaceId: string;
  name: string;
  inboxConnectionId?: string | null;
}): Promise<CampaignListItem> {
  const validatedWorkspaceId = validateWorkspaceId(input.workspaceId);
  const validatedName = validateCampaignName(input.name);
  const normalizedInboxConnectionId = input.inboxConnectionId?.trim() || null;

  if (normalizedInboxConnectionId) {
    await validateWorkspaceInboxConnection({
      workspaceId: validatedWorkspaceId,
      inboxConnectionId: normalizedInboxConnectionId,
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: validatedWorkspaceId,
      name: validatedName,
      status: CampaignStatus.DRAFT,
      inboxConnectionId: normalizedInboxConnectionId,
    },
    select: {
      id: true,
      workspaceId: true,
      inboxConnectionId: true,
      name: true,
      status: true,
      messagingRules: true,
      discoveryRules: true,
      wizardState: true,
      icpProfileId: true,
      icpProfile: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return toCampaignListItem(campaign);
}

export async function updateCampaignForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  name?: string;
  inboxConnectionId?: string | null;
  messagingRules?: string | null;
  discoveryRules?: string | null;
  wizardState?: Prisma.InputJsonValue | null;
}): Promise<CampaignListItem> {
  const validatedWorkspaceId = validateWorkspaceId(input.workspaceId);
  const validatedCampaignId = validateCampaignId(input.campaignId);

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

  let normalizedInboxConnectionId: string | null | undefined = undefined;
  if (input.inboxConnectionId !== undefined) {
    normalizedInboxConnectionId = input.inboxConnectionId?.trim() || null;

    if (normalizedInboxConnectionId) {
      await validateWorkspaceInboxConnection({
        workspaceId: validatedWorkspaceId,
        inboxConnectionId: normalizedInboxConnectionId,
      });
    }
  }

  const data: Prisma.CampaignUncheckedUpdateInput = {};

  if (input.name !== undefined) {
    data.name = validateCampaignName(input.name);
  }

  if (input.messagingRules !== undefined) {
    data.messagingRules = input.messagingRules?.trim() || null;
  }

  if (input.discoveryRules !== undefined) {
    data.discoveryRules = input.discoveryRules?.trim() || null;
  }

  if (input.wizardState !== undefined) {
    data.wizardState = input.wizardState === null ? Prisma.JsonNull : input.wizardState;
  }

  if (normalizedInboxConnectionId !== undefined) {
    data.inboxConnectionId = normalizedInboxConnectionId;
  }

  const campaign = await prisma.campaign.update({
    where: {
      id: validatedCampaignId,
    },
    data,
    select: {
      id: true,
      workspaceId: true,
      inboxConnectionId: true,
      name: true,
      status: true,
      messagingRules: true,
      discoveryRules: true,
      wizardState: true,
      icpProfileId: true,
      icpProfile: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return toCampaignListItem(campaign);
}

export async function renameCampaignForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  name: string;
}): Promise<CampaignListItem> {
  return updateCampaignForWorkspace({
    workspaceId: input.workspaceId,
    campaignId: input.campaignId,
    name: input.name,
  });
}
