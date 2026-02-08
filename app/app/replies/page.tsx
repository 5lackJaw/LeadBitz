import { ScreenScaffold, SkeletonList, SkeletonSurface } from "../_components/screen-skeleton";

export default function RepliesPage() {
  return (
    <ScreenScaffold
      description="Unified replies inbox skeleton with needs-response queue and thread workspace."
      rightRail={
        <SkeletonSurface description="Context-only summary placeholders." title="Reply categories">
          <SkeletonList rows={6} />
        </SkeletonSurface>
      }
      title="Replies"
    >
      <div className="lb-replies-layout">
        <SkeletonSurface description="Needs-response queue placeholder." title="Needs response">
          <SkeletonList rows={8} />
        </SkeletonSurface>

        <SkeletonSurface description="Thread view placeholder." title="Conversation thread">
          <SkeletonList rows={6} />
        </SkeletonSurface>
      </div>
    </ScreenScaffold>
  );
}
