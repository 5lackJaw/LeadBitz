import { CampaignStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { listCampaignsForWorkspace } from "@/lib/campaigns/campaign-crud";

function countCampaignsByStatus(statuses: CampaignStatus[], target: CampaignStatus) {
  return statuses.filter((status) => status === target).length;
}

export default async function AppHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const campaigns = await listCampaignsForWorkspace(workspace.workspaceId);
  const statuses = campaigns.map((campaign) => campaign.status);

  const activeCount = countCampaignsByStatus(statuses, CampaignStatus.ACTIVE);
  const draftCount = countCampaignsByStatus(statuses, CampaignStatus.DRAFT);
  const pausedCount = countCampaignsByStatus(statuses, CampaignStatus.PAUSED);

  return (
    <section className="lb-shell-stack">
      <section className="lb-panel">
        <div className="lb-row">
          <div>
            <h1 className="lb-title">LeadBitz App</h1>
            <p className="lb-subtitle">
              Workspace: {workspace.workspaceName}
              {" | "}
              {session.user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="lb-kpi-grid">
        <article className="lb-panel">
          <p className="lb-subtitle">Total campaigns</p>
          <p className="lb-title">{campaigns.length}</p>
        </article>
        <article className="lb-panel">
          <p className="lb-subtitle">Active</p>
          <p className="lb-title">{activeCount}</p>
        </article>
        <article className="lb-panel">
          <p className="lb-subtitle">Draft</p>
          <p className="lb-title">{draftCount}</p>
        </article>
        <article className="lb-panel">
          <p className="lb-subtitle">Paused</p>
          <p className="lb-title">{pausedCount}</p>
        </article>
      </section>

      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Quick actions
        </h2>
        <div className="lb-shell-link-grid">
          <Link className="lb-link lb-link-accent" href="/app/campaigns">
            View campaigns
          </Link>
          <Link className="lb-link lb-link-accent" href="/app/campaigns/new">
            Open wizard
          </Link>
          <Link className="lb-link lb-link-accent" href="/app/settings">
            Workspace settings
          </Link>
        </div>
      </section>
    </section>
  );
}
