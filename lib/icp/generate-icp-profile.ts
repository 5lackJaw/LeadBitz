import { IcpSourceType } from "@prisma/client";

import { prisma } from "../prisma";

const MAX_PROFILE_NAME_LENGTH = 120;

export type IcpGenerationSourceType = "WEBSITE_URL" | "PRODUCT_DESCRIPTION";

export type IcpDraft = {
  targetIndustries: string[];
  companySizeBands: string[];
  buyerRoles: string[];
  pains: string[];
  exclusions: string[];
  valuePropAngles: string[];
  sourceSummary: string;
};

export type IcpDraftGenerator = (input: {
  sourceType: IcpGenerationSourceType;
  sourceValue: string;
}) => Promise<IcpDraft> | IcpDraft;

export class IcpGenerationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpGenerationValidationError";
  }
}

export class IcpGenerationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpGenerationNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new IcpGenerationValidationError(`${fieldName} is required.`);
  }

  return normalized;
}

function resolveProfileName(sourceType: IcpGenerationSourceType, profileName?: string | null): string {
  const normalized = profileName?.trim() ?? "";

  if (!normalized) {
    return sourceType === "WEBSITE_URL" ? "Website ICP Draft" : "Product Description ICP Draft";
  }

  if (normalized.length > MAX_PROFILE_NAME_LENGTH) {
    throw new IcpGenerationValidationError(
      `Profile name must be ${MAX_PROFILE_NAME_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

function mapSourceTypeToPrismaEnum(sourceType: IcpGenerationSourceType): IcpSourceType {
  if (sourceType === "WEBSITE_URL") {
    return IcpSourceType.WEBSITE_URL;
  }

  return IcpSourceType.PRODUCT_DESCRIPTION;
}

function defaultIcpDraftGenerator(input: {
  sourceType: IcpGenerationSourceType;
  sourceValue: string;
}): IcpDraft {
  const sourceSummary =
    input.sourceType === "WEBSITE_URL"
      ? `Website analyzed: ${input.sourceValue}`
      : `Description analyzed (${input.sourceValue.length} chars)`;

  return {
    targetIndustries: ["B2B SaaS", "Agencies"],
    companySizeBands: ["11-50", "51-200"],
    buyerRoles: ["Founder", "Head of Sales", "Revenue Operations"],
    pains: [
      "Inconsistent outbound process",
      "Deliverability risk from unmanaged sending",
      "Low reply quality from generic messaging",
    ],
    exclusions: ["B2C-only businesses", "High-volume spam workflows"],
    valuePropAngles: [
      "Deliverability-first campaign controls",
      "Operator-reviewed AI assistance",
      "Unified campaign and inbox operations",
    ],
    sourceSummary,
  };
}

export async function generateIcpProfileForWorkspace(input: {
  workspaceId: string;
  sourceType: IcpGenerationSourceType;
  sourceValue: string;
  campaignId?: string | null;
  profileName?: string | null;
  generateIcpDraft?: IcpDraftGenerator;
}): Promise<{ icpProfileId: string; icp: IcpDraft; campaignId: string | null }> {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const sourceValue = validateRequiredText(input.sourceValue, "Source value");
  const profileName = resolveProfileName(input.sourceType, input.profileName);
  const campaignId = input.campaignId?.trim() || null;

  if (campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!campaign || campaign.workspaceId !== workspaceId) {
      throw new IcpGenerationNotFoundError("Campaign not found.");
    }
  }

  const generator = input.generateIcpDraft ?? defaultIcpDraftGenerator;
  const icpDraft = await generator({
    sourceType: input.sourceType,
    sourceValue,
  });

  const icp = await prisma.$transaction(async (tx) => {
    const createdProfile = await tx.icpProfile.create({
      data: {
        workspaceId,
        name: profileName,
        sourceType: mapSourceTypeToPrismaEnum(input.sourceType),
        sourceValue,
        icp: icpDraft,
      },
      select: {
        id: true,
        icp: true,
      },
    });

    if (campaignId) {
      await tx.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          icpProfileId: createdProfile.id,
        },
      });
    }

    return createdProfile;
  });

  return {
    icpProfileId: icp.id,
    icp: icp.icp as IcpDraft,
    campaignId,
  };
}
