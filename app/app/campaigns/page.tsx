import {
  ScreenScaffold,
  SkeletonList,
  SkeletonMetricGrid,
  SkeletonSurface,
  SkeletonTable,
} from "../_components/screen-skeleton";

export default function CampaignsPage() {
  return (
    <ScreenScaffold
      description="Campaign list skeleton with table-first operations and contextual acceleration surfaces."
      rightRail={
        <>
          <SkeletonSurface description="Campaign KPI placeholders." title="Campaign summary">
            <SkeletonMetricGrid labels={["Draft", "Active", "Paused", "Needs setup"]} />
          </SkeletonSurface>
          <SkeletonSurface description="Non-primary contextual shortcuts placeholder." title="Quick actions">
            <SkeletonList rows={3} />
          </SkeletonSurface>
        </>
      }
      title="Campaigns"
    >
      <SkeletonSurface
        description="Primary campaign list table placeholder and empty-state scaffold."
        title="Campaign list"
      >
        <SkeletonTable columns={["Campaign", "Status", "Inbox", "Updated", "Next action"]} rows={8} />
      </SkeletonSurface>
    </ScreenScaffold>
  );
}
