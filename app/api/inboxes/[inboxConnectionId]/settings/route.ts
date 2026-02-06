import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/auth";
import { requireWorkspaceAccess } from "@/lib/auth/require-workspace-access";
import {
  InboxSettingsValidationError,
  updateInboxSendingSettings,
  validateInboxSendingSettings,
} from "@/lib/inbox/inbox-settings";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    inboxConnectionId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inboxConnectionId } = await context.params;

  if (!inboxConnectionId?.trim()) {
    return NextResponse.json({ error: "Inbox connection id is required." }, { status: 400 });
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
    dailySendCap: number;
    sendWindowStartHour: number;
    sendWindowEndHour: number;
    rampUpPerDay: number;
  }>;

  let settings;
  try {
    settings = validateInboxSendingSettings({
      dailySendCap: Number(payload.dailySendCap),
      sendWindowStartHour: Number(payload.sendWindowStartHour),
      sendWindowEndHour: Number(payload.sendWindowEndHour),
      rampUpPerDay: Number(payload.rampUpPerDay),
    });
  } catch (error) {
    if (error instanceof InboxSettingsValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const connection = await prisma.inboxConnection.findUnique({
    where: { id: inboxConnectionId },
    select: {
      workspaceId: true,
    },
  });

  if (!connection) {
    return NextResponse.json({ error: "Inbox connection not found." }, { status: 404 });
  }

  try {
    await requireWorkspaceAccess({
      workspaceId: connection.workspaceId,
      userEmail: session.user.email,
    });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await updateInboxSendingSettings({
      inboxConnectionId,
      ...settings,
    });

    return NextResponse.json({
      inboxConnectionId: updated.id,
      dailySendCap: updated.dailySendCap,
      sendWindowStartHour: updated.sendWindowStartHour,
      sendWindowEndHour: updated.sendWindowEndHour,
      rampUpPerDay: updated.rampUpPerDay,
    });
  } catch (error) {
    if (error instanceof InboxSettingsValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update inbox settings." }, { status: 500 });
  }
}
