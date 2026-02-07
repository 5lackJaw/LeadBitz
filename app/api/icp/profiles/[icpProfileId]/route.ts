import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  IcpProfileUpdateNotFoundError,
  IcpProfileUpdateValidationError,
  updateIcpProfileForWorkspace,
} from "@/lib/icp/update-icp-profile";

type RouteContext = {
  params: Promise<{
    icpProfileId: string;
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

  const { icpProfileId } = await context.params;

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
    profileName: string;
    icp: unknown;
  }>;

  try {
    const updated = await updateIcpProfileForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      icpProfileId,
      profileName: payload.profileName,
      icp: payload.icp,
    });

    return NextResponse.json({
      icpProfileId: updated.id,
      profileName: updated.name,
      icp: updated.icp,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof IcpProfileUpdateValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof IcpProfileUpdateNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to persist ICP edits." }, { status: 500 });
  }
}
