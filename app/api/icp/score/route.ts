import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  IcpScoringNotFoundError,
  IcpScoringValidationError,
  scoreIcpVersionForWorkspace,
} from "@/lib/icp/score-icp-version";

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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const payload = parsedBody as Partial<{
    campaignId: string;
    icpVersionId: string;
  }>;

  try {
    const scored = await scoreIcpVersionForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId: payload.campaignId ?? "",
      icpVersionId: payload.icpVersionId ?? "",
    });

    return NextResponse.json(
      {
        icpQualityScoreId: scored.icpQualityScoreId,
        campaignId: payload.campaignId,
        icpVersionId: payload.icpVersionId,
        score: scored.score,
        tier: scored.tier,
        breakdown: scored.breakdown,
        missingFields: scored.missingFields,
        explanations: scored.explanations,
        questions: scored.questions,
        computedAt: scored.computedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof IcpScoringValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof IcpScoringNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to score ICP version." }, { status: 500 });
  }
}
