import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  SourceConnectorNotFoundError,
  SourceConnectorValidationError,
  updateSourceConnectorForWorkspace,
} from "@/lib/sources/source-connectors";

type RouteContext = {
  params: Promise<{
    sourceConnectorId: string;
  }>;
};

function toSourceConnectorPayload(sourceConnector: {
  id: string;
  type: string;
  providerKey: string;
  enabled: boolean;
  configJson: unknown;
  allowedUsageNote: string | null;
  lastHealthcheckAt: Date | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: sourceConnector.id,
    type: sourceConnector.type,
    providerKey: sourceConnector.providerKey,
    enabled: sourceConnector.enabled,
    config: sourceConnector.configJson ?? null,
    allowedUsageNote: sourceConnector.allowedUsageNote ?? null,
    lastHealthcheckAt: sourceConnector.lastHealthcheckAt?.toISOString() ?? null,
    lastErrorCode: sourceConnector.lastErrorCode ?? null,
    lastErrorMessage: sourceConnector.lastErrorMessage ?? null,
    createdAt: sourceConnector.createdAt.toISOString(),
    updatedAt: sourceConnector.updatedAt.toISOString(),
  };
}

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

type PatchSourceRequestBody = {
  type?: unknown;
  providerKey?: unknown;
  config?: unknown;
  allowedUsageNote?: unknown;
  enabled?: unknown;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  let parsedBody: PatchSourceRequestBody;
  try {
    parsedBody = (await request.json()) as PatchSourceRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  if (parsedBody.type !== undefined && typeof parsedBody.type !== "string") {
    return NextResponse.json({ error: "type must be a string when provided." }, { status: 400 });
  }

  if (parsedBody.providerKey !== undefined && typeof parsedBody.providerKey !== "string") {
    return NextResponse.json({ error: "providerKey must be a string when provided." }, { status: 400 });
  }

  if (
    parsedBody.allowedUsageNote !== undefined &&
    parsedBody.allowedUsageNote !== null &&
    typeof parsedBody.allowedUsageNote !== "string"
  ) {
    return NextResponse.json({ error: "allowedUsageNote must be a string when provided." }, { status: 400 });
  }

  if (parsedBody.enabled !== undefined && typeof parsedBody.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean when provided." }, { status: 400 });
  }

  const { sourceConnectorId } = await context.params;

  try {
    const source = await updateSourceConnectorForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      sourceConnectorId,
      type: parsedBody.type as string | undefined,
      providerKey: parsedBody.providerKey as string | undefined,
      config: parsedBody.config,
      allowedUsageNote: parsedBody.allowedUsageNote as string | null | undefined,
      enabled: parsedBody.enabled as boolean | undefined,
    });

    return NextResponse.json({
      source: toSourceConnectorPayload(source),
    });
  } catch (error) {
    if (error instanceof SourceConnectorValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SourceConnectorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update source connector." }, { status: 500 });
  }
}
