import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  IcpCenterNotFoundError,
  IcpCenterValidationError,
  setActiveIcpVersionForCampaign,
} from "@/lib/icp/icp-center";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
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

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const { campaignId } = await context.params;

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
    icpVersionId: string;
  }>;

  try {
    await setActiveIcpVersionForCampaign({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      icpVersionId: payload.icpVersionId ?? "",
    });

    return NextResponse.json({
      campaignId,
      icpVersionId: payload.icpVersionId,
      status: "ok",
    });
  } catch (error) {
    if (error instanceof IcpCenterValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof IcpCenterNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update active ICP version." }, { status: 500 });
  }
}
