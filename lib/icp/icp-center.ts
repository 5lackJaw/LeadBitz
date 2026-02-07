import { IcpVersionSource } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class IcpCenterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpCenterValidationError";
  }
}

export class IcpCenterNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpCenterNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new IcpCenterValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

export type IcpCenterVersionItem = {
  id: string;
  title: string;
  source: IcpVersionSource;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  latestScore: {
    id: string;
    score: number;
    tier: string;
    computedAt: Date;
  } | null;
};

export async function listIcpVersionsForCampaign(input: {
  workspaceId: string;
  campaignId: string;
}): Promise<IcpCenterVersionItem[]> {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const campaignId = validateRequiredText(input.campaignId, "Campaign id");

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!campaign) {
    throw new IcpCenterNotFoundError("Campaign not found.");
  }

  const versions = await prisma.icpVersion.findMany({
    where: {
      workspaceId,
      campaignId,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      source: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      qualityScores: {
        orderBy: {
          computedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          scoreInt: true,
          tier: true,
          computedAt: true,
        },
      },
    },
  });

  return versions.map((version) => ({
    id: version.id,
    title: version.title,
    source: version.source,
    isActive: version.isActive,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
    latestScore: version.qualityScores[0]
      ? {
          id: version.qualityScores[0].id,
          score: version.qualityScores[0].scoreInt,
          tier: version.qualityScores[0].tier,
          computedAt: version.qualityScores[0].computedAt,
        }
      : null,
  }));
}

export async function setActiveIcpVersionForCampaign(input: {
  workspaceId: string;
  campaignId: string;
  icpVersionId: string;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const campaignId = validateRequiredText(input.campaignId, "Campaign id");
  const icpVersionId = validateRequiredText(input.icpVersionId, "ICP version id");

  const targetVersion = await prisma.icpVersion.findFirst({
    where: {
      id: icpVersionId,
      workspaceId,
      campaignId,
    },
    select: {
      id: true,
    },
  });

  if (!targetVersion) {
    throw new IcpCenterNotFoundError("ICP version not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.icpVersion.updateMany({
      where: {
        workspaceId,
        campaignId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    await tx.icpVersion.update({
      where: {
        id: icpVersionId,
      },
      data: {
        isActive: true,
      },
    });
  });
}
