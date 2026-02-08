import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  ManualImportNotFoundError,
  ManualImportValidationError,
  importManualLeadsForWorkspace,
} from "@/lib/leads/manual-import";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type ManualLeadPayload = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  title?: unknown;
  companyName?: unknown;
  companyDomain?: unknown;
};

type ManualImportRequestBody = {
  rows?: unknown;
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

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function normalizeRows(rows: unknown): Array<{
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
}> {
  if (!Array.isArray(rows)) {
    throw new ManualImportValidationError("rows must be an array.");
  }

  return rows.map((row, index) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new ManualImportValidationError(`rows[${index}] must be an object.`);
    }

    const payload = row as ManualLeadPayload;
    if (!isOptionalString(payload.email)) {
      throw new ManualImportValidationError(`rows[${index}].email must be a string when provided.`);
    }
    if (!isOptionalString(payload.firstName)) {
      throw new ManualImportValidationError(`rows[${index}].firstName must be a string when provided.`);
    }
    if (!isOptionalString(payload.lastName)) {
      throw new ManualImportValidationError(`rows[${index}].lastName must be a string when provided.`);
    }
    if (!isOptionalString(payload.title)) {
      throw new ManualImportValidationError(`rows[${index}].title must be a string when provided.`);
    }
    if (!isOptionalString(payload.companyName)) {
      throw new ManualImportValidationError(`rows[${index}].companyName must be a string when provided.`);
    }
    if (!isOptionalString(payload.companyDomain)) {
      throw new ManualImportValidationError(`rows[${index}].companyDomain must be a string when provided.`);
    }

    return {
      email: payload.email ?? undefined,
      firstName: payload.firstName ?? undefined,
      lastName: payload.lastName ?? undefined,
      title: payload.title ?? undefined,
      companyName: payload.companyName ?? undefined,
      companyDomain: payload.companyDomain ?? undefined,
    };
  });
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

  let parsedBody: ManualImportRequestBody;
  try {
    parsedBody = (await request.json()) as ManualImportRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const { campaignId } = await context.params;

  try {
    const rows = normalizeRows(parsedBody.rows);
    const result = await importManualLeadsForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      rows,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ManualImportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ManualImportNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to import manual leads." }, { status: 500 });
  }
}
