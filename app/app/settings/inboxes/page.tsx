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
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Inbox Settings</h1>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/app" className="lb-link">
              App home
            </Link>
            <Link href="/app/campaigns" className="lb-link">
              Campaigns
            </Link>
          </div>
        </header>

        {connected === "gmail" ? (
          <p className="lb-alert lb-alert-success" role="status">
            Google inbox connected successfully.
          </p>
        ) : null}

        {error ? (
          <p className="lb-alert lb-alert-danger" role="alert">
            Google connection failed: {error}
          </p>
        ) : null}

        <section className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Google Inbox
          </h2>
          {gmailConnection ? (
            <>
              <p style={{ marginTop: "8px" }}>
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
            <p className="lb-subtitle" style={{ marginTop: "12px" }}>
              Status: Not connected
            </p>
          )}
          <form action="/api/inboxes/google/connect" method="get" style={{ marginTop: "16px" }}>
            <button className="lb-button lb-button-secondary" type="submit">
              Connect Google Inbox
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
