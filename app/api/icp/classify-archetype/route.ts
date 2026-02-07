import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  ProductArchetypeNotFoundError,
  ProductArchetypeValidationError,
  classifyProductArchetypeForWorkspace,
} from "@/lib/icp/classify-product-archetype";

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
    productProfile: unknown;
  }>;

  try {
    const result = await classifyProductArchetypeForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId: payload.campaignId ?? "",
      icpVersionId: payload.icpVersionId,
      productProfile: payload.productProfile,
    });

    return NextResponse.json(
      {
        classificationId: result.classificationId,
        campaignId: payload.campaignId,
        icpVersionId: payload.icpVersionId ?? null,
        archetypeKey: result.archetypeKey,
        confidence: result.confidence,
        evidence: result.evidence,
        decidedAt: result.decidedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ProductArchetypeValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ProductArchetypeNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to classify product archetype." }, { status: 500 });
  }
}
