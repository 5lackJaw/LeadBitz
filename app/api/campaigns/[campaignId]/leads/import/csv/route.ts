import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import { CsvImportNotFoundError, CsvImportValidationError, importCsvLeadsForWorkspace } from "@/lib/leads/csv-import";

type RouteContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

type CsvImportRequestBody = {
  csvText?: unknown;
  columnMapping?: unknown;
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

  let parsedBody: CsvImportRequestBody;
  try {
    parsedBody = (await request.json()) as CsvImportRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!parsedBody || typeof parsedBody !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  if (typeof parsedBody.csvText !== "string") {
    return NextResponse.json({ error: "csvText must be a string." }, { status: 400 });
  }

  if (
    parsedBody.columnMapping !== undefined &&
    (parsedBody.columnMapping === null || typeof parsedBody.columnMapping !== "object" || Array.isArray(parsedBody.columnMapping))
  ) {
    return NextResponse.json({ error: "columnMapping must be an object when provided." }, { status: 400 });
  }

  const { campaignId } = await context.params;

  try {
    const result = await importCsvLeadsForWorkspace({
      workspaceId: workspaceResult.workspaceId,
      campaignId,
      csvText: parsedBody.csvText,
      columnMapping: parsedBody.columnMapping as Record<string, string> | undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof CsvImportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof CsvImportNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to import CSV leads." }, { status: 500 });
  }
}
