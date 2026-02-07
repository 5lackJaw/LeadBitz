import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";
import { prisma } from "@/lib/prisma";

import { SpecialistInterviewClient } from "./specialist-interview-client";

type SpecialistInterviewPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function SpecialistInterviewPage({ params }: SpecialistInterviewPageProps) {
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

  const activeIcpVersion = await prisma.icpVersion.findFirst({
    where: {
      workspaceId: workspace.workspaceId,
      campaignId: campaign.id,
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      source: true,
      updatedAt: true,
    },
  });

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Specialist ICP Interview</h1>
            <p className="lb-subtitle">Campaign: {campaign.name}</p>
            <p className="lb-subtitle">Workspace: {workspace.workspaceName}</p>
          </div>
          <div className="lb-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            <Link href={`/app/campaigns/${campaign.id}`} className="lb-link">
              Back to overview
            </Link>
            <Link href={`/app/campaigns/new?campaignId=${campaign.id}`} className="lb-link lb-link-accent">
              Back to wizard
            </Link>
          </div>
        </header>

        {activeIcpVersion ? (
          <SpecialistInterviewClient
            campaignId={campaign.id}
            baseIcpVersionId={activeIcpVersion.id}
            baseIcpVersionTitle={activeIcpVersion.title}
            baseIcpVersionSource={activeIcpVersion.source}
            baseIcpVersionUpdatedAt={activeIcpVersion.updatedAt.toISOString()}
          />
        ) : (
          <section className="lb-panel">
            <p className="lb-alert lb-alert-danger" role="alert">
              This campaign does not have an active ICP version yet. Generate an ICP draft in the wizard first.
            </p>
            <div style={{ marginTop: "12px" }}>
              <Link href={`/app/campaigns/new?campaignId=${campaign.id}`} className="lb-button lb-button-primary">
                Open campaign wizard
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
