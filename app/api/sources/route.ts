import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  SourceConnectorValidationError,
  createSourceConnectorForWorkspace,
  listSourceConnectorsForWorkspace,
} from "@/lib/sources/source-connectors";

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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  const sources = await listSourceConnectorsForWorkspace(workspaceResult.workspaceId);

  return NextResponse.json({
    sources: sources.map(toSourceConnectorPayload),
  });
}

type CreateSourceRequestBody = {
  type?: unknown;
  providerKey?: unknown;
  config?: unknown;
  allowedUsageNote?: unknown;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceResult = await resolveSessionWorkspace(session.user.email);
  if (workspaceResult instanceof NextResponse) {
    return workspaceResult;
  }

  let parsedBody: CreateSourceRequestBody;
  try {
    parsedBody = (await request.json()) as CreateSourceRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  if (typeof parsedBody.type !== "string") {
    return NextResponse.json({ error: "type must be a string." }, { status: 400 });
  }

  if (typeof parsedBody.providerKey !== "string") {
    return NextResponse.json({ error: "providerKey must be a string." }, { status: 400 });
  }

  if (
    parsedBody.allowedUsageNote !== undefined &&
    parsedBody.allowedUsageNote !== null &&
    typeof parsedBody.allowedUsageNote !== "string"
  ) {
    return NextResponse.json({ error: "allowedUsageNote must be a string when provided." }, { status: 400 });
  }

  try {
    const source = await createSourceConnectorForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      type: parsedBody.type,
      providerKey: parsedBody.providerKey,
      config: parsedBody.config,
      allowedUsageNote: parsedBody.allowedUsageNote,
    });

    return NextResponse.json(
      {
        source: toSourceConnectorPayload(source),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SourceConnectorValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create source connector." }, { status: 500 });
  }
}
