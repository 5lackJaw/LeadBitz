import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  SourceConnectorDisabledError,
  SourceConnectorNotFoundError,
  SourceRunNotFoundError,
  SourceRunValidationError,
  createDiscoveryRunForWorkspace,
} from "@/lib/sources/source-runs";

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

type CreateDiscoveryRunRequestBody = {
  connectorId?: unknown;
  icpProfileId?: unknown;
  filters?: unknown;
  limit?: unknown;
  runLabel?: unknown;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  let parsedBody: CreateDiscoveryRunRequestBody;
  try {
    parsedBody = (await request.json()) as CreateDiscoveryRunRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  if (typeof parsedBody.connectorId !== "string") {
    return NextResponse.json({ error: "connectorId must be a string." }, { status: 400 });
  }

  if (parsedBody.icpProfileId !== undefined && typeof parsedBody.icpProfileId !== "string") {
    return NextResponse.json({ error: "icpProfileId must be a string when provided." }, { status: 400 });
  }

  if (parsedBody.limit !== undefined && typeof parsedBody.limit !== "number") {
    return NextResponse.json({ error: "limit must be a number when provided." }, { status: 400 });
  }

  if (parsedBody.runLabel !== undefined && typeof parsedBody.runLabel !== "string") {
    return NextResponse.json({ error: "runLabel must be a string when provided." }, { status: 400 });
  }

  const { campaignId } = await context.params;

  try {
    const sourceRun = await createDiscoveryRunForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      connectorId: parsedBody.connectorId,
      icpProfileId: parsedBody.icpProfileId as string | undefined,
      filters: parsedBody.filters,
      limit: parsedBody.limit as number | undefined,
      runLabel: parsedBody.runLabel as string | undefined,
    });

    return NextResponse.json(
      {
        sourceRunId: sourceRun.id,
        status: sourceRun.status,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SourceRunValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SourceRunNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof SourceConnectorDisabledError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof SourceConnectorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to create discovery run." }, { status: 500 });
  }
}
