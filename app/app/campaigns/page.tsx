import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { listCampaignsForWorkspace } from "@/lib/campaigns/campaign-crud";

import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const campaigns = await listCampaignsForWorkspace(workspace.workspaceId);

  return (
    <section className="lb-shell-stack">
      <header className="lb-row">
        <div>
          <p className="lb-subtitle">Workspace</p>
          <p>{workspace.workspaceName}</p>
        </div>
        <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
          <Link className="lb-link" href="/app/settings/inboxes">
            Inbox settings
          </Link>
          <Link className="lb-link" href="/app/settings/sources">
            Sources registry
          </Link>
        </div>
      </header>

      <CampaignsClient
        initialCampaigns={campaigns.map((campaign) => ({
          id: campaign.id,
          inboxConnectionId: campaign.inboxConnectionId,
          name: campaign.name,
          status: campaign.status,
          messagingRules: campaign.messagingRules,
          discoveryRules: campaign.discoveryRules,
          wizardState: campaign.wizardState,
          icpProfileId: campaign.icpProfileId,
          icpProfileName: campaign.icpProfileName,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        }))}
      />
    </section>
  );
}
