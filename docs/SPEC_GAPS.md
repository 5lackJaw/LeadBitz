# SPEC_GAPS.md - Product Decisions Ledger

## GAP-001: Dashboard canonical route is ambiguous (`/app` vs `/app/dashboard`)
Status: RESOLVED (2026-02-08)
Observed in: `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/UX_SPEC.md` IA route list, `app/app/page.tsx`, `app/app/dashboard/page.tsx`
Why it matters:
- Global navigation requires a Dashboard domain, but route canon is unclear for deep links, active-nav state, and redirect behavior.
Constraints / must-not-break:
- Must preserve required global nav item `Dashboard` (SHELL-005/SHELL-018).
- Must keep all authenticated routes inside canonical `/app/*` shell (SHELL-001).
- Must avoid breaking existing `/app` entry links/auth redirects.
Candidate decisions:
- Make `/app` the canonical Dashboard route and remove `/app/dashboard`.
- Make `/app/dashboard` canonical and keep `/app` as redirect-only.
- Support both, but define one canonical path and enforce redirect from the other.
Spec file(s) that must be updated to resolve it:
- `docs/UX_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/COVERAGE_MATRIX.md`

---

## GAP-002: Leads global domain route is ambiguous (list route missing)
Status: RESOLVED (2026-02-08)
Observed in: `docs/UX_SPEC.md` (`/app/leads/:leadId` only), `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `app/app/leads/page.tsx`, `app/app/_components/app-shell.constants.ts`
Why it matters:
- Global nav must include Leads, but no canonical leads-list route is defined; navigation target and expected screen contract are unclear.
Constraints / must-not-break:
- Must preserve required global nav item `Leads` (SHELL-005/SHELL-018).
- Must preserve lead-detail route contract at `/app/leads/:leadId`.
- Must keep route behavior deterministic for active-nav highlighting and persistence.
Candidate decisions:
- Define `/app/leads` as canonical leads list and keep `/app/leads/:leadId` as detail.
- Point global Leads nav to a campaign-scoped leads surface and remove top-level leads domain.
- Keep only detail route and require a search/selector entry flow before opening details.
Spec file(s) that must be updated to resolve it:
- `docs/UX_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/COVERAGE_MATRIX.md`

---

## GAP-003: Global search behavior is unspecified beyond placement
Status: RESOLVED (2026-02-08)
Observed in: `docs/APP_SHELL_AND_NAVIGATION_SPEC.md` gap list (SHELL-U-001), `app/app/_components/app-shell.tsx`
Why it matters:
- Top bar requires global search input, but behavior scope is undefined (entity coverage, result mode, and mobile behavior), which blocks correct implementation and testing.
Constraints / must-not-break:
- Must keep global search placement in top utility bar (SHELL-008).
- Must keep top bar free of page-specific controls (SHELL-009).
- Must preserve accessibility and keyboard expectations from UI/CVBS rules.
Candidate decisions:
- Implement typeahead search across campaigns/leads/replies/settings with inline results panel.
- Implement submit-only search that routes to a dedicated `/app/search` results screen.
- Keep search as command-palette trigger with global shortcuts and grouped results.
Spec file(s) that must be updated to resolve it:
- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/UX_SPEC.md`

---

## GAP-004: Top bar behavior on Tablet/Mobile is unspecified
Status: RESOLVED (2026-02-08)
Observed in: `docs/APP_SHELL_AND_NAVIGATION_SPEC.md` gap list (SHELL-U-002), `app/app/_components/app-shell.tsx`
Why it matters:
- The spec defines desktop top bar and mobile drawer but not how top bar visibility/interactions behave on smaller viewports, causing inconsistent shell behavior risk.
Constraints / must-not-break:
- Must preserve top bar persistence rules where applicable (SHELL-009).
- Must preserve mobile drawer navigation contract (SHELL-023/SHELL-029).
- Must keep controls accessible and non-overlapping on small screens.
Candidate decisions:
- Keep top bar persistent on all breakpoints; drawer opens beneath fixed top bar.
- Hide top bar on mobile and move search/user actions into drawer header.
- Keep compact top bar on mobile with search collapsed behind icon/action sheet.
Spec file(s) that must be updated to resolve it:
- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/UI_SPEC.md`

---

## GAP-005: Right-rail tablet interaction contract is unspecified
Status: RESOLVED (2026-02-08)
Observed in: `docs/APP_SHELL_AND_NAVIGATION_SPEC.md` gap list (SHELL-U-003), `app/app/_components/screen-skeleton.tsx`
Why it matters:
- Right rail is allowed and required to adapt responsively, but tablet interaction details (open state, affordance, overlay/reflow) are undefined.
Constraints / must-not-break:
- Must keep right rail non-primary (SHELL-013).
- Must collapse/move below primary content on smaller screens (SHELL-013/SHELL-023).
- Must not introduce new global layout regions (SHELL-025).
Candidate decisions:
- Tablet defaults closed with a top-right toggle that overlays content.
- Tablet defaults open and collapses inline (reflow) when toggled.
- Tablet uses bottom sheet for right-rail content, desktop remains fixed rail.
Spec file(s) that must be updated to resolve it:
- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/UI_SPEC.md`

---

## GAP-006: Support/help entry destination and behavior are unspecified
Status: RESOLVED (2026-02-08)
Observed in: `docs/APP_SHELL_AND_NAVIGATION_SPEC.md` (SHELL-005 requires support/help entry), `app/app/_components/app-shell.tsx`
Why it matters:
- The shell requires a support/help entry, but there is no canonical target/destination behavior, so nav completeness is blocked.
Constraints / must-not-break:
- Must preserve lower-section support/help entry in sidebar (SHELL-005).
- Must keep separation from primary navigation.
- Must avoid introducing undocumented domains or workflows.
Candidate decisions:
- Route to a new in-app help center screen (e.g., `/app/support`).
- Link to external docs/support portal in a new tab.
- Open an in-app support panel with docs links + contact action.
Spec file(s) that must be updated to resolve it:
- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`
- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
- `docs/UX_SPEC.md`
