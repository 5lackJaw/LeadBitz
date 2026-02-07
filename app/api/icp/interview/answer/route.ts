import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import {
  PrimaryWorkspaceLookupError,
  getPrimaryWorkspaceForUserEmail,
} from "@/lib/auth/get-primary-workspace";
import {
  SpecialistInterviewNotFoundError,
  SpecialistInterviewValidationError,
  answerSpecialistInterviewSession,
} from "@/lib/icp/specialist-interview";

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
    sessionId: string;
    answers: unknown;
  }>;

  try {
    const result = await answerSpecialistInterviewSession({
      workspaceId: workspaceResult.workspaceId,
      sessionId: payload.sessionId ?? "",
      answers: payload.answers ?? {},
    });

    return NextResponse.json({
      nextQuestions: result.nextQuestions,
      done: result.done,
    });
  } catch (error) {
    if (error instanceof SpecialistInterviewValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SpecialistInterviewNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to save interview answers." }, { status: 500 });
  }
}
