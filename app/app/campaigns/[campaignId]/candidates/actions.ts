"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  CandidateReviewNotFoundError,
  CandidateReviewValidationError,
  approveCandidatesToLeadsForWorkspace,
  rejectCandidatesForWorkspace,
} from "@/lib/sources/candidate-review";

type CandidateBulkActionResult = {
  ok: boolean;
  processedCount: number;
  skippedCount: number;
  error?: string;
};

async function resolveWorkspace() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    throw new CandidateReviewValidationError("Unauthorized.");
  }

  try {
    return await getPrimaryWorkspaceForUserEmail(userEmail);
  } catch (error) {
    if (error instanceof PrimaryWorkspaceLookupError) {
      throw new CandidateReviewValidationError("Workspace not found.");
    }

    throw error;
  }
}

function normalizeCandidateIds(candidateIds: string[]): string[] {
  return candidateIds.map((candidateId) => candidateId.trim()).filter(Boolean);
}

export async function approveCandidatesAction(input: {
  campaignId: string;
  candidateIds: string[];
}): Promise<CandidateBulkActionResult> {
  try {
    const workspace = await resolveWorkspace();
    const candidateIds = normalizeCandidateIds(input.candidateIds);

    const result = await approveCandidatesToLeadsForWorkspace({
      workspaceId: workspace.workspaceId,
      campaignId: input.campaignId,
      candidateIds,
    });

    revalidatePath(`/app/campaigns/${input.campaignId}/candidates`);
    revalidatePath(`/app/campaigns/${input.campaignId}/leads`);

    return {
      ok: true,
      processedCount: result.processedCount,
      skippedCount: result.skippedCount,
    };
  } catch (error) {
    if (error instanceof CandidateReviewValidationError || error instanceof CandidateReviewNotFoundError) {
      return {
        ok: false,
        processedCount: 0,
        skippedCount: 0,
        error: error.message,
      };
    }

    return {
      ok: false,
      processedCount: 0,
      skippedCount: 0,
      error: "Failed to approve candidates.",
    };
  }
}

export async function rejectCandidatesAction(input: {
  campaignId: string;
  candidateIds: string[];
}): Promise<CandidateBulkActionResult> {
  try {
    const workspace = await resolveWorkspace();
    const candidateIds = normalizeCandidateIds(input.candidateIds);

    const result = await rejectCandidatesForWorkspace({
      workspaceId: workspace.workspaceId,
      campaignId: input.campaignId,
      candidateIds,
    });

    revalidatePath(`/app/campaigns/${input.campaignId}/candidates`);

    return {
      ok: true,
      processedCount: result.processedCount,
      skippedCount: result.skippedCount,
    };
  } catch (error) {
    if (error instanceof CandidateReviewValidationError || error instanceof CandidateReviewNotFoundError) {
      return {
        ok: false,
        processedCount: 0,
        skippedCount: 0,
        error: error.message,
      };
    }

    return {
      ok: false,
      processedCount: 0,
      skippedCount: 0,
      error: "Failed to reject candidates.",
    };
  }
}
