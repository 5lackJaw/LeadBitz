import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";
import { listIcpVersionsForCampaign } from "@/lib/icp/icp-center";

import { IcpCenterClient } from "./icp-center-client";

type IcpCenterPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function IcpCenterPage({ params }: IcpCenterPageProps) {
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

  const versions = await listIcpVersionsForCampaign({
    workspaceId: workspace.workspaceId,
    campaignId: campaign.id,
  });

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">ICP Center</h1>
            <p className="lb-subtitle">Campaign: {campaign.name}</p>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href={`/app/campaigns/${campaign.id}`} className="lb-link">
              Back to overview
            </Link>
            <Link href={`/app/campaigns/new?campaignId=${campaign.id}`} className="lb-link lb-link-accent">
              Open wizard
            </Link>
          </div>
        </header>

        {versions.length > 0 ? (
          <IcpCenterClient
            campaignId={campaign.id}
            versions={versions.map((version) => ({
              id: version.id,
              title: version.title,
              source: version.source,
              isActive: version.isActive,
              createdAt: version.createdAt.toISOString(),
              updatedAt: version.updatedAt.toISOString(),
              latestScore: version.latestScore
                ? {
                    id: version.latestScore.id,
                    score: version.latestScore.score,
                    tier: version.latestScore.tier,
                    computedAt: version.latestScore.computedAt.toISOString(),
                  }
                : null,
            }))}
          />
        ) : (
          <section className="lb-panel">
            <p className="lb-alert lb-alert-danger" role="alert">
              No ICP versions found for this campaign yet. Generate an ICP in the campaign wizard first.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
