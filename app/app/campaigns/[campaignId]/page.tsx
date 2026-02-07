import Link from "next/link";
import { getServerSession } from "next-auth";
import { InboxProvider } from "@prisma/client";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";
import { prisma } from "@/lib/prisma";

import { CampaignOverviewClient } from "./campaign-overview-client";

type CampaignOverviewPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function CampaignOverviewPage({ params }: CampaignOverviewPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const { campaignId } = await params;

  const campaign = await getCampaignOverviewForWorkspace({
    workspaceId: workspace.workspaceId,
    campaignId,
  });

  const inboxConnections = await prisma.inboxConnection.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      provider: InboxProvider.GMAIL,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      email: true,
      status: true,
    },
  });

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Campaign Overview</h1>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href="/app/campaigns" className="lb-link">
              Back to campaigns
            </Link>
            <Link href={`/app/campaigns/new?campaignId=${campaign.id}`} className="lb-link lb-link-accent">
              Resume wizard
            </Link>
          </div>
        </header>

        <CampaignOverviewClient
          campaign={{
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            inboxConnectionId: campaign.inboxConnectionId,
            inboxEmail: campaign.inboxEmail,
            messagingRules: campaign.messagingRules,
            discoveryRules: campaign.discoveryRules,
            icpProfileId: campaign.icpProfileId,
            icpProfileName: campaign.icpProfileName,
            icpSummary: campaign.icpSummary,
            updatedAt: campaign.updatedAt.toISOString(),
          }}
          inboxConnections={inboxConnections.map((inbox) => ({
            id: inbox.id,
            email: inbox.email,
            status: inbox.status,
          }))}
        />
      </section>
    </main>
  );
}
