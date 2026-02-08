import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  CandidateApprovalNotFoundError,
  CandidateApprovalValidationError,
  approveCandidatesWithRulesForWorkspace,
} from "@/lib/sources/candidate-approval";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type ApproveCandidatesRequestBody = {
  candidateIds?: unknown;
  allowUnverified?: unknown;
  confirmAllowUnverified?: unknown;
};

async function resolveSessionWorkspace(userEmail: string) {
  try {
    return await getPrimaryWorkspaceForUserEmail(userEmail);
  } catch (error) {
    if (error instanceof PrimaryWorkspaceLookupError) {
      if (error.code === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to resolve workspace." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const { campaignId } = await context.params;

  let parsedBody: ApproveCandidatesRequestBody;
  try {
    parsedBody = (await request.json()) as ApproveCandidatesRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  if (!Array.isArray(parsedBody.candidateIds) || !parsedBody.candidateIds.every((value) => typeof value === "string")) {
    return NextResponse.json({ error: "candidateIds must be an array of strings." }, { status: 400 });
  }

  if (parsedBody.allowUnverified !== undefined && typeof parsedBody.allowUnverified !== "boolean") {
    return NextResponse.json({ error: "allowUnverified must be a boolean when provided." }, { status: 400 });
  }

  if (parsedBody.confirmAllowUnverified !== undefined && typeof parsedBody.confirmAllowUnverified !== "boolean") {
    return NextResponse.json({ error: "confirmAllowUnverified must be a boolean when provided." }, { status: 400 });
  }

  try {
    const result = await approveCandidatesWithRulesForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      candidateIds: parsedBody.candidateIds,
      allowUnverified: parsedBody.allowUnverified as boolean | undefined,
      confirmAllowUnverified: parsedBody.confirmAllowUnverified as boolean | undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof CandidateApprovalValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof CandidateApprovalNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to approve candidates." }, { status: 500 });
  }
}
