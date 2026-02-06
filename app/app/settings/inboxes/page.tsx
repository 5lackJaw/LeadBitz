import Link from "next/link";
import { getServerSession } from "next-auth";
import { InboxProvider } from "@prisma/client";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { prisma } from "@/lib/prisma";

import { InboxSettingsForm } from "./inbox-settings-form";

type InboxesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export default async function InboxesSettingsPage({ searchParams }: InboxesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const params = searchParams ? await searchParams : {};

  const connected = getSingleParam(params, "connected");
  const error = getSingleParam(params, "error");

  const gmailConnection = await prisma.inboxConnection.findFirst({
    where: {
      workspaceId: workspace.workspaceId,
      provider: InboxProvider.GMAIL,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Inbox Settings</h1>
      <p>Workspace: {workspace.workspaceName}</p>

      {connected === "gmail" ? (
        <p style={{ color: "#166534" }}>Google inbox connected successfully.</p>
      ) : null}

      {error ? (
        <p style={{ color: "#b91c1c" }}>Google connection failed: {error}</p>
      ) : null}

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Google Inbox</h2>
        {gmailConnection ? (
          <>
            <p>
              Status: Connected as <strong>{gmailConnection.email}</strong>
            </p>
            <InboxSettingsForm
              inboxConnectionId={gmailConnection.id}
              dailySendCap={gmailConnection.dailySendCap}
              sendWindowStartHour={gmailConnection.sendWindowStartHour}
              sendWindowEndHour={gmailConnection.sendWindowEndHour}
              rampUpPerDay={gmailConnection.rampUpPerDay}
            />
          </>
        ) : (
          <p>Status: Not connected</p>
        )}
        <form action="/api/inboxes/google/connect" method="get">
          <button type="submit">Connect Google Inbox</button>
        </form>
      </section>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/app">Back to app</Link>
      </p>
    </main>
  );
}
