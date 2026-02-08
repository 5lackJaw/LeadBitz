import { ScreenScaffold, SkeletonList, SkeletonMetricGrid, SkeletonSurface, SkeletonTable } from "./screen-skeleton";

export function DashboardScreen() {
  return (
    <ScreenScaffold
      description="Operational priority dashboard skeleton with primary workflow surfaces and contextual acceleration panels."
      title="Dashboard"
    >
      <div className="lb-dashboard-layout">
        <div className="lb-dashboard-primary-column">
          <SkeletonSurface
            description="Primary operational table placeholder."
            title="Campaign and lead operations"
          >
            <SkeletonTable columns={["Campaign", "Stage", "Queue", "Risk", "Last activity"]} rows={6} />
          </SkeletonSurface>

          <SkeletonSurface description="Operational health and system state placeholder." title="Operational health">
            <SkeletonList rows={4} />
          </SkeletonSurface>
        </div>

        <div className="lb-dashboard-secondary-column">
          <SkeletonSurface description="KPI summary tile placeholders." title="KPI summary">
            <SkeletonMetricGrid labels={["Queued", "Sent", "Replies", "Bounce risk"]} />
          </SkeletonSurface>

          <SkeletonSurface description="Activity visualization placeholder." title="Activity">
            <div className="lb-skeleton-chart" role="presentation" />
          </SkeletonSurface>

          <SkeletonSurface description="Secondary action shortcuts placeholder." title="Quick actions">
            <SkeletonList rows={3} />
          </SkeletonSurface>
        </div>
      </div>
    </ScreenScaffold>
  );
}
