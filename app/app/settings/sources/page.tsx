import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";

export default async function SourcesSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Sources Registry</h1>
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

        <section className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Connector Governance Stub
          </h2>
          <p className="lb-subtitle" style={{ marginTop: "8px" }}>
            This screen is the placeholder registry for licensed lead sources. Connector CRUD and health checks will
            be implemented in Phase 5.
          </p>

          <div className="lb-table-wrap" style={{ marginTop: "16px" }}>
            <table className="lb-table">
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Enabled</th>
                  <th scope="col">Allowed usage note</th>
                  <th scope="col">Last status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>People Data Labs (planned)</td>
                  <td>
                    <span className="lb-status lb-status-warning">Disabled</span>
                  </td>
                  <td>Discovery only. Export/reuse policy enforced by provider terms.</td>
                  <td>
                    <span className="lb-status lb-status-info">Not configured</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
