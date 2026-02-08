import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { getPrimaryWorkspaceForUserEmail } from "@/lib/auth/get-primary-workspace";
import { getCampaignOverviewForWorkspace } from "@/lib/campaigns/campaign-crud";
import { prisma } from "@/lib/prisma";
import { listCampaignCandidatesForWorkspace } from "@/lib/sources/candidates";

import { CandidatesReviewClient } from "./candidates-review-client";

type CampaignCandidatesPageProps = {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function normalizeFilters(searchParams: Record<string, string | string[] | undefined>) {
  const verificationStatus = normalizeSingleValue(searchParams.verificationStatus);
  const role = normalizeSingleValue(searchParams.role);
  const sourceRunId = normalizeSingleValue(searchParams.sourceRunId);
  const confidenceMin = normalizeSingleValue(searchParams.confidenceMin);
  const cursor = normalizeSingleValue(searchParams.cursor);
  const pageSizeRaw = normalizeSingleValue(searchParams.pageSize);
  const pageSize = pageSizeRaw ? Number.parseInt(pageSizeRaw, 10) : 25;

  return {
    verificationStatus,
    role,
    sourceRunId,
    confidenceMin,
    cursor,
    pageSize: Number.isNaN(pageSize) ? 25 : pageSize,
  };
}

export default async function CampaignCandidatesPage({ params, searchParams }: CampaignCandidatesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const workspace = await getPrimaryWorkspaceForUserEmail(session.user.email);
  const { campaignId } = await params;
  const filters = normalizeFilters(await searchParams);

  const campaign = await getCampaignOverviewForWorkspace({ workspaceId: workspace.workspaceId, campaignId });
  const page = await listCampaignCandidatesForWorkspace({
    workspaceId: workspace.workspaceId,
    campaignId,
    filters: {
      verificationStatus: filters.verificationStatus as
        | "VERIFIED"
        | "RISKY"
        | "INVALID"
        | "UNKNOWN"
        | undefined,
      role: filters.role,
      sourceRunId: filters.sourceRunId,
      confidenceMin: filters.confidenceMin ? Number.parseFloat(filters.confidenceMin) : undefined,
    },
    pageSize: filters.pageSize,
    cursor: filters.cursor,
  });

  const sourceRuns = await prisma.sourceRun.findMany({
    where: {
      workspaceId: workspace.workspaceId,
      campaignId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      runLabel: true,
    },
  });

  return (
    <main className="lb-page">
      <section className="lb-container">
        <header className="lb-row">
          <div>
            <h1 className="lb-title">Candidates Review</h1>
            <p className="lb-subtitle">Campaign: {campaign.name}</p>
          </div>
          <Link href={`/app/campaigns/${campaign.id}`} className="lb-link">
            Back to overview
          </Link>
        </header>

        <section className="lb-panel">
          <p className="lb-subtitle">Filter candidates, then bulk approve to leads or reject records before sequencing.</p>
        </section>

        <CandidatesReviewClient
          campaignId={campaign.id}
          initialItems={page.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            location: item.locationJson,
          }))}
          initialPageInfo={page.pageInfo}
          initialFilters={{
            verificationStatus: filters.verificationStatus,
            role: filters.role,
            sourceRunId: filters.sourceRunId,
            confidenceMin: filters.confidenceMin,
          }}
          sourceRuns={sourceRuns}
        />
      </section>
    </main>
  );
}
