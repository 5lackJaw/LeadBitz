import { CandidateStatus, CandidateVerificationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_BULK_CANDIDATE_IDS = 500;

export const CandidateApprovalRejectionReason = {
  CANDIDATE_NOT_FOUND: "CANDIDATE_NOT_FOUND",
  STATUS_NOT_NEW: "STATUS_NOT_NEW",
  INVALID_EMAIL: "INVALID_EMAIL",
  UNVERIFIED_EMAIL: "UNVERIFIED_EMAIL",
} as const;

export type CandidateApprovalRejectionReasonValue =
  (typeof CandidateApprovalRejectionReason)[keyof typeof CandidateApprovalRejectionReason];

export type CandidateApprovalRejection = {
  candidateId: string;
  reason: CandidateApprovalRejectionReasonValue;
};

export class CandidateApprovalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateApprovalValidationError";
  }
}

export class CandidateApprovalNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateApprovalNotFoundError";
  }
}

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new CandidateApprovalValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeCandidateIds(candidateIds: string[]): string[] {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new CandidateApprovalValidationError("candidateIds must include at least one id.");
  }

  if (candidateIds.length > MAX_BULK_CANDIDATE_IDS) {
    throw new CandidateApprovalValidationError(`candidateIds cannot exceed ${MAX_BULK_CANDIDATE_IDS} per request.`);
  }

  return [...new Set(candidateIds.map((value) => value.trim()).filter(Boolean))];
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
    throw new CandidateApprovalNotFoundError("Campaign not found.");
  }
}

function buildRejectionMap(input: {
  requestedCandidateIds: string[];
  candidates: Array<{
    id: string;
    status: CandidateStatus;
    verificationStatus: CandidateVerificationStatus;
  }>;
  allowUnverified: boolean;
}): Map<string, CandidateApprovalRejectionReasonValue> {
  const candidateById = new Map(input.candidates.map((candidate) => [candidate.id, candidate]));
  const rejectionById = new Map<string, CandidateApprovalRejectionReasonValue>();

  for (const candidateId of input.requestedCandidateIds) {
    const candidate = candidateById.get(candidateId);
    if (!candidate) {
      rejectionById.set(candidateId, CandidateApprovalRejectionReason.CANDIDATE_NOT_FOUND);
      continue;
    }

    if (candidate.status !== CandidateStatus.NEW) {
      rejectionById.set(candidateId, CandidateApprovalRejectionReason.STATUS_NOT_NEW);
      continue;
    }

    if (candidate.verificationStatus === CandidateVerificationStatus.INVALID) {
      rejectionById.set(candidateId, CandidateApprovalRejectionReason.INVALID_EMAIL);
      continue;
    }

    if (!input.allowUnverified && candidate.verificationStatus !== CandidateVerificationStatus.VERIFIED) {
      rejectionById.set(candidateId, CandidateApprovalRejectionReason.UNVERIFIED_EMAIL);
      continue;
    }
  }

  return rejectionById;
}

export async function approveCandidatesWithRulesForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  candidateIds: string[];
  allowUnverified?: boolean;
  confirmAllowUnverified?: boolean;
}): Promise<{
  approvedCount: number;
  rejected: CandidateApprovalRejection[];
}> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const candidateIds = normalizeCandidateIds(input.candidateIds);
  const allowUnverified = input.allowUnverified === true;

  if (allowUnverified && input.confirmAllowUnverified !== true) {
    throw new CandidateApprovalValidationError(
      "confirmAllowUnverified=true is required when allowUnverified=true.",
    );
  }

  await assertCampaignInWorkspace({
    workspaceId,
    campaignId,
  });

  const candidates = await prisma.candidate.findMany({
    where: {
      workspaceId,
      campaignId,
      id: {
        in: candidateIds,
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      companyName: true,
      companyDomain: true,
      status: true,
      verificationStatus: true,
    },
  });

  const rejectionById = buildRejectionMap({
    requestedCandidateIds: candidateIds,
    candidates,
    allowUnverified,
  });

  const approvedCandidates = candidates.filter((candidate) => !rejectionById.has(candidate.id));

  await prisma.$transaction(async (tx) => {
    for (const candidate of approvedCandidates) {
      const lead = await tx.lead.upsert({
        where: {
          workspaceId_email: {
            workspaceId,
            email: candidate.email,
          },
        },
        create: {
          workspaceId,
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          title: candidate.title,
          companyName: candidate.companyName,
          companyDomain: candidate.companyDomain,
          metadata: {
            approvedFromCandidateId: candidate.id,
          } satisfies Prisma.InputJsonValue,
        },
        update: {
          firstName: candidate.firstName ?? undefined,
          lastName: candidate.lastName ?? undefined,
          title: candidate.title ?? undefined,
          companyName: candidate.companyName ?? undefined,
          companyDomain: candidate.companyDomain ?? undefined,
        },
      });

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
    }

    if (approvedCandidates.length > 0) {
      await tx.candidate.updateMany({
        where: {
          workspaceId,
          campaignId,
          id: {
            in: approvedCandidates.map((candidate) => candidate.id),
          },
        },
        data: {
          status: CandidateStatus.APPROVED,
        },
      });
    }
  });

  const rejected = candidateIds
    .filter((candidateId) => rejectionById.has(candidateId))
    .map((candidateId) => ({
      candidateId,
      reason: rejectionById.get(candidateId) as CandidateApprovalRejectionReasonValue,
    }));

  return {
    approvedCount: approvedCandidates.length,
    rejected,
  };
}
