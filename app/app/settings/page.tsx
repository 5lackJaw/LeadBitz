import Link from "next/link";

import { ScreenScaffold, SkeletonList, SkeletonMetricGrid, SkeletonSurface } from "../_components/screen-skeleton";

const SETTINGS_SECTIONS = [
  { href: "/app/settings/inboxes", label: "Inboxes" },
  { href: "/app/settings/deliverability", label: "Deliverability" },
  { href: "/app/settings/suppressions", label: "Suppressions" },
  { href: "/app/settings/sources", label: "Sources" },
  { href: "/app/settings/verification", label: "Verification" },
];

export default function SettingsPage() {
  return (
    <ScreenScaffold
      description="Workspace settings skeleton with section entry points and contextual status surfaces."
      rightRail={
        <>
          <SkeletonSurface description="Context summary placeholders." title="Workspace status">
            <SkeletonMetricGrid labels={["Connected inboxes", "Active sources", "Deliverability", "Suppression"]} />
          </SkeletonSurface>
          <SkeletonSurface description="Non-primary setup shortcuts placeholder." title="Setup shortcuts">
            <SkeletonList rows={3} />
          </SkeletonSurface>
        </>
      }
      title="Settings"
    >
      <SkeletonSurface description="Settings section navigation placeholders." title="Workspace controls">
        <ul className="lb-settings-section-list">
          {SETTINGS_SECTIONS.map((section) => (
            <li key={section.href}>
              <Link className="lb-settings-section-link" href={section.href}>
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </SkeletonSurface>
    </ScreenScaffold>
  );
}
