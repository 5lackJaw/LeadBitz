import Link from "next/link";

import { ScreenScaffold, SkeletonList, SkeletonMetricGrid, SkeletonSurface } from "../../_components/screen-skeleton";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;

  return (
    <ScreenScaffold
      description="Lead detail placeholder preserving the canonical lead detail route contract."
      rightRail={
        <SkeletonSurface description="Context summary placeholder." title="Lead context">
          <SkeletonMetricGrid labels={["Verification", "Suppression", "Replies", "Last touch"]} />
        </SkeletonSurface>
      }
      title="Lead detail"
    >
      <SkeletonSurface description={`Lead ID: ${leadId}`} title="Profile">
        <SkeletonList rows={5} />
      </SkeletonSurface>

      <SkeletonSurface description="Timeline and provenance placeholder." title="Activity">
        <SkeletonList rows={6} />
      </SkeletonSurface>

      <SkeletonSurface description="Return path to leads list." title="Navigation">
        <Link className="lb-lead-row-link" href="/app/leads">
          Back to leads list
        </Link>
      </SkeletonSurface>
    </ScreenScaffold>
  );
}
