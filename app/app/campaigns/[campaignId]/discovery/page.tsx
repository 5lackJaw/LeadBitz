import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";

type CampaignDiscoveryPageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDiscoveryPage({ params }: CampaignDiscoveryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const { campaignId } = await params;
  const campaign = await getCampaignOverviewForWorkspace({ workspaceId: workspace.workspaceId, campaignId });

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Lead Discovery</h1>
            <p className="lb-subtitle">Campaign: {campaign.name}</p>
          </div>
          <Link href={`/app/campaigns/${campaign.id}`} className="lb-link">
            Back to overview
          </Link>
        </header>

        <section className="lb-panel">
          <p className="lb-subtitle">
            Discovery configuration and run management will be implemented in Phase 5.
          </p>
        </section>
      </section>
    </main>
  );
}
