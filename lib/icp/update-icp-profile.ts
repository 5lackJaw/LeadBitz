import { prisma } from "../prisma";
import { IcpDraft } from "./generate-icp-profile";

const MAX_PROFILE_NAME_LENGTH = 120;

export class IcpProfileUpdateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpProfileUpdateValidationError";
  }
}

export class IcpProfileUpdateNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IcpProfileUpdateNotFoundError";
  }
}

function validateRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new IcpProfileUpdateValidationError(`${fieldName} is required.`);
  }

  return normalized;
}

function validateProfileName(profileName?: string | null): string | undefined {
  if (profileName === undefined || profileName === null) {
    return undefined;
  }

  const normalized = profileName.trim();
  if (!normalized) {
    throw new IcpProfileUpdateValidationError("Profile name is required when provided.");
  }

  if (normalized.length > MAX_PROFILE_NAME_LENGTH) {
    throw new IcpProfileUpdateValidationError(
      `Profile name must be ${MAX_PROFILE_NAME_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

function validateList(input: unknown, fieldName: string): string[] {
  if (!Array.isArray(input)) {
    throw new IcpProfileUpdateValidationError(`${fieldName} must be an array of strings.`);
  }

  const normalized = input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);

  if (normalized.length === 0) {
    throw new IcpProfileUpdateValidationError(`${fieldName} must contain at least one value.`);
  }

  return normalized;
}

function validateIcpDraft(input: unknown): IcpDraft {
  if (!input || typeof input !== "object") {
    throw new IcpProfileUpdateValidationError("ICP payload must be an object.");
  }

  const payload = input as Record<string, unknown>;
  const sourceSummary = validateRequiredText(String(payload.sourceSummary ?? ""), "Source summary");

  return {
    targetIndustries: validateList(payload.targetIndustries, "targetIndustries"),
    companySizeBands: validateList(payload.companySizeBands, "companySizeBands"),
    buyerRoles: validateList(payload.buyerRoles, "buyerRoles"),
    pains: validateList(payload.pains, "pains"),
    exclusions: validateList(payload.exclusions, "exclusions"),
    valuePropAngles: validateList(payload.valuePropAngles, "valuePropAngles"),
    sourceSummary,
  };
}

export async function updateIcpProfileForWorkspace(input: {
  workspaceId: string;
  icpProfileId: string;
  profileName?: string | null;
  icp: unknown;
}) {
  const workspaceId = validateRequiredText(input.workspaceId, "Workspace id");
  const icpProfileId = validateRequiredText(input.icpProfileId, "ICP profile id");
  const profileName = validateProfileName(input.profileName);
  const icp = validateIcpDraft(input.icp);

  const existingProfile = await prisma.icpProfile.findUnique({
    where: {
      id: icpProfileId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!existingProfile || existingProfile.workspaceId !== workspaceId) {
    throw new IcpProfileUpdateNotFoundError("ICP profile not found.");
  }

  return prisma.icpProfile.update({
    where: {
      id: icpProfileId,
    },
    data: {
      ...(profileName ? { name: profileName } : {}),
      icp,
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      icp: true,
      updatedAt: true,
    },
  });
}
