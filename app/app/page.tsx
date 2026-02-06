import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

import { SignOutButton } from "./sign-out-button";

export default async function AppShellPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="lb-page">
      <section className="lb-container">
        <div className="lb-panel">
          <div className="lb-row">
            <div>
              <h1 className="lb-title">LeadBitz App</h1>
              <p className="lb-subtitle">Signed in as {session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>

        <div className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Navigate
          </h2>
          <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
            <Link className="lb-link lb-link-accent" href="/app/campaigns">
              Campaigns
            </Link>
            <Link className="lb-link lb-link-accent" href="/app/settings/inboxes">
              Inbox settings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
