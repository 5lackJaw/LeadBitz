import { CandidateStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const MAX_BULK_CANDIDATE_IDS = 500;

export class CandidateReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateReviewValidationError";
  }
}

export class CandidateReviewNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateReviewNotFoundError";
  }
}

function normalizeRequiredId(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new CandidateReviewValidationError(`${fieldName} is required.`);
  }
  return normalized;
}

function normalizeCandidateIds(candidateIds: string[]): string[] {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new CandidateReviewValidationError("candidateIds must include at least one id.");
  }

  if (candidateIds.length > MAX_BULK_CANDIDATE_IDS) {
    throw new CandidateReviewValidationError(`candidateIds cannot exceed ${MAX_BULK_CANDIDATE_IDS} per request.`);
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
    throw new CandidateReviewNotFoundError("Campaign not found.");
  }
}

type ReviewResult = {
  processedCount: number;
  skippedCount: number;
};

export async function approveCandidatesToLeadsForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  candidateIds: string[];
}): Promise<ReviewResult> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const candidateIds = normalizeCandidateIds(input.candidateIds);

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
    },
  });

  if (candidates.length === 0) {
    return { processedCount: 0, skippedCount: candidateIds.length };
  }

  const approvableCandidates = candidates.filter((candidate) => candidate.status === CandidateStatus.NEW);
  const skippedCount = candidateIds.length - approvableCandidates.length;

  await prisma.$transaction(async (tx) => {
    for (const candidate of approvableCandidates) {
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

    if (approvableCandidates.length > 0) {
      await tx.candidate.updateMany({
        where: {
          id: {
            in: approvableCandidates.map((candidate) => candidate.id),
          },
          workspaceId,
          campaignId,
        },
        data: {
          status: CandidateStatus.APPROVED,
        },
      });
    }
  });

  return {
    processedCount: approvableCandidates.length,
    skippedCount,
  };
}

export async function rejectCandidatesForWorkspace(input: {
  workspaceId: string;
  campaignId: string;
  candidateIds: string[];
}): Promise<ReviewResult> {
  const workspaceId = normalizeRequiredId(input.workspaceId, "workspaceId");
  const campaignId = normalizeRequiredId(input.campaignId, "campaignId");
  const candidateIds = normalizeCandidateIds(input.candidateIds);

  await assertCampaignInWorkspace({
    workspaceId,
    campaignId,
  });

  const updateResult = await prisma.candidate.updateMany({
    where: {
      workspaceId,
      campaignId,
      id: {
        in: candidateIds,
      },
      status: CandidateStatus.NEW,
    },
    data: {
      status: CandidateStatus.REJECTED,
    },
  });

  return {
    processedCount: updateResult.count,
    skippedCount: candidateIds.length - updateResult.count,
  };
}
