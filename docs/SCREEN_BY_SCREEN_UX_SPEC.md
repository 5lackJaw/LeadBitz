# SCREEN_BY_SCREEN_UX_SPEC.md

> Behavioral source of truth: SOURCE_REGISTRY.md + COVERAGE_MATRIX.md only. No inference. Wireframe references are superseded for shell/layout contract by the Canonical App Shell & Navigation Specification in this document.

---

# Canonical App Shell & Navigation Specification

## Purpose

Define the **structural layout contract** for all authenticated application screens.

This specification replaces any historical wireframe references.
Implementation must follow this document — not visual mockups.

---

# 1. App Shell — Global Layout Model

All authenticated `/app/*` routes must render inside the canonical App Shell.

The App Shell is composed of **three required regions** and **one optional region**.

---

## 1.1 Required Regions

### A. Primary Navigation Region (Left)

Persistent vertical navigation area used for global application movement.

#### Structure

Two logical layers:

##### Layer 1 — Navigation Rail (Optional but Recommended)

Narrow vertical strip containing:

* Icon-only navigation shortcuts
* Module switching icons
* Collapse / expand control

Purpose:
Fast mode switching independent of full navigation state.

---

##### Layer 2 — Navigation Sidebar (Required)

Full navigation surface containing:

Top Section:

* Product mark + product name
* Sidebar collapse control

Main Navigation:
Must include at minimum:

* Dashboard
* Campaigns
* Leads
* Replies
* Settings

Lower Section:

* Support / help entry
* Visually separated from primary navigation

Bottom Identity Tray:

* User avatar
* User display name
* Role / workspace indicator (if applicable)
* Account settings shortcut

---

#### Behavior Rules

Sidebar must support:

* Expanded state (labels + icons)
* Collapsed state (icons only)

Collapse state must persist across navigation.

---

---

### B. Global Utility Bar (Top)

Persistent horizontal bar above page content.

#### Must Contain

Left / Center:

* Global search input (full app search)

Right:

* User context menu
* Avatar
* Session actions (profile, logout, etc.)

---

#### Behavior Rules

Must remain visible across route transitions.

Must not contain page-specific controls.

---

---

### C. Primary Content Region (Center)

Main workspace where route content renders.

#### Rules

Must:

* Support full-height scroll
* Support dashboard grid layouts
* Support table-heavy operational screens
* Support wizard flows

Must be responsive.

---

---

## 1.2 Optional Region

### Secondary Context Region (Right Rail)

Used only when screen benefits from fast contextual actions.

Typical Uses:

* KPIs
* Quick actions
* Status summaries
* Setup shortcuts
* Non-primary workflows

---

#### Rules

Must never contain primary workflow steps.

Must collapse below primary content on smaller screens.

---

---

# 2. Dashboard Layout Contract

Dashboard screens should follow **Operational Priority Layout**.

---

## 2.1 Default Dashboard Grid

Two-column layout:

### Left Column (Primary Operational Surface)

Used for:

* Tables
* Campaign lists
* Lead lists
* Workflow progress surfaces
* Operational health detail

Width Priority:
Primary (≈ 60–70%)

---

### Right Column (Context + Acceleration Surface)

Used for:

* KPI summary tiles
* Activity charts
* Quick action shortcuts
* Secondary configuration entry points

Width Priority:
Secondary (≈ 30–40%)

---

---

## 2.2 Dashboard Card Ordering Priority

When present, preferred ordering:

Primary Column:

1. Core operational table
2. Operational health / system state
3. Secondary operational details

Secondary Column:

1. KPI summary
2. Activity visualization
3. Quick actions

---

---

# 3. Navigation Model

---

## 3.1 Global Navigation (Primary)

Lives in Sidebar.

Represents:
Top-level product domains.

Example Pattern:

```
Dashboard
Campaigns
Leads
Replies
Settings
```

---

---

## 3.2 Contextual Navigation (Secondary)

Lives inside Primary Content Region.

Examples:

* Tabs inside Campaign screen
* Wizard step navigation
* Sub-route navigation

---

---

## 3.3 Navigation Priority Rules

Global Navigation changes domain context.

Contextual Navigation changes workflow stage.

---

---

# 4. Operational UX Priority Rules

The interface must always prioritize:

1️⃣ System safety signals
2️⃣ Workflow visibility
3️⃣ Operational data density
4️⃣ Speed of common actions

Over:

* Visual decoration
* Marketing-style layouts
* Animation-heavy interaction

---

---

# 5. Responsiveness Contract

---

## Desktop

Full App Shell active:

* Rail
* Sidebar
* Top bar
* Optional right rail

---

## Tablet

Sidebar collapses by default.
Right rail becomes collapsible panel.

---

## Mobile

Navigation becomes drawer.
Right rail content moves below primary content.

---

---

# 6. Persistence Rules

The following must persist across sessions:

* Sidebar collapse state
* Last visited primary section
* User workspace context

---

---

# 7. Implementation Constraints

---

## Must NOT Depend On

* Image wireframes
* Screenshot references
* Pixel-perfect visual replication
* Theme-specific assumptions

---

## Must Follow

* Textual layout rules in this document
* UX_SPEC behavioral requirements
* UI_SPEC component and token rules

---

---

# 8. Mental Model Contract

The application should feel like:

> Operating a controlled outbound operations system

Not like:

* A marketing landing dashboard
* A generic analytics dashboard
* A growth hacking tool UI

---

---

# 9. Extensibility Rules

New sections must:

* Fit into existing navigation hierarchy
* Not introduce new global layout regions
* Not change shell anatomy


---



## 1) INFORMATION ARCHITECTURE (IA)

### 1.1 Full route tree (UX_SPEC-defined app routes)

- `app`
  - `campaigns`
    - `:id`
      - `candidates`
      - `discovery`
      - `icp`
        - `improve`
      - `leads`
      - `sequence`
    - `new`
  - `leads`
    - `:leadId`
  - `onboarding`
  - `replies`
  - `settings`
    - `deliverability`
    - `icp-templates`
    - `inboxes`
    - `sources`
    - `suppressions`
    - `verification`
- `login`

### 1.2 Route → screen mapping (UX_SPEC-defined)

- `/app` → Screen: `/app` (Purpose source: UX-R-417)
- `/app/campaigns` → Screen: `/app/campaigns` (Purpose source: UX-R-419)
- `/app/campaigns/:id` → Screen: `/app/campaigns/:id` (Purpose source: UX-R-421)
- `/app/campaigns/:id/candidates` → Screen: `/app/campaigns/:id/candidates` (Purpose source: UX-R-423)
- `/app/campaigns/:id/discovery` → Screen: `/app/campaigns/:id/discovery` (Purpose source: UX-R-422)
- `/app/campaigns/:id/icp` → Screen: `/app/campaigns/:id/icp` (Purpose source: UX-R-426)
- `/app/campaigns/:id/icp/improve` → Screen: `/app/campaigns/:id/icp/improve` (Purpose source: UX-R-427)
- `/app/campaigns/:id/leads` → Screen: `/app/campaigns/:id/leads` (Purpose source: UX-R-424)
- `/app/campaigns/:id/sequence` → Screen: `/app/campaigns/:id/sequence` (Purpose source: UX-R-425)
- `/app/campaigns/new` → Screen: `/app/campaigns/new` (Purpose source: UX-R-420)
- `/app/leads/:leadId` → Screen: `/app/leads/:leadId` (Purpose source: UX-R-430)
- `/app/onboarding` → Screen: `/app/onboarding` (Purpose source: UX-R-448)
- `/app/replies` → Screen: `/app/replies` (Purpose source: UX-R-467)
- `/app/settings` → Screen: `/app/settings` (Purpose source: UX-R-431)
- `/app/settings/deliverability` → Screen: `/app/settings/deliverability` (Purpose source: UX-R-433)
- `/app/settings/icp-templates` → Screen: `/app/settings/icp-templates` (Purpose source: UX-R-428)
- `/app/settings/inboxes` → Screen: `/app/settings/inboxes` (Purpose source: UX-R-432)
- `/app/settings/sources` → Screen: `/app/settings/sources` (Purpose source: UX-R-435)
- `/app/settings/suppressions` → Screen: `/app/settings/suppressions` (Purpose source: UX-R-434)
- `/app/settings/verification` → Screen: `/app/settings/verification` (Purpose source: UX-R-436)
- `/login` → Screen: `/login` (Purpose source: UX-R-440)

### 1.3 Referenced routes from COVERAGE_MATRIX (non-UX_SPEC route list)

> Note: Inclusion here is solely because these routes appear under “Likely Screen(s) Impacted” in COVERAGE_MATRIX.md.

- `/api/auth/[...nextauth]` → Screen: `/api/auth/[...nextauth]` (Source: COVERAGE_MATRIX.md mappings)
- `/api/cron/sync-inbox` → Screen: `/api/cron/sync-inbox` (Source: COVERAGE_MATRIX.md mappings)
- `/api/cron/tick` → Screen: `/api/cron/tick` (Source: COVERAGE_MATRIX.md mappings)
- `/api/icp/classify-archetype` → Screen: `/api/icp/classify-archetype` (Source: COVERAGE_MATRIX.md mappings)
- `/api/icp/interview/answer` → Screen: `/api/icp/interview/answer` (Source: COVERAGE_MATRIX.md mappings)
- `/api/icp/interview/complete` → Screen: `/api/icp/interview/complete` (Source: COVERAGE_MATRIX.md mappings)
- `/api/icp/interview/start` → Screen: `/api/icp/interview/start` (Source: COVERAGE_MATRIX.md mappings)
- `/api/icp/score` → Screen: `/api/icp/score` (Source: COVERAGE_MATRIX.md mappings)
- `/api/inboxes/google/callback` → Screen: `/api/inboxes/google/callback` (Source: COVERAGE_MATRIX.md mappings)
- `/api/inboxes/google/connect` → Screen: `/api/inboxes/google/connect` (Source: COVERAGE_MATRIX.md mappings)
- `/app/*` → Screen: `/app/*` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/` → Screen: `/app/campaigns/` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/:campaignId/leads` → Screen: `/app/campaigns/:campaignId/leads` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/[campaignId]` → Screen: `/app/campaigns/[campaignId]` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/[campaignId]/icp` → Screen: `/app/campaigns/[campaignId]/icp` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/[campaignId]/icp/improve` → Screen: `/app/campaigns/[campaignId]/icp/improve` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/campaigns-client` → Screen: `/app/campaigns/campaigns-client` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/new/page` → Screen: `/app/campaigns/new/page` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/new/wizard-step1-form` → Screen: `/app/campaigns/new/wizard-step1-form` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/new?campaignId=` → Screen: `/app/campaigns/new?campaignId=` (Source: COVERAGE_MATRIX.md mappings)
- `/app/campaigns/page` → Screen: `/app/campaigns/page` (Source: COVERAGE_MATRIX.md mappings)
- `/app/page` → Screen: `/app/page` (Source: COVERAGE_MATRIX.md mappings)
- `/app/settings/inboxes/` → Screen: `/app/settings/inboxes/` (Source: COVERAGE_MATRIX.md mappings)
- `/app/settings/inboxes/inbox-settings-form` → Screen: `/app/settings/inboxes/inbox-settings-form` (Source: COVERAGE_MATRIX.md mappings)
- `/app/settings/inboxes/page` → Screen: `/app/settings/inboxes/page` (Source: COVERAGE_MATRIX.md mappings)
- `/app/settings/sources/page` → Screen: `/app/settings/sources/page` (Source: COVERAGE_MATRIX.md mappings)
- `/app/sign-out-button` → Screen: `/app/sign-out-button` (Source: COVERAGE_MATRIX.md mappings)

### 1.4 Global / Unmapped requirements bucket

- Screen: `[GLOBAL_OR_UNMAPPED]` (Applies where COVERAGE_MATRIX lists screen impact as [UNSPECIFIED — REQUIRES PRODUCT DECISION])

## 2) NAVIGATION MAP

### 2.1 Global navigation structure

- Global app shell must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).

### 2.2 Explicit navigation / routing rules (from SOURCE_REGISTRY)

- UX-R-038: - Acceptance: `/app` loads locally
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 1 — Skeleton + DB`
- UX-R-040: - Note (2026-02-05): Bootstrapped Next.js App Router project with TypeScript + ESLint and added an explicit `/app` route page. Verified with lint/build and route generation. Files touched: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`, `app/*`, `public/*`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 1 — Skeleton + DB`
- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 2 — Auth + workspace scoping`
- UX-R-077: - Note (2026-02-06): Added explicit "Phase 2 closeout" documentation with completion summary, carry-forward decisions (temporary NextAuth bridge + ownership access model), route-handler error mapping guidance for workspace authorization helper, and validation command evidence. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 2 — Auth + workspace scoping`
- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 3 — Gmail connect`
- UX-R-092: - Note (2026-02-06): Added persisted inbox settings fields on `inbox_connections` (`daily_send_cap`, `send_window_start_hour`, `send_window_end_hour`, `ramp_up_per_day`), implemented `PATCH /api/inboxes/:inboxConnectionId/settings` with workspace-ownership and input validation, and added `/app/settings/inboxes` form for saving settings. Added integration coverage for persistence and validation failures. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206142046_add_inbox_connection_sending_settings/migration.sql`, `lib/inbox/inbox-settings.ts`, `app/api/inboxes/[inboxConnectionId]/settings/route.ts`, `app/app/settings/inboxes/inbox-settings-form.tsx`, `app/app/settings/inboxes/page.tsx`, `tests/integration/inbox-settings.test.ts`, `package.json`, `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 3 — Gmail connect`
- UX-R-098: - Note (2026-02-06): Confirmed Phase 4 wizard route/step boundaries in `docs/SOFTWARE_DOCUMENTATION.md` for `/app/campaigns/new`, including Step 1 xor-input validation contract and explicit scope limits (Step 1 + ICP draft/edit only). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-106: - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-110: - Note (2026-02-06): Added `POST /api/icp/generate` with Step 1 xor-input validation, workspace-scoped `icp_profiles` persistence, optional campaign linkage (`campaigns.icp_profile_id`), and structured response payload. Added integration test coverage with mocked AI generator in `tests/integration/icp-generate.test.ts` to verify persisted ICP rows and workspace ownership checks. Files touched: `app/api/icp/generate/route.ts`, `lib/icp/generate-icp-profile.ts`, `tests/integration/icp-generate.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-114: - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-115: - Follow-up note (2026-02-06): Adjusted Step 1 UX so typing into website/product-description auto-clears the alternate source, and added explicit Step 2 "last saved" feedback in the editor after `PATCH` success. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-119: - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-129: - [x] **Implement `/api/icp/score` endpoint + persistence of `icp_quality_scores`**
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-132: - Note (2026-02-07): Added `POST /api/icp/score` endpoint and `scoreIcpVersionForWorkspace` service to validate workspace/campaign/version ownership, normalize ICP JSON, run deterministic rubric scoring, and persist explainable results to `icp_quality_scores` (`missingFields`, `explanations`, `questions`, scorer metadata). Added integration coverage in `tests/integration/icp-score.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/score/route.ts`, `lib/icp/score-icp-version.ts`, `tests/integration/icp-score.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-135: - Note (2026-02-07): Added an ICP Quality Panel to Step 2 in `app/app/campaigns/new/wizard-step1-form.tsx` with rubric scoring integration (`POST /api/icp/score`), score/tier display, missing-fields/questions visibility, `Improve ICP` CTA, and `Continue anyway to Step 3` behavior that adapts to `USABLE`/`INSUFFICIENT` tiers. Quality scoring is automatically triggered after generation and after saves when `campaignId` + `icpVersionId` are available, and can be manually re-run. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-136: - [x] **Implement archetype classification endpoint `/api/icp/classify-archetype`**
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-139: - Note (2026-02-07): Added `POST /api/icp/classify-archetype` and `classifyProductArchetypeForWorkspace` service with workspace/campaign/version ownership checks, classifier hook for mocked AI behavior, and persistence to `product_archetype_classifications` (including undecided fallback key `UNIDENTIFIED`). Added integration coverage in `tests/integration/icp-classify-archetype.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/classify-archetype/route.ts`, `lib/icp/classify-product-archetype.ts`, `tests/integration/icp-classify-archetype.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-143: - Note (2026-02-07): Added Scenario A/B quality-gate modal flow logic to `app/app/campaigns/new/wizard-step1-form.tsx`: insufficient-score (`tier=INSUFFICIENT`) now triggers archetype classification, opens Scenario A when archetype confidence meets threshold, otherwise Scenario B with disambiguation-question submission loop. Included required buttons (`Apply template`, `Improve with Specialist AI`, `Continue anyway` / `Answer questions`) and persistence behavior by recording wizard state on continue/disambiguation actions. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-144: - [x] **Implement Specialist ICP Interview wizard route `/app/campaigns/:id/icp/improve`**
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-148: - [x] **Add ICP Center route `/app/campaigns/:id/icp` (versions + select active)**
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-151: - Note (2026-02-07): Added campaign-scoped ICP Center route at `/app/campaigns/[campaignId]/icp` with versions table, latest score/tier display, active-version indicator, `Set active` action, and `Re-score` action wired to `/api/icp/score`. Added active-version API `PATCH /api/campaigns/[campaignId]/icp/active` and ICP center service layer for version listing/ownership-safe activation. Added integration coverage in `tests/integration/icp-center.test.ts`. Files touched: `app/app/campaigns/[campaignId]/icp/page.tsx`, `app/app/campaigns/[campaignId]/icp/icp-center-client.tsx`, `app/api/campaigns/[campaignId]/icp/active/route.ts`, `lib/icp/icp-center.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `tests/integration/icp-center.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 4 — Campaign wizard (draft + ICP)`
- UX-R-166: - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 5 — Lead discovery pipeline (licensed provider) + candidates + verification`
- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 5 — Lead discovery pipeline (licensed provider) + candidates + verification`
- UX-R-190: - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 5 — Lead discovery pipeline (licensed provider) + candidates + verification`
- UX-R-193: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 5 — Lead discovery pipeline (licensed provider) + candidates + verification`
- UX-R-209: - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 6 — Lead import fallback (CSV/paste/manual) + provenance (optional but recommended)`
- UX-R-241: - [ ] `/api/cron/tick` due-job selection + locking
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 9 — Cron sender + Gmail send`
- UX-R-254: - [ ] `/api/cron/sync-inbox` polling for replies
  - Source File: `IMPLEMENTATION_CHECKLIST.md`
  - Section: `Phase 10 — Inbox polling + replies inbox`
- UX-R-417: - `/app` App shell (auth required)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-418: - `/app/onboarding` Connect inbox + workspace defaults
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-419: - `/app/campaigns` Campaign list
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-420: - `/app/campaigns/new` Campaign wizard
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-421: - `/app/campaigns/:id` Campaign overview (status, metrics, controls)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-422: - `/app/campaigns/:id/discovery` Lead discovery configuration + runs
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-423: - `/app/campaigns/:id/candidates` Candidates review (filter/sort/approve)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-424: - `/app/campaigns/:id/leads` Approved leads table (filter, suppression)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-425: - `/app/campaigns/:id/sequence` Sequence builder + templates
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-426: - `/app/campaigns/:id/icp` ICP versions + quality score + actions
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-427: - `/app/campaigns/:id/icp/improve` Specialist ICP Interview wizard
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-428: - `/app/settings/icp-templates` (optional admin-only in MVP; can be hidden behind feature flag)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-429: - `/app/replies` Unified replies inbox
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-430: - `/app/leads/:leadId` Lead detail (profile, provenance, timeline)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-431: - `/app/settings` Workspace settings
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-432: - `/app/settings/inboxes`
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-433: - `/app/settings/deliverability`
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-434: - `/app/settings/suppressions`
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-435: - `/app/settings/sources` Source connectors + governance
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-436: - `/app/settings/verification` Email verification provider settings (MVP minimal)
  - Source File: `UX_SPEC.md`
  - Section: `Information architecture (routes/sections)`
- UX-R-440: - Login/signup should be one shared entry flow at `/login` with minimal fields and clear provider choices.
  - Source File: `UX_SPEC.md`
  - Section: `Auth + signup UX decisions`
- UX-R-442: - After first successful auth, user is routed into onboarding and workspace provisioning flow.
  - Source File: `UX_SPEC.md`
  - Section: `Auth + signup UX decisions`
- UX-R-448: 4. Land in `/app/onboarding`
  - Source File: `UX_SPEC.md`
  - Section: `Billing + trial UX decisions`
- UX-R-467: 1. Replies appear in `/app/replies`.
  - Source File: `UX_SPEC.md`
  - Section: `Core user journeys (numbered)`
- UX-R-502: - connector disabled in settings → block and link to settings
  - Source File: `UX_SPEC.md`
  - Section: `Campaign wizard (updated steps)`

### 2.3 Cross-screen transitions

> Only transitions explicitly stated in SOURCE_REGISTRY are listed below.

- UX-R-502: - connector disabled in settings → block and link to settings
## 3) SCREEN-BY-SCREEN UX SPEC


---

## Screen: `/app`

### Source Coverage

- Requirement IDs:
  - UX-R-038
  - UX-R-040
  - UX-R-067
  - UX-R-417

### Purpose

- UX-R-417: - `/app` App shell (auth required)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-038: - Acceptance: `/app` loads locally
- UX-R-040: - Note (2026-02-05): Bootstrapped Next.js App Router project with TypeScript + ESLint and added an explicit `/app` route page. Verified with lint/build and route generation. Files touched: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`, `app/*`, `public/*`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-417: - `/app` App shell (auth required)


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns`

### Source Coverage

- Requirement IDs:
  - UX-R-102
  - UX-R-419

### Purpose

- UX-R-419: - `/app/campaigns` Campaign list


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-419: - `/app/campaigns` Campaign list


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id`

### Source Coverage

- Requirement IDs:
  - UX-R-118
  - UX-R-119
  - UX-R-421

### Purpose

- UX-R-421: - `/app/campaigns/:id` Campaign overview (status, metrics, controls)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
- UX-R-119: - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.
- UX-R-421: - `/app/campaigns/:id` Campaign overview (status, metrics, controls)


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
- UX-R-119: - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/candidates`

### Source Coverage

- Requirement IDs:
  - DATA-026
  - DATA-027
  - UX-R-170
  - UX-R-171
  - UX-R-172
  - UX-R-174
  - UX-R-176
  - UX-R-180
  - UX-R-182
  - UX-R-183
  - UX-R-186
  - UX-R-187
  - UX-R-190
  - UX-R-191
  - UX-R-193
  - UX-R-335
  - UX-R-336
  - UX-R-382
  - UX-R-383
  - UX-R-385
  - COMP-028
  - UX-R-392
  - UX-R-414
  - UX-R-423
  - UX-R-459
  - UX-R-460
  - UX-R-504
  - UX-R-508

### Purpose

- UX-R-423: - `/app/campaigns/:id/candidates` Candidates review (filter/sort/approve)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- DATA-026: - [x] Add DB tables for source_connectors, source_runs, candidates, email_verifications
- DATA-027: - Note (2026-02-07): Added Prisma models/enums for `source_connectors`, `source_runs`, `candidates`, and `email_verifications` with required indexes (`candidates_campaign_id_idx`, `candidates_source_run_id_idx`, `candidates_email_idx`) and generated migration `20260207162122_add_source_discovery_tables`. Added integration coverage in `tests/integration/source-discovery-schema.test.ts` to verify table + index presence. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207162122_add_source_discovery_tables/migration.sql`, `tests/integration/source-discovery-schema.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-170: - Note (2026-02-07): Added PDL provider wrapper `lib/sources/pdl-client.ts` with typed candidate response parsing, request pacing (`minRequestIntervalMs`), transient retry/backoff for `429/5xx`, and cursor-based pagination (`searchPage`, `fetchAllCandidates`). Added unit retry/backoff coverage in `tests/unit/pdl-client.test.ts` and mock-provider pagination integration coverage in `tests/integration/pdl-client-mock.test.ts`. Files touched: `lib/sources/pdl-client.ts`, `tests/unit/pdl-client.test.ts`, `tests/integration/pdl-client-mock.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-171: - [x] Implement discovery run worker (fetch → normalize → store candidates)
- UX-R-172: - Acceptance: creates candidates with confidence + provenance; run stats recorded
- UX-R-174: - Note (2026-02-07): Added discovery run worker `executeDiscoveryRun` in `lib/sources/discovery-run-worker.ts` to transition run status (`QUEUED` -> `RUNNING` -> `COMPLETED/FAILED`), fetch candidates via provider client abstraction, normalize and persist candidate rows, and record run stats in `source_runs.stats_json`. Added integration coverage in `tests/integration/discovery-run-worker.test.ts` with mocked provider responses. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-176: - Acceptance: writes email_verifications; updates candidates verification_status
- UX-R-180: - Acceptance: suppressed/duplicate candidates marked and excluded from “approvable”
- UX-R-182: - Note (2026-02-08): Extended discovery worker candidate creation path to apply suppression list + dedupe rules (existing suppressions, existing leads, existing campaign candidates, and same-run duplicates by email/person/company IDs). Candidates matching these checks are persisted with `status=SUPPRESSED`, while approvable rows remain `status=NEW`. Added integration coverage in `tests/integration/discovery-run-suppression-dedupe.test.ts` and updated worker stats to include `approvableCandidates`, `suppressedByBlocklist`, and `suppressedByDuplicate`. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `tests/integration/discovery-run-suppression-dedupe.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-183: - [x] Implement candidates list API (filters, pagination)
- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-187: - [x] Implement candidates review UI (/candidates) with approve/reject flows
- UX-R-190: - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-191: - [x] Implement approve endpoint (Candidates → Leads) with enforcement rules
- UX-R-193: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-335: - Discovery results land in a **Candidates** stage (not immediately sendable).
- UX-R-336: - Users can filter, sample, and approve candidates into campaign leads.
- UX-R-382: 4. Run discovery → system produces **Candidates** with provenance + confidence.
- UX-R-383: 5. Review candidates:
- UX-R-385: 6. Approve candidates into campaign leads.
- COMP-028: 2. Connector fetches company/contact candidates from licensed provider API.
- UX-R-392: 5. Apply suppressions and dedupe → mark remaining as Candidates (ready for review).
- UX-R-414: - Contacts are not auto-contacted without a **human approval gate** (Candidates → Leads).
- UX-R-423: - `/app/campaigns/:id/candidates` Candidates review (filter/sort/approve)
- UX-R-459: 5. Run discovery → system builds Candidates.
- UX-R-460: 6. Review Candidates → approve to Leads.
- UX-R-504: - Candidates list supports:
- UX-R-508: - select candidates → “Approve to Leads”


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-187: - [x] Implement candidates review UI (/candidates) with approve/reject flows
- UX-R-190: - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-191: - [x] Implement approve endpoint (Candidates → Leads) with enforcement rules
- UX-R-193: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-336: - Users can filter, sample, and approve candidates into campaign leads.
- UX-R-385: 6. Approve candidates into campaign leads.
- UX-R-423: - `/app/campaigns/:id/candidates` Candidates review (filter/sort/approve)
- UX-R-460: 6. Review Candidates → approve to Leads.
- UX-R-508: - select candidates → “Approve to Leads”


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-028: 2. Connector fetches company/contact candidates from licensed provider API.


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/discovery`

### Source Coverage

- Requirement IDs:
  - COMP-006
  - DATA-027
  - UX-R-163
  - UX-R-166
  - UX-R-171
  - UX-R-174
  - UX-R-182
  - DATA-028
  - UX-R-196
  - COMP-007
  - COMP-013
  - UX-R-328
  - COMP-016
  - UX-R-335
  - UX-R-365
  - UX-R-366
  - UX-R-379
  - UX-R-382
  - UX-R-410
  - COMP-031
  - UX-R-422
  - UX-R-455
  - DATA-048
  - UX-R-459
  - UX-R-501
  - UX-R-528
  - UX-R-545

### Purpose

- UX-R-422: - `/app/campaigns/:id/discovery` Lead discovery configuration + runs


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- COMP-006: - Note (2026-02-06): Selected People Data Labs (`provider_key: pdl`) as the single MVP licensed discovery connector and documented supported filter contract, required normalized fields, and quota/cost guardrails (per-run cap, daily workspace cap, partial/failure behavior) in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- DATA-027: - Note (2026-02-07): Added Prisma models/enums for `source_connectors`, `source_runs`, `candidates`, and `email_verifications` with required indexes (`candidates_campaign_id_idx`, `candidates_source_run_id_idx`, `candidates_email_idx`) and generated migration `20260207162122_add_source_discovery_tables`. Added integration coverage in `tests/integration/source-discovery-schema.test.ts` to verify table + index presence. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207162122_add_source_discovery_tables/migration.sql`, `tests/integration/source-discovery-schema.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-163: - [x] Implement discovery run creation endpoint (creates source_run)
- UX-R-166: - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-171: - [x] Implement discovery run worker (fetch → normalize → store candidates)
- UX-R-174: - Note (2026-02-07): Added discovery run worker `executeDiscoveryRun` in `lib/sources/discovery-run-worker.ts` to transition run status (`QUEUED` -> `RUNNING` -> `COMPLETED/FAILED`), fetch candidates via provider client abstraction, normalize and persist candidate rows, and record run stats in `source_runs.stats_json`. Added integration coverage in `tests/integration/discovery-run-worker.test.ts` with mocked provider responses. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-182: - Note (2026-02-08): Extended discovery worker candidate creation path to apply suppression list + dedupe rules (existing suppressions, existing leads, existing campaign candidates, and same-run duplicates by email/person/company IDs). Candidates matching these checks are persisted with `status=SUPPRESSED`, while approvable rows remain `status=NEW`. Added integration coverage in `tests/integration/discovery-run-suppression-dedupe.test.ts` and updated worker stats to include `approvableCandidates`, `suppressedByBlocklist`, and `suppressedByDuplicate`. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `tests/integration/discovery-run-suppression-dedupe.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- DATA-028: - Note (2026-02-08): Added explicit Phase 5 closeout documentation with completion summary, implementation decisions, and operational gotchas for discovery runs, candidate approval gating, and verification enforcement. Updated route/API/data-model summaries and changelog continuity in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-196: - Acceptance: fallback explicitly positioned; does not replace discovery
- COMP-007: - Note (2026-02-08): Confirmed Phase 6 is a fallback ingestion surface only (CSV/paste/manual) and does not replace licensed-provider discovery as the primary lead acquisition path. Documented mapping UX boundaries, dedupe/suppression/provenance expectations, and out-of-scope constraints in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-013: 3) **Leads: Automated discovery + enrichment + verification (compliance-first)**
- UX-R-328: - ICP-driven lead discovery pipeline that produces **candidate companies + contacts** automatically.
- COMP-016: - Optional: company discovery via compliant search API (Phase 2; contacts still from licensed provider).
- UX-R-335: - Discovery results land in a **Candidates** stage (not immediately sendable).
- UX-R-365: - **ICP Profile**: targeting rules + positioning notes used for discovery and drafting.
- UX-R-366: - **Source Run**: an execution of discovery/enrichment against an ICP with parameters (limits, filters).
- UX-R-379: 3. Configure **Lead Discovery**:
- UX-R-382: 4. Run discovery → system produces **Candidates** with provenance + confidence.
- UX-R-410: 4) **Company discovery beyond the data provider**
- COMP-031: - Lead discovery is implemented via **licensed/authorized** data sources (no unauthorized scraping as a core feature).
- UX-R-422: - `/app/campaigns/:id/discovery` Lead discovery configuration + runs
- UX-R-455: 2) **Create campaign (wizard) with automated lead discovery**
- DATA-048: 4. Configure lead discovery (source connector, filters, required fields, limit).
- UX-R-459: 5. Run discovery → system builds Candidates.
- UX-R-501: - “Run discovery” (creates Source Run)
- UX-R-528: - “Use this ICP for discovery/messaging” selector (default = latest)
- UX-R-545: - Disabling a connector blocks new discovery runs and enrichment.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- COMP-006: - Note (2026-02-06): Selected People Data Labs (`provider_key: pdl`) as the single MVP licensed discovery connector and documented supported filter contract, required normalized fields, and quota/cost guardrails (per-run cap, daily workspace cap, partial/failure behavior) in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-166: - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-016: - Optional: company discovery via compliant search API (Phase 2; contacts still from licensed provider).
- UX-R-379: 3. Configure **Lead Discovery**:
- UX-R-455: 2) **Create campaign (wizard) with automated lead discovery**
- DATA-048: 4. Configure lead discovery (source connector, filters, required fields, limit).


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-006: - Note (2026-02-06): Selected People Data Labs (`provider_key: pdl`) as the single MVP licensed discovery connector and documented supported filter contract, required normalized fields, and quota/cost guardrails (per-run cap, daily workspace cap, partial/failure behavior) in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-007: - Note (2026-02-08): Confirmed Phase 6 is a fallback ingestion surface only (CSV/paste/manual) and does not replace licensed-provider discovery as the primary lead acquisition path. Documented mapping UX boundaries, dedupe/suppression/provenance expectations, and out-of-scope constraints in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-013: 3) **Leads: Automated discovery + enrichment + verification (compliance-first)**
- COMP-016: - Optional: company discovery via compliant search API (Phase 2; contacts still from licensed provider).
- COMP-031: - Lead discovery is implemented via **licensed/authorized** data sources (no unauthorized scraping as a core feature).


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/icp`

### Source Coverage

- Requirement IDs:
  - UX-R-044
  - DATA-012
  - DATA-014
  - DATA-015
  - DATA-016
  - DATA-017
  - UX-R-107
  - UX-R-108
  - UX-R-110
  - UX-R-111
  - UX-R-117
  - UX-R-122
  - DATA-019
  - UX-R-125
  - UX-R-126
  - UX-R-127
  - DATA-021
  - UX-R-130
  - UX-R-132
  - UX-R-133
  - DATA-022
  - UX-R-139
  - UX-R-145
  - UX-R-148
  - DATA-023
  - DATA-024
  - UX-R-284
  - UX-R-285
  - UX-R-287
  - UX-R-291
  - UX-R-293
  - UX-R-294
  - UX-R-295
  - UX-R-298
  - UX-R-299
  - UX-R-300
  - UX-R-301
  - UX-R-304
  - UX-R-305
  - UX-R-306
  - UX-R-309
  - UX-R-310
  - UX-R-311
  - UX-R-314
  - UX-R-315
  - UX-R-316
  - UX-R-320
  - UX-R-323
  - UX-R-324
  - DATA-033
  - UX-R-326
  - UX-R-328
  - UX-R-359
  - UX-R-361
  - UX-R-364
  - UX-R-365
  - UX-R-366
  - UX-R-374
  - DATA-039
  - DATA-040
  - UX-R-375
  - UX-R-376
  - UX-R-378
  - UX-R-389
  - UX-R-426
  - UX-R-458
  - UX-R-475
  - UX-R-477
  - UX-R-480
  - UX-R-483
  - UX-R-485
  - DATA-051
  - UX-R-522
  - UX-R-528
  - UX-R-534

### Purpose

- UX-R-426: - `/app/campaigns/:id/icp` ICP versions + quality score + actions


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-044: - [x] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
- DATA-012: - Note (2026-02-06): Added core Prisma schema models/enums and created migration `20260206025124_create_core_tables` for `users`, `workspaces`, `inbox_connections`, `campaigns`, and `icp_profiles`. Verified with `prisma migrate status` against the Vercel/Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206025124_create_core_tables/migration.sql`, `prisma/migrations/migration_lock.toml`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- DATA-014: - [x] **Add schema + migration for ICP versions + quality scoring + archetype + templates + interview sessions**
- DATA-015: - Acceptance: tables exist (`icp_versions`, `icp_quality_scores`, `product_archetype_classifications`, `icp_templates`, `icp_interview_sessions`)
- DATA-016: - Notes: Keep existing `icp_profiles` intact; treat new tables as additive. Consider backfill path later.
- DATA-017: - Note (2026-02-07): Added additive Prisma models/enums for `icp_versions`, `icp_quality_scores`, `product_archetype_classifications`, `icp_templates`, and `icp_interview_sessions` while keeping `icp_profiles` unchanged; generated migration `20260207045941_add_icp_quality_tables` with foreign keys and indexes, and validated migration apply on local Prisma Postgres (`prisma dev`). Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207045941_add_icp_quality_tables/migration.sql`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-107: - [x] ICP generate endpoint (AI mocked in tests)
- UX-R-108: - Acceptance: saves icp_profile row
- UX-R-110: - Note (2026-02-06): Added `POST /api/icp/generate` with Step 1 xor-input validation, workspace-scoped `icp_profiles` persistence, optional campaign linkage (`campaigns.icp_profile_id`), and structured response payload. Added integration test coverage with mocked AI generator in `tests/integration/icp-generate.test.ts` to verify persisted ICP rows and workspace ownership checks. Files touched: `app/api/icp/generate/route.ts`, `lib/icp/generate-icp-profile.ts`, `tests/integration/icp-generate.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-111: - [x] ICP editor UI
- UX-R-117: - Note (2026-02-06): Added explicit "Phase 4 closeout" section to `docs/SOFTWARE_DOCUMENTATION.md` with completion summary, carry-forward decisions (strict Step 1 XOR contract + explicit-save ICP editor behavior), operational gotchas, and validation evidence (`lint`, `unit`, `integration`, `build`). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-122: - [x] **Define ICP rubric + tier thresholds (deterministic)**
- DATA-019: - Notes: No model call needed for rubric math; model only produces structured ICP and missing-field detection if required.
- UX-R-125: - Note (2026-02-07): Added deterministic ICP quality rubric constants and scoring utility with explicit tier thresholds and 100-point weighting in `lib/icp/icp-quality-rubric.ts`; added unit tests covering complete/partial/sparse payload scoring, tier boundary mapping, and rubric total validation in `tests/unit/icp-quality-rubric.test.ts`. Files touched: `lib/icp/icp-quality-rubric.ts`, `tests/unit/icp-quality-rubric.test.ts`, `package.json`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-126: - [x] **Add ICP Versioning (website/manual) for campaigns**
- UX-R-127: - Acceptance: generating ICP creates an `icp_versions` row; edits create new version or update same version per defined rule
- DATA-021: - Note (2026-02-07): Added campaign-scoped ICP version persistence in generation/edit services: `POST /api/icp/generate` now creates an active `icp_versions` row (`WEBSITE` for website input, `MANUAL` for product-description input), and profile edits update the active website/manual version in place or create a new active manual version when the active source is non-editable (e.g., template/specialist). Added integration assertions in `tests/integration/icp-generate.test.ts` and `tests/integration/icp-editor.test.ts` for creation, active-version updates, and fallback new-version creation behavior. Files touched: `lib/icp/generate-icp-profile.ts`, `lib/icp/update-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-generate.test.ts`, `tests/integration/icp-editor.test.ts`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- UX-R-130: - Acceptance: scoring runs for a given icpVersionId and saves results; returns explainable payload
- UX-R-132: - Note (2026-02-07): Added `POST /api/icp/score` endpoint and `scoreIcpVersionForWorkspace` service to validate workspace/campaign/version ownership, normalize ICP JSON, run deterministic rubric scoring, and persist explainable results to `icp_quality_scores` (`missingFields`, `explanations`, `questions`, scorer metadata). Added integration coverage in `tests/integration/icp-score.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/score/route.ts`, `lib/icp/score-icp-version.ts`, `tests/integration/icp-score.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-133: - [x] **Add ICP Quality Panel in wizard Step 2**
- DATA-022: - Acceptance: shows score, tier, missing fields, “Improve ICP” CTA; supports “Continue anyway” paths
- UX-R-139: - Note (2026-02-07): Added `POST /api/icp/classify-archetype` and `classifyProductArchetypeForWorkspace` service with workspace/campaign/version ownership checks, classifier hook for mocked AI behavior, and persistence to `product_archetype_classifications` (including undecided fallback key `UNIDENTIFIED`). Added integration coverage in `tests/integration/icp-classify-archetype.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/classify-archetype/route.ts`, `lib/icp/classify-product-archetype.ts`, `tests/integration/icp-classify-archetype.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-145: - Acceptance: start session → answer questions → completes and creates a new ICP version; shows diff summary
- UX-R-148: - [x] **Add ICP Center route `/app/campaigns/:id/icp` (versions + select active)**
- DATA-023: - Acceptance: Phase 4 extension + ICP surfaces documented (quality gate, scenario flows, templates, interview, routes, data model, APIs)
- DATA-024: - Note (2026-02-07): Added explicit Phase 4 extension closeout section in `docs/SOFTWARE_DOCUMENTATION.md` consolidating delivered ICP quality surfaces (scoring, Scenario A/B, archetype classification, Specialist interview, ICP Center), carry-forward decisions, and validation evidence. Also confirmed route/API/data-model references are represented in summary sections and operational gotchas. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.
- UX-R-285: 2) **ICP generation + editing (quality-gated)**
- UX-R-287: - AI produces a structured ICP draft:
- UX-R-291: - exclusions / anti-ICP
- UX-R-293: - User can edit and save ICP versions.
- UX-R-294: 2.1) **ICP Quality Gate (required)**
- UX-R-295: - After initial ICP generation, the system computes an **ICP Quality Score (0–100)** using a deterministic rubric and returns:
- UX-R-298: - **≥ 75**: “High-quality ICP” → proceed normally
- UX-R-299: - **50–74**: “Usable ICP” → warn + recommend improvement
- UX-R-300: - **< 50**: “Insufficient ICP” → trigger Scenario A/B flow
- UX-R-301: 2.2) **Scenario A — insufficient ICP but product archetype identified**
- UX-R-304: - “We couldn’t create a high-quality ICP from your website alone.”
- UX-R-305: - If an ICP template exists for the archetype:
- UX-R-306: - Offer: “Apply our {archetype} ICP template” (guided, structured)
- UX-R-309: - Offer: “Improve ICP with Specialist AI” (structured interview)
- UX-R-310: - Always include: “No, continue anyway” (saves website ICP as-is)
- UX-R-311: 2.3) **Scenario B — insufficient ICP and archetype not identified**
- UX-R-314: - If still not identified → offer “Specialist AI interview” to create a high-quality ICP.
- UX-R-315: - Always include: “No, continue anyway” (saves website ICP as-is)
- UX-R-316: 2.4) **ICP Templates (archetype library)**
- UX-R-320: - default ICP skeleton
- UX-R-323: 2.5) **Specialist ICP Interview (structured, not open chat)**
- UX-R-324: - A guided wizard that asks only the questions needed to raise the ICP score.
- DATA-033: - Output must conform to the same structured ICP schema.
- UX-R-326: - “Improved ICP” version saved alongside the website ICP
- UX-R-328: - ICP-driven lead discovery pipeline that produces **candidate companies + contacts** automatically.
- UX-R-359: - A user can launch a campaign end-to-end (ICP → import leads → sequence → send) in **≤ 20 minutes**.
- UX-R-361: - ICP Quality Gate works end-to-end: score + missing-field checklist + improvement path; users can reach “High-quality ICP” tier for typical SaaS websites (via templates or Specialist interview).
- UX-R-364: - **Campaign**: outreach effort tied to an ICP, lead pipeline config, and sequence.
- UX-R-365: - **ICP Profile**: targeting rules + positioning notes used for discovery and drafting.
- UX-R-366: - **Source Run**: an execution of discovery/enrichment against an ICP with parameters (limits, filters).
- UX-R-374: - **ICP Version**: a saved version of an ICP for a campaign (website draft, improved, template-applied).
- DATA-039: - **ICP Quality Score**: rubric score + tier + missing fields + explanations for a specific ICP version.
- DATA-040: - **Product Archetype**: classified model/category used to select an ICP template.
- UX-R-375: - **ICP Template**: archetype-specific guided framework that produces a structured ICP.
- UX-R-376: - **ICP Interview Session**: a structured Q&A session used to improve an ICP to meet the quality bar.
- UX-R-378: 2. AI generates ICP draft → user edits + confirms.
- UX-R-389: 1. Create a Source Run from ICP + filters + limits.
- UX-R-426: - `/app/campaigns/:id/icp` ICP versions + quality score + actions
- UX-R-458: 3. AI returns ICP draft; user edits and confirms.
- UX-R-475: - AI failure: retry + “continue manually” (user can enter ICP without AI).
- UX-R-477: - After generation (or on demand), show **ICP Quality Panel**:
- UX-R-480: - 50–74: show warning + “Improve ICP” CTA
- UX-R-483: - “Improve ICP” → routes to Specialist Interview wizard (structured)
- UX-R-485: - “Continue anyway” → saves the current ICP version and proceeds
- DATA-051: - Must show why the ICP is insufficient (missing fields list)
- UX-R-522: - Shows ICP versions list:
- UX-R-528: - “Use this ICP for discovery/messaging” selector (default = latest)
- UX-R-534: - If user edits ICP: mark score stale until re-score runs


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-044: - [x] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
- UX-R-117: - Note (2026-02-06): Added explicit "Phase 4 closeout" section to `docs/SOFTWARE_DOCUMENTATION.md` with completion summary, carry-forward decisions (strict Step 1 XOR contract + explicit-save ICP editor behavior), operational gotchas, and validation evidence (`lint`, `unit`, `integration`, `build`). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-127: - Acceptance: generating ICP creates an `icp_versions` row; edits create new version or update same version per defined rule
- DATA-021: - Note (2026-02-07): Added campaign-scoped ICP version persistence in generation/edit services: `POST /api/icp/generate` now creates an active `icp_versions` row (`WEBSITE` for website input, `MANUAL` for product-description input), and profile edits update the active website/manual version in place or create a new active manual version when the active source is non-editable (e.g., template/specialist). Added integration assertions in `tests/integration/icp-generate.test.ts` and `tests/integration/icp-editor.test.ts` for creation, active-version updates, and fallback new-version creation behavior. Files touched: `lib/icp/generate-icp-profile.ts`, `lib/icp/update-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-generate.test.ts`, `tests/integration/icp-editor.test.ts`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- UX-R-148: - [x] **Add ICP Center route `/app/campaigns/:id/icp` (versions + select active)**
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.
- UX-R-293: - User can edit and save ICP versions.
- UX-R-304: - “We couldn’t create a high-quality ICP from your website alone.”
- UX-R-314: - If still not identified → offer “Specialist AI interview” to create a high-quality ICP.
- UX-R-359: - A user can launch a campaign end-to-end (ICP → import leads → sequence → send) in **≤ 20 minutes**.
- DATA-040: - **Product Archetype**: classified model/category used to select an ICP template.
- UX-R-389: 1. Create a Source Run from ICP + filters + limits.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/icp/improve`

### Source Coverage

- Requirement IDs:
  - UX-R-144
  - UX-R-427

### Purpose

- UX-R-427: - `/app/campaigns/:id/icp/improve` Specialist ICP Interview wizard


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-144: - [x] **Implement Specialist ICP Interview wizard route `/app/campaigns/:id/icp/improve`**
- UX-R-427: - `/app/campaigns/:id/icp/improve` Specialist ICP Interview wizard


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/leads`

### Source Coverage

- Requirement IDs:
  - UX-R-424

### Purpose

- UX-R-424: - `/app/campaigns/:id/leads` Approved leads table (filter, suppression)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-424: - `/app/campaigns/:id/leads` Approved leads table (filter, suppression)


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-424: - `/app/campaigns/:id/leads` Approved leads table (filter, suppression)


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:id/sequence`

### Source Coverage

- Requirement IDs:
  - COMP-004
  - COMP-005
  - UX-R-214
  - UX-R-257
  - UX-R-284
  - UX-R-340
  - UX-R-341
  - UX-R-359
  - UX-R-364
  - UX-R-370
  - UX-R-386
  - DATA-042
  - UX-R-425
  - UX-R-461
  - UX-R-512

### Purpose

- UX-R-425: - `/app/campaigns/:id/sequence` Sequence builder + templates


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- COMP-004: - [x] Create migrations for sequences/templates/send_jobs/conversations/messages/audit/provenance
- COMP-005: - Note (2026-02-06): Added Prisma models/enums for `sequences`, `sequence_steps`, `message_templates`, `send_jobs`, `conversations`, `messages`, `audit_events`, `lead_sources`, and `lead_field_provenance`; created migration `20260206050107` and verified `send_jobs_idempotency_key_key` unique index exists in SQL. Verified with `prisma migrate status` against Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206050107/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-214: - [ ] Sequence CRUD APIs
- UX-R-257: - [ ] Stop sequence on reply + cancel future jobs
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.
- UX-R-340: 5) **Sequences + AI drafting (operator-first)**
- UX-R-341: - Sequence builder for **email** steps (MVP): step timing, stop-on-reply, per-step templates.
- UX-R-359: - A user can launch a campaign end-to-end (ICP → import leads → sequence → send) in **≤ 20 minutes**.
- UX-R-364: - **Campaign**: outreach effort tied to an ICP, lead pipeline config, and sequence.
- UX-R-370: - **Sequence Step**: scheduled action (email step in MVP).
- UX-R-386: 7. Configure sequence (steps + timing) → AI drafts templates → user edits.
- DATA-042: - Consequence: determines API shapes, cost model, and which fields are reliably available.
- UX-R-425: - `/app/campaigns/:id/sequence` Sequence builder + templates
- UX-R-461: 7. Build sequence → AI drafts templates → user edits.
- UX-R-512: - Sequence builder linear; stop conditions enforced.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- COMP-004: - [x] Create migrations for sequences/templates/send_jobs/conversations/messages/audit/provenance
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.
- UX-R-359: - A user can launch a campaign end-to-end (ICP → import leads → sequence → send) in **≤ 20 minutes**.
- UX-R-386: 7. Configure sequence (steps + timing) → AI drafts templates → user edits.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-004: - [x] Create migrations for sequences/templates/send_jobs/conversations/messages/audit/provenance
- COMP-005: - Note (2026-02-06): Added Prisma models/enums for `sequences`, `sequence_steps`, `message_templates`, `send_jobs`, `conversations`, `messages`, `audit_events`, `lead_sources`, and `lead_field_provenance`; created migration `20260206050107` and verified `send_jobs_idempotency_key_key` unique index exists in SQL. Verified with `prisma migrate status` against Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206050107/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/new`

### Source Coverage

- Requirement IDs:
  - UX-R-098
  - UX-R-106
  - UX-R-114
  - UX-R-121
  - UX-R-284
  - UX-R-420

### Purpose

- UX-R-420: - `/app/campaigns/new` Campaign wizard


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-098: - Note (2026-02-06): Confirmed Phase 4 wizard route/step boundaries in `docs/SOFTWARE_DOCUMENTATION.md` for `/app/campaigns/new`, including Step 1 xor-input validation contract and explicit scope limits (Step 1 + ICP draft/edit only). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-106: - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-114: - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.
- UX-R-420: - `/app/campaigns/new` Campaign wizard


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-098: - Note (2026-02-06): Confirmed Phase 4 wizard route/step boundaries in `docs/SOFTWARE_DOCUMENTATION.md` for `/app/campaigns/new`, including Step 1 xor-input validation contract and explicit scope limits (Step 1 + ICP draft/edit only). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-114: - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-284: - Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/leads/:leadId`

### Source Coverage

- Requirement IDs:
  - UX-R-430

### Purpose

- UX-R-430: - `/app/leads/:leadId` Lead detail (profile, provenance, timeline)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-430: - `/app/leads/:leadId` Lead detail (profile, provenance, timeline)


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/onboarding`

### Source Coverage

- Requirement IDs:
  - UX-R-418
  - UX-R-442
  - UX-R-448
  - UX-R-452

### Purpose

- UX-R-448: 4. Land in `/app/onboarding`


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-418: - `/app/onboarding` Connect inbox + workspace defaults
- UX-R-442: - After first successful auth, user is routed into onboarding and workspace provisioning flow.
- UX-R-448: 4. Land in `/app/onboarding`
- UX-R-452: 1. User signs in → onboarding prompts to connect Gmail/M365.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-418: - `/app/onboarding` Connect inbox + workspace defaults
- UX-R-452: 1. User signs in → onboarding prompts to connect Gmail/M365.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/replies`

### Source Coverage

- Requirement IDs:
  - UX-R-260
  - UX-R-281
  - UX-R-350
  - COMP-021
  - UX-R-351
  - UX-R-356
  - UX-R-360
  - UX-R-399
  - UX-R-429
  - UX-R-466
  - UX-R-467
  - UX-R-520

### Purpose

- UX-R-467: 1. Replies appear in `/app/replies`.


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-260: - [ ] Replies inbox UI + thread view
- UX-R-281: - **JTBD:** “Create and run a controlled outbound campaign without juggling tools or damaging domain reputation; keep messaging human-quality; handle replies reliably.”
- UX-R-350: 8) **Replies + pipeline**
- COMP-021: - Unified “Replies” view: categorize (Interested / Objection / Not now / Unsubscribe / Wrong person / Bounce).
- UX-R-351: - AI suggested replies (draft-only) for human approval.
- UX-R-356: - Automated AI replies without human approval.
- UX-R-360: - Replies are captured and visible in app for connected inboxes; user can categorize and respond.
- UX-R-399: 3. User sees reply in “Replies” inbox.
- UX-R-429: - `/app/replies` Unified replies inbox
- UX-R-466: 4) **Handle replies**
- UX-R-467: 1. Replies appear in `/app/replies`.
- UX-R-520: - Metrics: queued/sent/failed/replies/bounces/unsubs.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-281: - **JTBD:** “Create and run a controlled outbound campaign without juggling tools or damaging domain reputation; keep messaging human-quality; handle replies reliably.”


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-021: - Unified “Replies” view: categorize (Interested / Objection / Not now / Unsubscribe / Wrong person / Bounce).


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings`

### Source Coverage

- Requirement IDs:
  - UX-R-021
  - UX-R-022
  - UX-R-089
  - UX-R-090
  - UX-R-094
  - UX-R-118
  - UX-R-363
  - UX-R-431
  - UX-R-502

### Purpose

- UX-R-431: - `/app/settings` Workspace settings


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-021: - [x] Verify Vercel Production Branch = `main` in project settings
- UX-R-022: - Acceptance: Vercel project settings show Production Branch as `main`
- UX-R-089: - [x] Inbox settings (caps/windows/ramp) UI + API
- UX-R-090: - Acceptance: persisted settings
- UX-R-094: - Note (2026-02-06): Added explicit "Phase 3 closeout" documentation with completion summary (Google OAuth connect, encrypted token storage/refresh, inbox settings API/UI), carry-forward decisions, migration/runtime gotchas, and validation command evidence. Also corrected stale Phase 3 note so token persistence status matches implementation. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
- UX-R-363: - **Workspace**: container for data, settings, connected inboxes, sources.
- UX-R-431: - `/app/settings` Workspace settings
- UX-R-502: - connector disabled in settings → block and link to settings


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-094: - Note (2026-02-06): Added explicit "Phase 3 closeout" documentation with completion summary (Google OAuth connect, encrypted token storage/refresh, inbox settings API/UI), carry-forward decisions, migration/runtime gotchas, and validation command evidence. Also corrected stale Phase 3 note so token persistence status matches implementation. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/deliverability`

### Source Coverage

- Requirement IDs:
  - SAFE-004
  - SAFE-007
  - SAFE-011
  - SAFE-013
  - UX-R-433
  - SAFE-022
  - SAFE-023
  - SAFE-025

### Purpose

- UX-R-433: - `/app/settings/deliverability`


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- SAFE-004: - Usage: deliverability warnings, “needs attention”.
- SAFE-007: - Functional, plain, deliverability-safe.
- SAFE-011: 6) **Deliverability “safe primitives” (enforced defaults)**
- SAFE-013: 8. Deliverability checks run (required) → user resolves blockers.
- UX-R-433: - `/app/settings/deliverability`
- SAFE-022: 8. Deliverability checklist runs → resolve blockers.
- SAFE-023: 3. Deliverability events trigger prompts (e.g., high bounce rate → recommend pause).
- SAFE-025: - deliverability checklist blockers/warnings


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- SAFE-023: 3. Deliverability events trigger prompts (e.g., high bounce rate → recommend pause).


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- SAFE-004: - Usage: deliverability warnings, “needs attention”.
- SAFE-007: - Functional, plain, deliverability-safe.
- SAFE-011: 6) **Deliverability “safe primitives” (enforced defaults)**
- SAFE-013: 8. Deliverability checks run (required) → user resolves blockers.
- SAFE-022: 8. Deliverability checklist runs → resolve blockers.
- SAFE-023: 3. Deliverability events trigger prompts (e.g., high bounce rate → recommend pause).
- SAFE-025: - deliverability checklist blockers/warnings


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/icp-templates`

### Source Coverage

- Requirement IDs:
  - UX-R-428

### Purpose

- UX-R-428: - `/app/settings/icp-templates` (optional admin-only in MVP; can be hidden behind feature flag)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-428: - `/app/settings/icp-templates` (optional admin-only in MVP; can be hidden behind feature flag)


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/inboxes`

### Source Coverage

- Requirement IDs:
  - DATA-005
  - UX-R-044
  - UX-R-085
  - UX-R-092
  - UX-R-360
  - UX-R-363
  - UX-R-432

### Purpose

- UX-R-432: - `/app/settings/inboxes`


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- DATA-005: - Default UI density: **compact-professional** (tables and inboxes must be scannable).
- UX-R-044: - [x] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-092: - Note (2026-02-06): Added persisted inbox settings fields on `inbox_connections` (`daily_send_cap`, `send_window_start_hour`, `send_window_end_hour`, `ramp_up_per_day`), implemented `PATCH /api/inboxes/:inboxConnectionId/settings` with workspace-ownership and input validation, and added `/app/settings/inboxes` form for saving settings. Added integration coverage for persistence and validation failures. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206142046_add_inbox_connection_sending_settings/migration.sql`, `lib/inbox/inbox-settings.ts`, `app/api/inboxes/[inboxConnectionId]/settings/route.ts`, `app/app/settings/inboxes/inbox-settings-form.tsx`, `app/app/settings/inboxes/page.tsx`, `tests/integration/inbox-settings.test.ts`, `package.json`, `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-360: - Replies are captured and visible in app for connected inboxes; user can categorize and respond.
- UX-R-363: - **Workspace**: container for data, settings, connected inboxes, sources.
- UX-R-432: - `/app/settings/inboxes`


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-044: - [x] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/sources`

### Source Coverage

- Requirement IDs:
  - COMP-005
  - UX-R-118
  - UX-R-119
  - UX-R-121
  - UX-R-162
  - UX-R-166
  - UX-R-170
  - UX-R-174
  - UX-R-178
  - UX-R-182
  - UX-R-186
  - UX-R-193
  - UX-R-201
  - UX-R-205
  - COMP-014
  - UX-R-363
  - COMP-031
  - UX-R-435

### Purpose

- UX-R-435: - `/app/settings/sources` Source connectors + governance


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- COMP-005: - Note (2026-02-06): Added Prisma models/enums for `sequences`, `sequence_steps`, `message_templates`, `send_jobs`, `conversations`, `messages`, `audit_events`, `lead_sources`, and `lead_field_provenance`; created migration `20260206050107` and verified `send_jobs_idempotency_key_key` unique index exists in SQL. Verified with `prisma migrate status` against Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206050107/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
- UX-R-119: - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-162: - Note (2026-02-07): Added `GET/POST /api/sources` and `PATCH /api/sources/:id` routes backed by workspace-scoped source connector service functions. Added disabled-connector run guard (`assertSourceConnectorEnabledForWorkspace`) and integration coverage in `tests/integration/source-connectors-crud.test.ts` proving create/update/disable behavior and disabled-run blocking. Files touched: `app/api/sources/route.ts`, `app/api/sources/[sourceConnectorId]/route.ts`, `lib/sources/source-connectors.ts`, `tests/integration/source-connectors-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-166: - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-170: - Note (2026-02-07): Added PDL provider wrapper `lib/sources/pdl-client.ts` with typed candidate response parsing, request pacing (`minRequestIntervalMs`), transient retry/backoff for `429/5xx`, and cursor-based pagination (`searchPage`, `fetchAllCandidates`). Added unit retry/backoff coverage in `tests/unit/pdl-client.test.ts` and mock-provider pagination integration coverage in `tests/integration/pdl-client-mock.test.ts`. Files touched: `lib/sources/pdl-client.ts`, `tests/unit/pdl-client.test.ts`, `tests/integration/pdl-client-mock.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-174: - Note (2026-02-07): Added discovery run worker `executeDiscoveryRun` in `lib/sources/discovery-run-worker.ts` to transition run status (`QUEUED` -> `RUNNING` -> `COMPLETED/FAILED`), fetch candidates via provider client abstraction, normalize and persist candidate rows, and record run stats in `source_runs.stats_json`. Added integration coverage in `tests/integration/discovery-run-worker.test.ts` with mocked provider responses. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-178: - Note (2026-02-07): Added `lib/sources/email-verification-client.ts` (retry-capable, provider-keyed batch verify client) and `lib/sources/email-verification-worker.ts` (`verifyCandidateEmailsForSourceRun`) that writes `email_verifications` rows and updates candidate `verification_status` values for the source run. Added integration coverage in `tests/integration/email-verification-worker.test.ts` with a mocked verifier implementation. Files touched: `lib/sources/email-verification-client.ts`, `lib/sources/email-verification-worker.ts`, `tests/integration/email-verification-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-182: - Note (2026-02-08): Extended discovery worker candidate creation path to apply suppression list + dedupe rules (existing suppressions, existing leads, existing campaign candidates, and same-run duplicates by email/person/company IDs). Candidates matching these checks are persisted with `status=SUPPRESSED`, while approvable rows remain `status=NEW`. Added integration coverage in `tests/integration/discovery-run-suppression-dedupe.test.ts` and updated worker stats to include `approvableCandidates`, `suppressedByBlocklist`, and `suppressedByDuplicate`. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `tests/integration/discovery-run-suppression-dedupe.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-193: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-201: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/csv` backed by `importCsvLeadsForWorkspace` service with CSV parsing, row-level outcome reporting, suppression filtering, dedupe (in-file + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=csv_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/csv-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/csv/route.ts`, `lib/leads/csv-import.ts`, `tests/integration/csv-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-205: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/manual` backed by `importManualLeadsForWorkspace` with payload-level email validation, suppression filtering, dedupe (in-request + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=manual_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/manual-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/manual/route.ts`, `lib/leads/manual-import.ts`, `tests/integration/manual-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-014: - Lead sources are **licensed/authorized** connectors (no unauthorized scraping as a product feature).
- UX-R-363: - **Workspace**: container for data, settings, connected inboxes, sources.
- COMP-031: - Lead discovery is implemented via **licensed/authorized** data sources (no unauthorized scraping as a core feature).
- UX-R-435: - `/app/settings/sources` Source connectors + governance


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-118: - [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
- UX-R-119: - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-162: - Note (2026-02-07): Added `GET/POST /api/sources` and `PATCH /api/sources/:id` routes backed by workspace-scoped source connector service functions. Added disabled-connector run guard (`assertSourceConnectorEnabledForWorkspace`) and integration coverage in `tests/integration/source-connectors-crud.test.ts` proving create/update/disable behavior and disabled-run blocking. Files touched: `app/api/sources/route.ts`, `app/api/sources/[sourceConnectorId]/route.ts`, `lib/sources/source-connectors.ts`, `tests/integration/source-connectors-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-166: - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-193: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-201: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/csv` backed by `importCsvLeadsForWorkspace` service with CSV parsing, row-level outcome reporting, suppression filtering, dedupe (in-file + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=csv_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/csv-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/csv/route.ts`, `lib/leads/csv-import.ts`, `tests/integration/csv-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-205: - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/manual` backed by `importManualLeadsForWorkspace` with payload-level email validation, suppression filtering, dedupe (in-request + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=manual_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/manual-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/manual/route.ts`, `lib/leads/manual-import.ts`, `tests/integration/manual-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-005: - Note (2026-02-06): Added Prisma models/enums for `sequences`, `sequence_steps`, `message_templates`, `send_jobs`, `conversations`, `messages`, `audit_events`, `lead_sources`, and `lead_field_provenance`; created migration `20260206050107` and verified `send_jobs_idempotency_key_key` unique index exists in SQL. Verified with `prisma migrate status` against Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206050107/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-014: - Lead sources are **licensed/authorized** connectors (no unauthorized scraping as a product feature).
- COMP-031: - Lead discovery is implemented via **licensed/authorized** data sources (no unauthorized scraping as a core feature).


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/suppressions`

### Source Coverage

- Requirement IDs:
  - UX-R-046
  - DATA-013
  - UX-R-182
  - COMP-024
  - UX-R-392
  - UX-R-434

### Purpose

- UX-R-434: - `/app/settings/suppressions`


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-046: - [x] Create migrations for leads/campaign_leads/suppressions
- DATA-013: - Note (2026-02-06): Added `Lead`, `CampaignLead`, and `Suppression` Prisma models with dedupe constraints (`@@unique([workspaceId, email])` on leads/suppressions and `@@unique([campaignId, leadId])` on campaign_leads). Created migration `20260206043217_create_leads_and_suppressions` and verified `prisma migrate status` reports schema up to date on the Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206043217_create_leads_and_suppressions/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-182: - Note (2026-02-08): Extended discovery worker candidate creation path to apply suppression list + dedupe rules (existing suppressions, existing leads, existing campaign candidates, and same-run duplicates by email/person/company IDs). Candidates matching these checks are persisted with `status=SUPPRESSED`, while approvable rows remain `status=NEW`. Added integration coverage in `tests/integration/discovery-run-suppression-dedupe.test.ts` and updated worker stats to include `approvableCandidates`, `suppressedByBlocklist`, and `suppressedByDuplicate`. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `tests/integration/discovery-run-suppression-dedupe.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-024: - Audit logs for critical events (connect inbox, launch campaign, sends, suppressions).
- UX-R-392: 5. Apply suppressions and dedupe → mark remaining as Candidates (ready for review).
- UX-R-434: - `/app/settings/suppressions`


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-046: - [x] Create migrations for leads/campaign_leads/suppressions
- COMP-024: - Audit logs for critical events (connect inbox, launch campaign, sends, suppressions).


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- COMP-024: - Audit logs for critical events (connect inbox, launch campaign, sends, suppressions).


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/verification`

### Source Coverage

- Requirement IDs:
  - UX-R-029
  - UX-R-032
  - DATA-026
  - DATA-027
  - UX-R-175
  - UX-R-176
  - UX-R-178
  - UX-R-184
  - UX-R-186
  - DATA-028
  - COMP-013
  - SAFE-010
  - UX-R-337
  - UX-R-369
  - UX-R-384
  - UX-R-391
  - UX-R-404
  - UX-R-436
  - UX-R-503
  - UX-R-505
  - UX-R-509
  - UX-R-536
  - UX-R-538

### Purpose

- UX-R-436: - `/app/settings/verification` Email verification provider settings (MVP minimal)


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-029: - [x] Add PR hygiene + verification automation baseline
- UX-R-032: - Note (2026-02-06): Updated `AGENTS.md` for path and wording clarity, added `.github/pull_request_template.md`, added `verify` script in `package.json`, added `.github/workflows/pr-verify.yml` for pull-request verification on `release`, and applied `release` branch protection requiring `verify` status before merge. Files touched: `AGENTS.md`, `.github/pull_request_template.md`, `package.json`, `.github/workflows/pr-verify.yml`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- DATA-026: - [x] Add DB tables for source_connectors, source_runs, candidates, email_verifications
- DATA-027: - Note (2026-02-07): Added Prisma models/enums for `source_connectors`, `source_runs`, `candidates`, and `email_verifications` with required indexes (`candidates_campaign_id_idx`, `candidates_source_run_id_idx`, `candidates_email_idx`) and generated migration `20260207162122_add_source_discovery_tables`. Added integration coverage in `tests/integration/source-discovery-schema.test.ts` to verify table + index presence. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207162122_add_source_discovery_tables/migration.sql`, `tests/integration/source-discovery-schema.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-175: - [x] Implement email verification client + batch verify worker
- UX-R-176: - Acceptance: writes email_verifications; updates candidates verification_status
- UX-R-178: - Note (2026-02-07): Added `lib/sources/email-verification-client.ts` (retry-capable, provider-keyed batch verify client) and `lib/sources/email-verification-worker.ts` (`verifyCandidateEmailsForSourceRun`) that writes `email_verifications` rows and updates candidate `verification_status` values for the source run. Added integration coverage in `tests/integration/email-verification-worker.test.ts` with a mocked verifier implementation. Files touched: `lib/sources/email-verification-client.ts`, `lib/sources/email-verification-worker.ts`, `tests/integration/email-verification-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-184: - Acceptance: filters work (verification, confidence, role, source_run)
- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- DATA-028: - Note (2026-02-08): Added explicit Phase 5 closeout documentation with completion summary, implementation decisions, and operational gotchas for discovery runs, candidate approval gating, and verification enforcement. Updated route/API/data-model summaries and changelog continuity in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- COMP-013: 3) **Leads: Automated discovery + enrichment + verification (compliance-first)**
- SAFE-010: 3.3) **Email verification + suppression safety**
- UX-R-337: - Integrated email verification provider; store result + timestamp.
- UX-R-369: - **Email Verification**: verification result record (status, provider, checked_at).
- UX-R-384: - require email verification status (or set override)
- UX-R-391: 4. Verify emails (batch) → attach verification status + checked_at.
- UX-R-404: 2) **Email verification provider**
- UX-R-436: - `/app/settings/verification` Email verification provider settings (MVP minimal)
- UX-R-503: - missing verification provider configured → allow run but warn that sending will be restricted
- UX-R-505: - filters: verification status, role, seniority, company size, geo, confidence
- UX-R-509: - approval enforces suppression + dedupe + verification rules
- UX-R-536: - Filters by: status, replied, suppressed, verification status, source run.
- UX-R-538: - Lead detail shows: timeline + provenance + verification record.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-186: - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

- SAFE-010: 3.3) **Email verification + suppression safety**
- COMP-013: 3) **Leads: Automated discovery + enrichment + verification (compliance-first)**


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/login`

### Source Coverage

- Requirement IDs:
  - UX-R-064
  - UX-R-067
  - UX-R-068
  - UX-R-071
  - UX-R-440

### Purpose

- UX-R-440: - Login/signup should be one shared entry flow at `/login` with minimal fields and clear provider choices.


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-064: - [x] Add NextAuth for app login
- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-068: - [x] Auto-provision workspace on first login
- UX-R-071: - Note (2026-02-06): Added `ensureUserWorkspace` provisioning helper and invoked it in NextAuth `signIn` callback so first successful login upserts user + creates one default workspace, while subsequent logins reuse the existing workspace. Added integration coverage for idempotent provisioning behavior. Files touched: `auth.ts`, `lib/auth/ensure-user-workspace.ts`, `tests/integration/ensure-user-workspace.test.ts`, `package.json`, `package-lock.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-440: - Login/signup should be one shared entry flow at `/login` with minimal fields and clear provider choices.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/auth/[...nextauth]`

### Source Coverage

- Requirement IDs:
  - UX-R-067

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/cron/sync-inbox`

### Source Coverage

- Requirement IDs:
  - UX-R-254

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-254: - [ ] `/api/cron/sync-inbox` polling for replies


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/cron/tick`

### Source Coverage

- Requirement IDs:
  - UX-R-241

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-241: - [ ] `/api/cron/tick` due-job selection + locking


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/icp/classify-archetype`

### Source Coverage

- Requirement IDs:
  - UX-R-136

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-136: - [x] **Implement archetype classification endpoint `/api/icp/classify-archetype`**


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/icp/interview/answer`

### Source Coverage

- Requirement IDs:
  - UX-R-147

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/icp/interview/complete`

### Source Coverage

- Requirement IDs:
  - UX-R-147

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/icp/interview/start`

### Source Coverage

- Requirement IDs:
  - UX-R-147

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/icp/score`

### Source Coverage

- Requirement IDs:
  - UX-R-129
  - UX-R-151

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-129: - [x] **Implement `/api/icp/score` endpoint + persistence of `icp_quality_scores`**
- UX-R-151: - Note (2026-02-07): Added campaign-scoped ICP Center route at `/app/campaigns/[campaignId]/icp` with versions table, latest score/tier display, active-version indicator, `Set active` action, and `Re-score` action wired to `/api/icp/score`. Added active-version API `PATCH /api/campaigns/[campaignId]/icp/active` and ICP center service layer for version listing/ownership-safe activation. Added integration coverage in `tests/integration/icp-center.test.ts`. Files touched: `app/app/campaigns/[campaignId]/icp/page.tsx`, `app/app/campaigns/[campaignId]/icp/icp-center-client.tsx`, `app/api/campaigns/[campaignId]/icp/active/route.ts`, `lib/icp/icp-center.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `tests/integration/icp-center.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/inboxes/google/callback`

### Source Coverage

- Requirement IDs:
  - UX-R-085

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/api/inboxes/google/connect`

### Source Coverage

- Requirement IDs:
  - UX-R-085

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/*`

### Source Coverage

- Requirement IDs:
  - UX-R-067

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/`

### Source Coverage

- Requirement IDs:
  - UX-R-121
  - UX-R-147
  - UX-R-151
  - UX-R-190
  - UX-R-209

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-151: - Note (2026-02-07): Added campaign-scoped ICP Center route at `/app/campaigns/[campaignId]/icp` with versions table, latest score/tier display, active-version indicator, `Set active` action, and `Re-score` action wired to `/api/icp/score`. Added active-version API `PATCH /api/campaigns/[campaignId]/icp/active` and ICP center service layer for version listing/ownership-safe activation. Added integration coverage in `tests/integration/icp-center.test.ts`. Files touched: `app/app/campaigns/[campaignId]/icp/page.tsx`, `app/app/campaigns/[campaignId]/icp/icp-center-client.tsx`, `app/api/campaigns/[campaignId]/icp/active/route.ts`, `lib/icp/icp-center.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `tests/integration/icp-center.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-190: - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-209: - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-190: - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-209: - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/:campaignId/leads`

### Source Coverage

- Requirement IDs:
  - UX-R-209

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-209: - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-209: - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/[campaignId]`

### Source Coverage

- Requirement IDs:
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/[campaignId]/icp`

### Source Coverage

- Requirement IDs:
  - UX-R-151

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-151: - Note (2026-02-07): Added campaign-scoped ICP Center route at `/app/campaigns/[campaignId]/icp` with versions table, latest score/tier display, active-version indicator, `Set active` action, and `Re-score` action wired to `/api/icp/score`. Added active-version API `PATCH /api/campaigns/[campaignId]/icp/active` and ICP center service layer for version listing/ownership-safe activation. Added integration coverage in `tests/integration/icp-center.test.ts`. Files touched: `app/app/campaigns/[campaignId]/icp/page.tsx`, `app/app/campaigns/[campaignId]/icp/icp-center-client.tsx`, `app/api/campaigns/[campaignId]/icp/active/route.ts`, `lib/icp/icp-center.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `tests/integration/icp-center.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/[campaignId]/icp/improve`

### Source Coverage

- Requirement IDs:
  - UX-R-147

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/campaigns-client`

### Source Coverage

- Requirement IDs:
  - UX-R-102
  - UX-R-106
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-106: - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/new/page`

### Source Coverage

- Requirement IDs:
  - UX-R-106
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-106: - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/new/wizard-step1-form`

### Source Coverage

- Requirement IDs:
  - UX-R-106
  - UX-R-114
  - UX-R-115
  - UX-R-121
  - UX-R-135
  - UX-R-143
  - UX-R-147

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-106: - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-114: - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-115: - Follow-up note (2026-02-06): Adjusted Step 1 UX so typing into website/product-description auto-clears the alternate source, and added explicit Step 2 "last saved" feedback in the editor after `PATCH` success. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-135: - Note (2026-02-07): Added an ICP Quality Panel to Step 2 in `app/app/campaigns/new/wizard-step1-form.tsx` with rubric scoring integration (`POST /api/icp/score`), score/tier display, missing-fields/questions visibility, `Improve ICP` CTA, and `Continue anyway to Step 3` behavior that adapts to `USABLE`/`INSUFFICIENT` tiers. Quality scoring is automatically triggered after generation and after saves when `campaignId` + `icpVersionId` are available, and can be manually re-run. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-143: - Note (2026-02-07): Added Scenario A/B quality-gate modal flow logic to `app/app/campaigns/new/wizard-step1-form.tsx`: insufficient-score (`tier=INSUFFICIENT`) now triggers archetype classification, opens Scenario A when archetype confidence meets threshold, otherwise Scenario B with disambiguation-question submission loop. Included required buttons (`Apply template`, `Improve with Specialist AI`, `Continue anyway` / `Answer questions`) and persistence behavior by recording wizard state on continue/disambiguation actions. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-147: - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-114: - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/new?campaignId=`

### Source Coverage

- Requirement IDs:
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/campaigns/page`

### Source Coverage

- Requirement IDs:
  - UX-R-102
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/page`

### Source Coverage

- Requirement IDs:
  - UX-R-067
  - UX-R-085
  - UX-R-102
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/inboxes/`

### Source Coverage

- Requirement IDs:
  - UX-R-102

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-102: - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/inboxes/inbox-settings-form`

### Source Coverage

- Requirement IDs:
  - UX-R-092

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-092: - Note (2026-02-06): Added persisted inbox settings fields on `inbox_connections` (`daily_send_cap`, `send_window_start_hour`, `send_window_end_hour`, `ramp_up_per_day`), implemented `PATCH /api/inboxes/:inboxConnectionId/settings` with workspace-ownership and input validation, and added `/app/settings/inboxes` form for saving settings. Added integration coverage for persistence and validation failures. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206142046_add_inbox_connection_sending_settings/migration.sql`, `lib/inbox/inbox-settings.ts`, `app/api/inboxes/[inboxConnectionId]/settings/route.ts`, `app/app/settings/inboxes/inbox-settings-form.tsx`, `app/app/settings/inboxes/page.tsx`, `tests/integration/inbox-settings.test.ts`, `package.json`, `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/inboxes/page`

### Source Coverage

- Requirement IDs:
  - UX-R-085
  - UX-R-092

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-092: - Note (2026-02-06): Added persisted inbox settings fields on `inbox_connections` (`daily_send_cap`, `send_window_start_hour`, `send_window_end_hour`, `ramp_up_per_day`), implemented `PATCH /api/inboxes/:inboxConnectionId/settings` with workspace-ownership and input validation, and added `/app/settings/inboxes` form for saving settings. Added integration coverage for persistence and validation failures. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206142046_add_inbox_connection_sending_settings/migration.sql`, `lib/inbox/inbox-settings.ts`, `app/api/inboxes/[inboxConnectionId]/settings/route.ts`, `app/app/settings/inboxes/inbox-settings-form.tsx`, `app/app/settings/inboxes/page.tsx`, `tests/integration/inbox-settings.test.ts`, `package.json`, `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-085: - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/settings/sources/page`

### Source Coverage

- Requirement IDs:
  - UX-R-121

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

- UX-R-121: - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `/app/sign-out-button`

### Source Coverage

- Requirement IDs:
  - UX-R-067

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- UX-R-067: - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


### States

- Loading: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Empty: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Error: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Permission: [UNSPECIFIED — REQUIRES PRODUCT DECISION]
- Data states: [UNSPECIFIED — REQUIRES PRODUCT DECISION]


### User Actions

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Edge Cases

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Compliance / Safety

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Accessibility Requirements

[UNSPECIFIED — REQUIRES PRODUCT DECISION]

---

## Screen: `[GLOBAL_OR_UNMAPPED]`

### Source Coverage

- Requirement IDs:
  - COMP-001
  - COMP-002
  - UI-R-001
  - UI-R-002
  - STATE-001
  - DATA-001
  - COMP-003
  - UI-R-003
  - SAFE-001
  - UI-R-004
  - UI-R-005
  - UI-R-006
  - UI-R-007
  - UI-R-008
  - STATE-002
  - UI-R-009
  - UI-R-010
  - STATE-003
  - UI-R-011
  - UI-R-012
  - SAFE-002
  - UI-R-013
  - UI-R-014
  - UI-R-015
  - UI-R-016
  - STATE-004
  - STATE-005
  - UI-R-017
  - UI-R-018
  - UI-R-019
  - UI-R-020
  - UI-R-021
  - STATE-006
  - UI-R-022
  - UI-R-023
  - UI-R-024
  - UI-R-025
  - UI-R-026
  - UI-R-027
  - UI-R-028
  - DATA-002
  - UI-R-029
  - UI-R-030
  - UI-R-031
  - UI-R-032
  - UI-R-033
  - UI-R-034
  - STATE-007
  - UI-R-035
  - UI-R-036
  - DATA-003
  - UI-R-037
  - UI-R-038
  - UI-R-039
  - UI-R-040
  - STATE-008
  - UI-R-041
  - UI-R-042
  - UI-R-043
  - UI-R-044
  - UI-R-045
  - UI-R-046
  - UI-R-047
  - UI-R-048
  - UI-R-049
  - UI-R-050
  - UI-R-051
  - UI-R-052
  - UI-R-053
  - UI-R-054
  - UI-R-055
  - UI-R-056
  - UI-R-057
  - UI-R-058
  - UI-R-059
  - SAFE-003
  - UI-R-060
  - STATE-009
  - UI-R-061
  - UI-R-062
  - STATE-010
  - STATE-011
  - UI-R-063
  - UI-R-064
  - UI-R-065
  - UI-R-066
  - UI-R-067
  - STATE-012
  - UI-R-068
  - UI-R-069
  - UI-R-070
  - STATE-013
  - UI-R-071
  - UI-R-072
  - STATE-014
  - UI-R-073
  - UI-R-074
  - UI-R-075
  - STATE-015
  - UI-R-076
  - UI-R-077
  - UI-R-078
  - UI-R-079
  - UI-R-080
  - UI-R-081
  - UI-R-082
  - UI-R-083
  - UI-R-084
  - UI-R-085
  - UI-R-086
  - UI-R-087
  - UI-R-088
  - UI-R-089
  - UI-R-090
  - UI-R-091
  - UI-R-092
  - UI-R-093
  - UI-R-094
  - UI-R-095
  - UI-R-096
  - UI-R-097
  - UI-R-098
  - UI-R-099
  - UI-R-100
  - UI-R-101
  - UI-R-102
  - UI-R-103
  - UI-R-104
  - UI-R-105
  - STATE-016
  - UI-R-106
  - UI-R-107
  - DATA-004
  - UI-R-108
  - UI-R-109
  - UI-R-110
  - UI-R-111
  - UI-R-112
  - UI-R-113
  - UI-R-114
  - UI-R-115
  - UI-R-116
  - UI-R-117
  - UI-R-118
  - UI-R-119
  - UI-R-120
  - UI-R-121
  - UI-R-122
  - UI-R-123
  - UI-R-124
  - UI-R-125
  - UI-R-126
  - UI-R-127
  - UI-R-128
  - UI-R-129
  - UI-R-130
  - UI-R-131
  - UI-R-132
  - UI-R-133
  - UI-R-134
  - UI-R-135
  - UI-R-136
  - UI-R-137
  - UI-R-138
  - UI-R-139
  - UI-R-140
  - UI-R-141
  - UI-R-142
  - UI-R-143
  - UI-R-144
  - UI-R-145
  - UI-R-146
  - UI-R-147
  - UI-R-148
  - UI-R-149
  - DATA-006
  - UI-R-150
  - UI-R-151
  - UI-R-152
  - UI-R-153
  - UI-R-154
  - UI-R-155
  - UI-R-156
  - UI-R-157
  - UI-R-158
  - UI-R-159
  - UI-R-160
  - UI-R-161
  - UI-R-162
  - UI-R-163
  - STATE-017
  - STATE-018
  - STATE-019
  - UI-R-164
  - UI-R-165
  - UI-R-166
  - UI-R-167
  - UI-R-168
  - UI-R-169
  - UI-R-170
  - UI-R-171
  - UI-R-172
  - UI-R-173
  - SAFE-005
  - STATE-020
  - UI-R-174
  - UI-R-175
  - UI-R-176
  - UI-R-177
  - UI-R-178
  - UI-R-179
  - UI-R-180
  - UI-R-181
  - UI-R-182
  - UI-R-183
  - UI-R-184
  - UI-R-185
  - STATE-021
  - UI-R-186
  - UI-R-187
  - UI-R-188
  - UI-R-189
  - UI-R-190
  - UI-R-191
  - STATE-022
  - UI-R-192
  - UI-R-193
  - UI-R-194
  - UI-R-195
  - UI-R-196
  - UI-R-197
  - UI-R-198
  - UI-R-199
  - UI-R-200
  - SAFE-006
  - UI-R-201
  - UI-R-202
  - UI-R-203
  - UI-R-204
  - UI-R-205
  - UI-R-206
  - UI-R-207
  - UI-R-208
  - UI-R-209
  - UI-R-210
  - UI-R-211
  - UI-R-212
  - UI-R-213
  - UI-R-214
  - UI-R-215
  - UI-R-216
  - STATE-023
  - STATE-024
  - STATE-025
  - STATE-026
  - UI-R-217
  - UI-R-218
  - UI-R-219
  - UI-R-220
  - UI-R-221
  - UI-R-222
  - STATE-027
  - UI-R-223
  - UI-R-224
  - UI-R-225
  - UI-R-226
  - UI-R-227
  - UI-R-228
  - UI-R-229
  - UI-R-230
  - UI-R-231
  - UI-R-232
  - UI-R-233
  - UI-R-234
  - UI-R-235
  - UI-R-236
  - UI-R-237
  - UI-R-238
  - UI-R-239
  - UI-R-240
  - UI-R-241
  - UI-R-242
  - UI-R-243
  - UI-R-244
  - UI-R-245
  - DATA-007
  - UI-R-246
  - UI-R-247
  - UI-R-248
  - UI-R-249
  - UI-R-250
  - UI-R-251
  - UI-R-252
  - UI-R-253
  - UI-R-254
  - UI-R-255
  - UI-R-256
  - UI-R-257
  - UI-R-258
  - UI-R-259
  - UI-R-260
  - DATA-008
  - UI-R-261
  - UI-R-262
  - UI-R-263
  - UI-R-264
  - UI-R-265
  - UI-R-266
  - UI-R-267
  - UI-R-268
  - UI-R-269
  - UI-R-270
  - UI-R-271
  - UI-R-272
  - UI-R-273
  - UI-R-274
  - UI-R-275
  - UI-R-276
  - UI-R-277
  - UI-R-278
  - UI-R-279
  - UI-R-280
  - UI-R-281
  - UI-R-282
  - UI-R-283
  - DATA-009
  - UX-R-001
  - UX-R-002
  - UX-R-003
  - UX-R-004
  - UX-R-005
  - UX-R-006
  - UX-R-007
  - UX-R-008
  - UX-R-009
  - UX-R-010
  - UX-R-011
  - UX-R-012
  - UX-R-013
  - UX-R-014
  - UX-R-015
  - UX-R-016
  - SAFE-008
  - UX-R-017
  - UX-R-018
  - UX-R-019
  - UX-R-020
  - UX-R-023
  - UX-R-024
  - UX-R-025
  - UX-R-026
  - UX-R-027
  - UX-R-028
  - UX-R-030
  - UX-R-031
  - UX-R-033
  - UX-R-034
  - UX-R-035
  - UX-R-036
  - UX-R-037
  - UX-R-039
  - UX-R-041
  - UX-R-042
  - UX-R-043
  - DATA-010
  - DATA-011
  - UX-R-045
  - UX-R-047
  - UX-R-048
  - UX-R-049
  - UX-R-050
  - UX-R-051
  - UX-R-052
  - UX-R-053
  - UX-R-054
  - UX-R-055
  - UX-R-056
  - UX-R-057
  - UX-R-058
  - UX-R-059
  - UX-R-060
  - UX-R-061
  - UX-R-062
  - UX-R-063
  - UX-R-065
  - UX-R-066
  - UX-R-069
  - UX-R-070
  - UX-R-072
  - UX-R-073
  - UX-R-074
  - UX-R-075
  - UX-R-076
  - UX-R-077
  - UX-R-078
  - UX-R-079
  - UX-R-080
  - UX-R-081
  - UX-R-082
  - UX-R-083
  - UX-R-084
  - UX-R-086
  - UX-R-087
  - UX-R-088
  - DATA-018
  - UX-R-091
  - UX-R-093
  - UX-R-095
  - UX-R-096
  - UX-R-097
  - UX-R-099
  - UX-R-100
  - UX-R-101
  - UX-R-103
  - UX-R-104
  - UX-R-105
  - UX-R-109
  - UX-R-112
  - UX-R-113
  - UX-R-116
  - UX-R-120
  - UX-R-123
  - UX-R-124
  - UX-R-128
  - DATA-020
  - UX-R-131
  - UX-R-134
  - UX-R-137
  - UX-R-138
  - UX-R-140
  - UX-R-141
  - UX-R-142
  - UX-R-146
  - UX-R-149
  - UX-R-150
  - UX-R-152
  - UX-R-153
  - UX-R-154
  - DATA-025
  - UX-R-155
  - UX-R-156
  - UX-R-157
  - UX-R-158
  - UX-R-159
  - UX-R-160
  - UX-R-161
  - UX-R-164
  - UX-R-165
  - UX-R-167
  - UX-R-168
  - UX-R-169
  - UX-R-173
  - UX-R-177
  - UX-R-179
  - UX-R-181
  - UX-R-185
  - UX-R-188
  - UX-R-189
  - SAFE-009
  - UX-R-192
  - UX-R-194
  - UX-R-195
  - UX-R-197
  - UX-R-198
  - UX-R-199
  - UX-R-200
  - UX-R-202
  - UX-R-203
  - UX-R-204
  - UX-R-206
  - UX-R-207
  - UX-R-208
  - UX-R-210
  - UX-R-211
  - UX-R-212
  - COMP-008
  - UX-R-213
  - UX-R-215
  - UX-R-216
  - UX-R-217
  - UX-R-218
  - UX-R-219
  - COMP-009
  - COMP-010
  - UX-R-220
  - UX-R-221
  - UX-R-222
  - UX-R-223
  - UX-R-224
  - UX-R-225
  - UX-R-226
  - UX-R-227
  - UX-R-228
  - UX-R-229
  - UX-R-230
  - UX-R-231
  - UX-R-232
  - UX-R-233
  - UX-R-234
  - UX-R-235
  - UX-R-236
  - UX-R-237
  - UX-R-238
  - UX-R-239
  - UX-R-240
  - UX-R-242
  - UX-R-243
  - UX-R-244
  - UX-R-245
  - UX-R-246
  - UX-R-247
  - UX-R-248
  - UX-R-249
  - UX-R-250
  - UX-R-251
  - UX-R-252
  - UX-R-253
  - UX-R-255
  - UX-R-256
  - UX-R-258
  - UX-R-259
  - UX-R-261
  - UX-R-262
  - COMP-011
  - UX-R-263
  - UX-R-264
  - UX-R-265
  - UX-R-266
  - UX-R-267
  - UX-R-268
  - COMP-012
  - UX-R-269
  - UX-R-270
  - UX-R-271
  - UX-R-272
  - UX-R-273
  - UX-R-274
  - UX-R-275
  - UX-R-276
  - UX-R-277
  - DATA-029
  - UX-R-278
  - UX-R-279
  - UX-R-280
  - UX-R-282
  - UX-R-283
  - UX-R-286
  - UX-R-288
  - UX-R-289
  - UX-R-290
  - UX-R-292
  - DATA-030
  - UX-R-296
  - UX-R-297
  - UX-R-302
  - UX-R-303
  - DATA-031
  - UX-R-307
  - UX-R-308
  - UX-R-312
  - DATA-032
  - UX-R-313
  - UX-R-317
  - UX-R-318
  - UX-R-319
  - UX-R-321
  - UX-R-322
  - UX-R-325
  - UX-R-327
  - UX-R-329
  - UX-R-330
  - UX-R-331
  - UX-R-332
  - COMP-015
  - UX-R-333
  - UX-R-334
  - COMP-017
  - COMP-018
  - COMP-019
  - UX-R-338
  - DATA-034
  - UX-R-339
  - DATA-035
  - UX-R-342
  - UX-R-343
  - UX-R-344
  - COMP-020
  - UX-R-345
  - UX-R-346
  - UX-R-347
  - UX-R-348
  - UX-R-349
  - UX-R-352
  - COMP-022
  - COMP-023
  - DATA-036
  - UX-R-353
  - UX-R-354
  - UX-R-355
  - UX-R-357
  - UX-R-358
  - COMP-025
  - STATE-028
  - UX-R-362
  - COMP-026
  - UX-R-367
  - UX-R-368
  - DATA-037
  - DATA-038
  - UX-R-371
  - UX-R-372
  - COMP-027
  - UX-R-373
  - UX-R-377
  - UX-R-380
  - DATA-041
  - UX-R-381
  - SAFE-012
  - UX-R-387
  - UX-R-388
  - UX-R-390
  - UX-R-393
  - UX-R-394
  - UX-R-395
  - UX-R-396
  - UX-R-397
  - UX-R-398
  - UX-R-400
  - UX-R-401
  - COMP-029
  - UX-R-402
  - UX-R-403
  - UX-R-405
  - UX-R-406
  - UX-R-407
  - UX-R-408
  - UX-R-409
  - UX-R-411
  - SAFE-014
  - UX-R-412
  - UX-R-413
  - COMP-030
  - SAFE-015
  - COMP-032
  - UX-R-415
  - UX-R-416
  - SAFE-016
  - DATA-043
  - SAFE-017
  - UI-R-284
  - UI-R-285
  - UI-R-286
  - STATE-029
  - UI-R-287
  - UI-R-288
  - STATE-030
  - STATE-031
  - UI-R-289
  - UI-R-290
  - UI-R-291
  - UI-R-292
  - UI-R-293
  - UI-R-294
  - UI-R-295
  - UI-R-296
  - UI-R-297
  - UI-R-298
  - UI-R-299
  - UI-R-300
  - UI-R-301
  - UI-R-302
  - UI-R-303
  - UI-R-304
  - UI-R-305
  - UI-R-306
  - UI-R-307
  - UI-R-308
  - UI-R-309
  - UI-R-310
  - UI-R-311
  - UI-R-312
  - UI-R-313
  - UI-R-314
  - UI-R-315
  - DATA-044
  - UI-R-316
  - UI-R-317
  - UI-R-318
  - UI-R-319
  - DATA-045
  - UI-R-320
  - UI-R-321
  - UI-R-322
  - UI-R-323
  - UI-R-324
  - UI-R-325
  - UI-R-326
  - SAFE-018
  - UI-R-327
  - UI-R-328
  - UI-R-329
  - UI-R-330
  - UI-R-331
  - UI-R-332
  - UI-R-333
  - UI-R-334
  - UI-R-335
  - UI-R-336
  - UI-R-337
  - UI-R-338
  - UI-R-339
  - UI-R-340
  - UI-R-341
  - UI-R-342
  - UI-R-343
  - UI-R-344
  - UI-R-345
  - UI-R-346
  - UI-R-347
  - UI-R-348
  - UI-R-349
  - UI-R-350
  - UI-R-351
  - UI-R-352
  - UI-R-353
  - UI-R-354
  - UI-R-355
  - UI-R-356
  - UI-R-357
  - UI-R-358
  - UI-R-359
  - UI-R-360
  - UI-R-361
  - UI-R-362
  - UI-R-363
  - UI-R-364
  - UI-R-365
  - UI-R-366
  - UI-R-367
  - UI-R-368
  - UI-R-369
  - UI-R-370
  - UI-R-371
  - UI-R-372
  - UI-R-373
  - UI-R-374
  - UI-R-375
  - UI-R-376
  - UI-R-377
  - SAFE-019
  - UI-R-378
  - UI-R-379
  - UI-R-380
  - UI-R-381
  - UI-R-382
  - UI-R-383
  - UI-R-384
  - UI-R-385
  - UI-R-386
  - UI-R-387
  - UI-R-388
  - UI-R-389
  - UI-R-390
  - SAFE-020
  - UI-R-391
  - COMP-033
  - UI-R-392
  - UI-R-393
  - UI-R-394
  - UI-R-395
  - UI-R-396
  - UI-R-397
  - UI-R-398
  - UI-R-399
  - UI-R-400
  - UI-R-401
  - UI-R-402
  - UI-R-403
  - UI-R-404
  - UI-R-405
  - DATA-046
  - UI-R-406
  - UI-R-407
  - UI-R-408
  - UI-R-409
  - UI-R-410
  - UI-R-411
  - UI-R-412
  - UI-R-413
  - UI-R-414
  - UI-R-415
  - SAFE-021
  - COMP-034
  - UI-R-416
  - UI-R-417
  - UI-R-418
  - UI-R-419
  - UI-R-420
  - UI-R-421
  - STATE-032
  - UI-R-422
  - UI-R-423
  - UI-R-424
  - UI-R-425
  - STATE-033
  - UI-R-426
  - DATA-047
  - UI-R-427
  - UI-R-428
  - UI-R-429
  - UI-R-430
  - UX-R-437
  - UX-R-438
  - UX-R-439
  - UX-R-441
  - UX-R-443
  - UX-R-444
  - UX-R-445
  - UX-R-446
  - UX-R-447
  - UX-R-449
  - STATE-034
  - UX-R-450
  - UX-R-451
  - UX-R-453
  - UX-R-454
  - UX-R-456
  - UX-R-457
  - UX-R-462
  - UX-R-463
  - UX-R-464
  - UX-R-465
  - UX-R-468
  - UX-R-469
  - UX-R-470
  - UX-R-471
  - STATE-035
  - UX-R-472
  - UX-R-473
  - STATE-036
  - DATA-049
  - UX-R-474
  - UX-R-476
  - DATA-050
  - UX-R-478
  - UX-R-479
  - UX-R-481
  - UX-R-482
  - UX-R-484
  - UX-R-486
  - UX-R-487
  - UX-R-488
  - UX-R-489
  - UX-R-490
  - UX-R-491
  - UX-R-492
  - DATA-052
  - UX-R-493
  - UX-R-494
  - UX-R-495
  - UX-R-496
  - UX-R-497
  - COMP-035
  - UX-R-498
  - DATA-053
  - UX-R-499
  - UX-R-500
  - STATE-037
  - STATE-038
  - EDGE-001
  - EDGE-002
  - UX-R-506
  - DATA-054
  - UX-R-507
  - UX-R-510
  - UX-R-511
  - SAFE-024
  - UX-R-513
  - COMP-036
  - UX-R-514
  - UX-R-515
  - UX-R-516
  - COMP-037
  - UX-R-517
  - UX-R-518
  - UX-R-519
  - UX-R-521
  - UX-R-523
  - UX-R-524
  - UX-R-525
  - UX-R-526
  - UX-R-527
  - DATA-055
  - UX-R-529
  - UX-R-530
  - UX-R-531
  - UX-R-532
  - EDGE-003
  - UX-R-533
  - UX-R-535
  - UX-R-537
  - UX-R-539
  - UX-R-540
  - UX-R-541
  - UX-R-542
  - UX-R-543
  - UX-R-544
  - UX-R-546
  - UX-R-547
  - UX-R-548
  - DATA-056
  - STATE-039
  - COMP-038

### Purpose

[UNSPECIFIED — REQUIRES PRODUCT DECISION]


### Layout Structure

- Layout must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).


### Components

- COMP-001: - High-trust, compliance-sensitive outbound email operations
- COMP-002: - Operator control, safety, auditability, and clarity
- UI-R-001: - Long-term consistency across human designers and multiple AI systems
- UI-R-002: 1) **Trust-forward** (serious, precise, non-salesy)
- STATE-001: 2) **Operator-grade** (control panels, clarity, predictable states)
- DATA-001: 3) **Calm** (low visual noise; stable hierarchy)
- COMP-003: 4) **Accountable** (auditability cues; explicit confirmations)
- UI-R-003: 5) **Efficient** (dense but readable; “work gets done”)
- SAFE-001: 6) **Safety-first** (guardrails are visible; risk is surfaced early)
- UI-R-004: - Playful/gamified
- UI-R-005: - Trend-chasing “Dribbble” aesthetics that reduce legibility
- UI-R-006: - Overly aggressive “growth-hacker” vibe
- UI-R-007: - High-chroma neon palettes, rainbow gradients, heavy blur/glow
- UI-R-008: - Decorative complexity that competes with operational signals
- STATE-002: - Ambiguous states (unclear whether action succeeded, is pending, or failed)
- UI-R-009: - “Calm control room”
- UI-R-010: - Neutral confidence; minimal persuasion
- STATE-003: - Errors are factual; warnings are actionable; success is understated
- UI-R-011: - **System-first**: tokens + components, not one-off art decisions.
- UI-R-012: - **Information clarity over decoration**: functional contrast and hierarchy.
- SAFE-002: - **Safety is visible**: risk indicators and confirmations are standard.
- UI-R-013: - **Consistency beats novelty**: reuse patterns; avoid custom styling per screen.
- UI-R-014: - Use semantic colors only for semantic meaning (success/warn/danger/info).
- UI-R-015: - Preserve a strict text hierarchy (primary/secondary/muted) and spacing scale.
- UI-R-016: - Use “quiet” surfaces + one primary accent for actions.
- STATE-004: - Show state changes explicitly (pending → success/fail).
- STATE-005: - Use red/amber/green for anything other than state.
- UI-R-017: - Use more than **one** accent color on a single interactive control.
- UI-R-018: - Use gradients on interactive components by default (exceptions only in marketing hero, governed below).
- UI-R-019: - Use light-mode variants unless explicitly added by governance (this system is dark-first).
- UI-R-020: - Dark-first, low glare, high legibility.
- UI-R-021: - Accent color signals *intentional action*, not decoration.
- STATE-006: - Semantic colors must be reserved for state and alerts only.
- UI-R-022: - `--color-bg-primary: #0b0e0d;`
- UI-R-023: - Purpose: app/page base background.
- UI-R-024: - Usage: full-bleed backgrounds; behind all surfaces.
- UI-R-025: - Accessibility: must keep sufficient contrast with surface boundaries.
- UI-R-026: - Forbidden: do not place body text directly on this without a surface unless contrast is verified.
- UI-R-027: - `--color-bg-surface: #111516;`
- UI-R-028: - Purpose: default content surface (cards, panels).
- DATA-002: - Usage: primary containers; tables; form panels.
- UI-R-029: - Accessibility: body text on this surface must meet WCAG AA contrast.
- UI-R-030: - Forbidden: do not use as global page background.
- UI-R-031: - `--color-bg-elevated: #121516;`
- UI-R-032: - Purpose: elevated surfaces (modals, popovers, sticky nav).
- UI-R-033: - Usage: overlays and “active focus” containers.
- UI-R-034: - Accessibility: must be visually distinguishable from `--color-bg-surface` by at least one of: border, shadow, or delta in luminance.
- STATE-007: - Forbidden: do not use as the only distinction for hover/active; still require state styling.
- UI-R-035: - `--color-border-subtle: rgba(255,255,255,0.08);`
- UI-R-036: - Purpose: hairline dividers, card borders.
- DATA-003: - Usage: 1px borders; table row separators; input borders.
- UI-R-037: - Accessibility: must not be the sole indicator of focus; pair with focus ring.
- UI-R-038: - Forbidden: do not increase opacity beyond 0.14 without governance (prevents “boxed-in” look).
- UI-R-039: - `--color-border-strong: rgba(255,255,255,0.14);`
- UI-R-040: - Purpose: emphasis borders (focused cards, active panels).
- STATE-008: - Usage: selected states; active nav indicator container borders.
- UI-R-041: - Forbidden: do not use for every container; reserve for selection/focus.
- UI-R-042: - `--color-text-primary: rgba(255,255,255,0.92);`
- UI-R-043: - Purpose: primary reading text.
- UI-R-044: - Usage: headings, body, primary labels.
- UI-R-045: - Forbidden: do not use at 100% white; avoid glare.
- UI-R-046: - `--color-text-secondary: rgba(255,255,255,0.74);`
- UI-R-047: - Purpose: secondary text.
- UI-R-048: - Usage: descriptions, helper text, timestamps.
- UI-R-049: - Forbidden: do not use for critical instructions or error messages.
- UI-R-050: - `--color-text-muted: #9e9f9f;`
- UI-R-051: - Purpose: muted/tertiary text, placeholder text.
- UI-R-052: - Usage: placeholders, subtle metadata, disabled labels.
- UI-R-053: - Accessibility: must not be used for required field labels or core instructions.
- UI-R-054: - `--color-text-inverse: #0c0d0a;`
- UI-R-055: - Purpose: text on light/bright semantic fills (e.g., success badge).
- UI-R-056: - Usage: used sparingly for contrast on bright fills.
- UI-R-057: - Forbidden: do not use on dark surfaces.
- UI-R-058: - `--color-accent-primary: #657232;`
- UI-R-059: - Purpose: primary action / trust signal.
- SAFE-003: - Usage: primary buttons, active nav indicator, key toggles, progress confirmations.
- UI-R-060: - Accessibility: text on accent fill must pass WCAG AA; default is `--color-text-inverse`.
- STATE-009: - Forbidden: do not use for success state *unless the UI element is also an action* (success uses semantic token).
- UI-R-061: - `--color-accent-hover: #7e865f;`
- UI-R-062: - Purpose: hover/active accent variant.
- STATE-010: - Usage: hover state for primary buttons, active item hover.
- STATE-011: - Forbidden: do not use as standalone accent (must be tied to interaction state).
- UI-R-063: - `--color-accent-soft: rgba(98, 193, 165, 0.16);`
- UI-R-064: - Purpose: low-intensity accent background.
- UI-R-065: - Usage: selected rows, subtle highlights, active pill backgrounds.
- UI-R-066: - Forbidden: do not use behind long text blocks; use for short labels/selection only.
- UI-R-067: - `--color-success: #62c19e;`
- STATE-012: - Purpose: successful completion state.
- UI-R-068: - Usage: success badges, “sent”, “connected”, “passed checks”.
- UI-R-069: - Forbidden: never use for primary CTAs.
- UI-R-070: - `--color-warning: #f59e0b;`
- STATE-013: - Purpose: warning/risk state.
- UI-R-071: - Forbidden: never use for decorative highlights.
- UI-R-072: - `--color-danger: #ef4444;`
- STATE-014: - Purpose: error/blocking state.
- UI-R-073: - Usage: failures, bounces/complaints, destructive actions.
- UI-R-074: - Forbidden: never use in neutral contexts; never use for emphasis text.
- UI-R-075: - `--color-info: #92b46a;`
- STATE-015: - Purpose: informational guidance state.
- UI-R-076: - Usage: tips, neutral notices, “learn more”, non-blocking system notes.
- UI-R-077: - Forbidden: do not use as secondary accent; reserve for info-only.
- UI-R-078: - `--color-focus-ring: rgba(89, 102, 58, 0.55);`
- UI-R-079: - Purpose: accessible focus ring.
- UI-R-080: - Usage: keyboard focus outlines for all interactive components.
- UI-R-081: - Forbidden: do not replace with subtle border-only focus.
- UI-R-082: - `--color-overlay-backdrop: rgba(0, 0, 0, 0.6);`
- UI-R-083: - Purpose: dim the app behind modals / dialogs.
- UI-R-084: - Usage: modal backdrops only.
- UI-R-085: - Forbidden: do not use as a surface fill.
- UI-R-086: - Charts must remain legible on dark surfaces.
- UI-R-087: - Use **max 5 categorical series** in a single chart without user-driven legend filtering.
- UI-R-088: - Never reuse semantic colors for non-semantic series unless meaning is explicit.
- UI-R-089: - `--color-data-1: #38BDF8;` (default series)
- UI-R-090: - `--color-data-2: #A78BFA;`
- UI-R-091: - `--color-data-3: #F59E0B;`
- UI-R-092: - `--color-data-4: #10B981;`
- UI-R-093: - `--color-data-5: #F472B6;`
- UI-R-094: - `--color-data-grid: rgba(255,255,255,0.08);`
- UI-R-095: - `--color-data-axis: rgba(255,255,255,0.72);`
- UI-R-096: Forbidden:
- UI-R-097: - Do not use red (`--color-danger`) as a normal series color (reserve for alerts/thresholds).
- UI-R-098: - No gradients in charts except heatmaps with explicit scale labeling.
- UI-R-099: - Minimum contrast targets:
- UI-R-100: - Body text vs surface: WCAG AA (4.5:1).
- UI-R-101: - Large text (≥ 18pt regular or 14pt bold): WCAG AA (3:1).
- UI-R-102: - Interactive focus ring must be visible on both `--color-bg-surface` and `--color-bg-elevated`.
- UI-R-103: - Color must never be the only indicator of:
- UI-R-104: - selection
- UI-R-105: - focus
- STATE-016: - error state
- UI-R-106: - campaign status
- UI-R-107: - **UI Sans (primary):** Inter (preferred) or system-ui fallback.
- DATA-004: - Purpose: UI labels, body, navigation, tables.
- UI-R-108: - **UI Mono (secondary):** ui-monospace / SF Mono / Menlo / Consolas.
- UI-R-109: - Purpose: IDs, tokens, email headers, logs, code-like artifacts.
- UI-R-110: - `--font-size-xs: 12px;` (line-height 16)
- UI-R-111: - `--font-size-sm: 14px;` (line-height 20)
- UI-R-112: - `--font-size-md: 16px;` (line-height 24) **default body**
- UI-R-113: - `--font-size-lg: 18px;` (line-height 28)
- UI-R-114: - `--font-size-xl: 20px;` (line-height 28)
- UI-R-115: - `--font-size-2xl: 24px;` (line-height 32)
- UI-R-116: - `--font-size-3xl: 30px;` (line-height 36)
- UI-R-117: - Headings: 600 (semibold)
- UI-R-118: - Body: 400
- UI-R-119: - Emphasis: 500
- UI-R-120: - UI labels: 500
- UI-R-121: - Numbers in KPIs: 600
- UI-R-122: - Mono labels: 500
- UI-R-123: Forbidden:
- UI-R-124: - Using 700+ weights broadly in dark UI (creates glare and noise).
- UI-R-125: - Using multiple weights within a single small control label.
- UI-R-126: - Minimum hit area for interactive elements: 40px height or equivalent padding.
- UI-R-127: - Long-form text (docs/help): increase line-height and keep measure 60–80 characters.
- UI-R-128: - Geometric mark (monoline or solid) + wordmark
- UI-R-129: - Abstract “system/flow” motif (pipeline, nodes, routing) **only if** it remains simple at 16px
- UI-R-130: - Optional container shape: rounded square or hex-like, but must remain minimal
- UI-R-131: - Prefer **simple primitives**: circle, rounded rect, straight lines, 45° angles.
- UI-R-132: - Stroke count low; avoid intricate negative space patterns.
- UI-R-133: - Must be legible at:
- UI-R-134: - 16px favicon
- UI-R-135: - 24px app icon
- UI-R-136: - 128px marketing
- UI-R-137: - Provide a 1-color version that works on `--color-bg-primary`.
- UI-R-138: - Primary logo color: `--color-accent-primary` on dark backgrounds.
- UI-R-139: - Alternate: `--color-text-primary` (monochrome).
- UI-R-140: - Forbidden: multi-color logos; gradients; neon glows.
- UI-R-141: - Mascots/characters
- UI-R-142: - Overly literal email envelope iconography
- UI-R-143: - “Growth hacker” motifs (rockets, flames)
- UI-R-144: - Overly thin strokes that vanish on dark mode
- UI-R-145: - `--radius-sm: 8px;`
- UI-R-146: - `--radius-md: 12px;` (default cards/inputs)
- UI-R-147: - `--radius-lg: 16px;` (modals, large containers)
- UI-R-148: - `--radius-pill: 999px;` (chips/badges only)
- UI-R-149: - Buttons: `md` by default; pill only for chips/tags.
- DATA-006: - Tables: radius applies to container only, not each row.
- UI-R-150: - Default border: 1px using `--color-border-subtle`.
- UI-R-151: - Emphasis border: 1px using `--color-border-strong`.
- UI-R-152: - Dividers: 1px, never thicker unless for chart axes.
- UI-R-153: - Elevation is subtle: differentiate primarily through surface token + border + minimal shadow.
- UI-R-154: - Shadows must be low-opacity and large-blur (no sharp drop shadows).
- UI-R-155: - `--shadow-elev-1`: subtle, for cards
- UI-R-156: - `--shadow-elev-2`: for modals/popovers only
- UI-R-157: Forbidden:
- UI-R-158: - Strong shadows on every element.
- UI-R-159: - Glow shadows on buttons.
- UI-R-160: - Base: bg-primary
- UI-R-161: - Content: bg-surface
- UI-R-162: - Focus/overlays: bg-elevated
- UI-R-163: - Modal backdrop: dark translucent overlay, no blur requirement (blur optional, must be subtle)
- STATE-017: - Interactions must have **4 states**: default, hover, active/pressed, disabled.
- STATE-018: - Focus state must be keyboard-visible using `--color-focus-ring`.
- STATE-019: - Disabled state reduces contrast and removes shadows; must remain readable.
- UI-R-164: - Primary = action (accent fill)
- UI-R-165: - Secondary = neutral action (surface + border)
- UI-R-166: - Tertiary = text button (no border; used sparingly)
- UI-R-167: - Primary default: fill `--color-accent-primary`, text `--color-text-inverse`
- UI-R-168: - Primary hover: fill `--color-accent-hover`
- UI-R-169: - Disabled: opacity reduction + no hover
- UI-R-170: - Minimum 40px height.
- [UNSPECIFIED — REQUIRES PRODUCT DECISION] (Component list truncated at 200 entries; remaining component-relevant snippets remain in SOURCE_REGISTRY under listed Requirement IDs.)


### States

- STATE-001: 2) **Operator-grade** (control panels, clarity, predictable states)
- STATE-002: - Ambiguous states (unclear whether action succeeded, is pending, or failed)
- STATE-003: - Errors are factual; warnings are actionable; success is understated
- STATE-004: - Show state changes explicitly (pending → success/fail).
- STATE-005: - Use red/amber/green for anything other than state.
- STATE-006: - Semantic colors must be reserved for state and alerts only.
- STATE-007: - Forbidden: do not use as the only distinction for hover/active; still require state styling.
- STATE-008: - Usage: selected states; active nav indicator container borders.
- STATE-009: - Forbidden: do not use for success state *unless the UI element is also an action* (success uses semantic token).
- STATE-010: - Usage: hover state for primary buttons, active item hover.
- STATE-011: - Forbidden: do not use as standalone accent (must be tied to interaction state).
- STATE-012: - Purpose: successful completion state.
- STATE-013: - Purpose: warning/risk state.
- STATE-014: - Purpose: error/blocking state.
- STATE-015: - Purpose: informational guidance state.
- STATE-016: - error state
- STATE-017: - Interactions must have **4 states**: default, hover, active/pressed, disabled.
- STATE-018: - Focus state must be keyboard-visible using `--color-focus-ring`.
- STATE-019: - Disabled state reduces contrast and removes shadows; must remain readable.
- STATE-020: - Inputs are calm, high-contrast, with clear focus and error states.
- STATE-021: - Scannability and density; clear row states.
- STATE-022: - Persistent, low-noise navigation with clear active state.
- STATE-023: - Motion must communicate state change, not personality.
- STATE-024: - Only one motion event should occur per user action (e.g., click → state change).
- STATE-025: - Use skeleton loading for tables; avoid spinners that block reading.
- STATE-026: - During error states requiring attention (no distracting animation).
- STATE-027: - selected state
- STATE-028: - Campaign sending is reliable: **≥ 99%** scheduled send jobs either sent or fail with actionable error + retry state.
- STATE-029: - All interactive elements must define: default, hover, pressed, focus-visible, disabled, loading.
- STATE-030: - Do not introduce glow tokens for brand or state (no neon/glow). Shadow is allowed only as subtle elevation (see §5).
- STATE-031: - Do not use `--color-accent-primary` as a “success” indicator. Use `--color-success` for success states; accent is for *actions*.
- STATE-032: - skeleton loading (subtle)
- STATE-033: - Default, Hover, Active, Focus-visible, Disabled, Loading, Selected, Semantic states (where applicable)
- STATE-034: - Billing state messaging must be explicit:
- STATE-035: - Error states are specific and actionable (invalid credentials, expired session, auth provider unavailable).
- STATE-036: - Connect Gmail/M365; show connected/error states; require required scopes.
- STATE-037: - States:
- STATE-038: - idle, running (progress), completed, failed (provider error), partial (rate limited)
- STATE-039: - Keyboard navigable, focus states, ARIA labels, non-color indicators for severity.


### User Actions

- UI-R-201: - Destructive actions: show `--color-danger` icon + explicit label “Delete”, never default-focus destructive button.
- UI-R-271: 4) Update Tailwind/CSS mapping and document in changelog.
- UX-R-051: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-076: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-082: - [x] Implement Google OAuth connect flow for inbox_connections
- DATA-018: - Note (2026-02-06): Added AES-256-GCM token encryption/decryption helper, stored encrypted access/refresh tokens during Google OAuth callback completion, and implemented on-demand token refresh helper that updates encrypted token fields in `inbox_connections`. Added unit test coverage for token encryption format/roundtrip and integration coverage for refresh update behavior. Files touched: `lib/inbox/token-encryption.ts`, `lib/inbox/complete-google-connection.ts`, `lib/inbox/google-token-refresh.ts`, `tests/unit/token-encryption.test.ts`, `tests/integration/google-connect-flow.test.ts`, `tests/integration/google-token-refresh.test.ts`, `tests/integration/test-env.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-093: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-100: - Acceptance: create/list/rename works
- UX-R-116: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-152: - [x] **Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)**
- UX-R-159: - [x] Implement source connector CRUD API (create/update/enable/disable)
- UX-R-160: - Acceptance: can create connector; disable blocks runs
- UX-R-188: - Acceptance: bulk approve moves to Leads; reject persists
- SAFE-009: - Acceptance: cannot approve invalid emails; verified-only default; explicit allowUnverified requires confirmation
- UX-R-194: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-195: - [x] Plan/confirm Phase 6 fallback import scope + mapping UX
- UX-R-198: - [x] Implement CSV import API with dedupe + suppression + provenance source csv_import
- UX-R-206: - [x] Implement UI import tools inside campaign leads page
- UX-R-207: - Acceptance: import works; dedupe outcomes visible
- UX-R-210: - [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-211: - Note (2026-02-08): Added explicit Phase 6 closeout documentation summarizing fallback import implementation, key decisions, and operational gotchas for CSV/manual ingestion and provenance behavior. Updated changelog continuity in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- UX-R-217: - [ ] Template editor UI + save API
- UX-R-224: - [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-234: - [ ] Pause/resume campaign endpoints
- UX-R-237: - [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-242: - Acceptance: no double-send
- UX-R-244: - [ ] Gmail send implementation + provider_message_id persistence
- UX-R-250: - [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-265: - [ ] AI draft reply + manual send reply
- UX-R-266: - Acceptance: user-approved send only
- UX-R-268: - [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-275: - Acceptance: affects import/sending
- UX-R-277: - [ ] Export campaign results CSV
- UX-R-279: - [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
- UX-R-283: - Create workspace (single-tenant per user by default) and campaigns.
- UX-R-333: - Optional: CRM import/sync connector (Phase 2 unless required).
- UX-R-339: - Ability to disable a source globally (affects enrichment/import pipelines).
- UX-R-344: - Throttling, send windows, ramp schedules, per-inbox daily caps.
- UX-R-348: - Connect Gmail and Microsoft 365 via OAuth; send via provider API.
- UX-R-349: - Queue-based sending; idempotent send jobs; pause/resume campaign.
- STATE-028: - Campaign sending is reliable: **≥ 99%** scheduled send jobs either sent or fail with actionable error + retry state.
- UX-R-371: - **Send Job**: queued unit of work to send a specific message to a lead.
- UX-R-377: 1. Create campaign → input website URL or paste product description.
- SAFE-012: - filter/sort, inspect samples, exclude risky segments
- UX-R-388: 10. Launch → campaign schedules jobs into send queue.
- UX-R-393: 1. Scheduler selects due send jobs (respecting caps, ramp, quiet hours).
- UX-R-394: 2. Send via Gmail/M365 API.
- UX-R-395: 3. Record outcome; update lead status; log event.
- UX-R-396: 4. On bounce/complaint → suppress lead and optionally pause campaign.
- UX-R-403: - **Default:** Choose ONE and implement fully end-to-end (search → enrich → rate limits → retries → pagination).
- UX-R-408: - Options: mandatory approval vs allow auto-approve.
- UX-R-409: - **Default:** Mandatory approval in MVP; consider “auto-approve with rules” later.
- UX-R-411: - Options: provider-only vs add compliant web search API.
- COMP-030: - **Compliance:** enforce unsubscribe + suppression; user attests lawful basis; store minimal PII; delete/export support.
- SAFE-016: - Safety > speed: any send/launch action must surface risk checks and require explicit confirmation.
- SAFE-021: - AI outputs labeled as draft; require explicit confirmation before launch/send.
- UX-R-451: 1) **Connect inbox**
- UX-R-453: 2. OAuth completes → app verifies send permission and stores encrypted tokens.
- UX-R-456: 1. Start campaign → name + select connected inbox.
- UX-R-465: 2. Pause/resume; edits only affect unsent jobs.
- UX-R-469: 3. AI suggested reply is optional and always requires explicit “Send.”
- STATE-036: - Connect Gmail/M365; show connected/error states; require required scopes.
- UX-R-476: - Display AI draft sections; user can edit and save.
- SAFE-024: - bulk approve requires confirmation if including risky statuses
- UX-R-515: - send plan and caps
- UX-R-521: - Controls: pause/resume; edit future steps only.
- UX-R-537: - Bulk actions: suppress, remove from campaign, export.
- UX-R-539: - Needs-response queue; thread view; optional AI draft reply; user must click Send.
- COMP-038: - Factual, action-oriented, no auto-send; mandatory compliance confirmation at launch.


### Edge Cases

- EDGE-001: - Edge cases:
- EDGE-002: - provider quota exceeded → explain and stop run
- EDGE-003: - Edge cases:


### Compliance / Safety

- SAFE-001: 6) **Safety-first** (guardrails are visible; risk is surfaced early)
- SAFE-002: - **Safety is visible**: risk indicators and confirmations are standard.
- SAFE-003: - Usage: primary buttons, active nav indicator, key toggles, progress confirmations.
- SAFE-005: - Red primary buttons except destructive confirmations.
- SAFE-006: - Confirmations are explicit; risk actions require acknowledgement.
- SAFE-008: - Note (2026-02-06): Changed default branch from `feature/phase1-scope-confirmation` to `main` via `gh` CLI. Branch protection applied: 1 required review, dismiss stale reviews, enforce admins, no force-push/deletion. Linear history and conversation resolution not enabled (API limitation on personal repos).
- SAFE-009: - Acceptance: cannot approve invalid emails; verified-only default; explicit allowUnverified requires confirmation
- SAFE-012: - filter/sort, inspect samples, exclude risky segments
- SAFE-014: - **Default:** Provider-only for MVP to avoid ToS risk and reduce scope.
- SAFE-015: - **Outbound email safety:** conservative caps, throttling, ramp schedules; no “growth-hack” exploits.
- SAFE-016: - Safety > speed: any send/launch action must surface risk checks and require explicit confirmation.
- SAFE-017: - Tables are first-class: dense, scannable, keyboard-friendly; bulk actions must have confirmation.
- SAFE-018: - Destructive actions require explicit confirmation (modal or two-step inline confirm).
- SAFE-019: - Risk indicators: icon + label; tooltips allowed; never color-only
- SAFE-020: - Bounce risk (Low/Medium/High)
- SAFE-021: - AI outputs labeled as draft; require explicit confirmation before launch/send.
- SAFE-024: - bulk approve requires confirmation if including risky statuses
- COMP-001: - High-trust, compliance-sensitive outbound email operations
- COMP-002: - Operator control, safety, auditability, and clarity
- COMP-003: 4) **Accountable** (auditability cues; explicit confirmations)
- COMP-008: - Acceptance: unsubscribe placeholder required
- COMP-009: - [ ] Lint rules (spam/link/unsubscribe)
- COMP-010: - Acceptance: blocking rule for missing unsubscribe
- COMP-011: - [ ] Categorize endpoint + unsubscribe suppression
- COMP-012: - [ ] Plan/confirm compliance UX
- COMP-015: - One licensed B2B data provider connector as the default lead engine (see Open Decisions).
- COMP-017: - Approval gate is mandatory to prevent unintended outreach and to support compliance posture.
- COMP-018: - Auto-suppress: unsubscribes, hard bounces, complaints.
- COMP-019: - Enforced: global do-not-contact list and per-workspace anti-abuse sending caps.
- COMP-020: - Bounce/complaint suppression list; global do-not-contact list.
- COMP-022: 9) **Compliance + anti-abuse**
- COMP-023: - Unsubscribe handling (link + one-click suppression).
- COMP-025: - System enforces: unsubscribe link + suppression + throttling/ramp on every campaign.
- COMP-026: - **Source Connector**: a configured integration that can discover/enrich leads (licensed provider, CRM, etc.).
- COMP-027: - **Suppression**: do-not-contact entry (unsubscribed, bounced, complained, manual).
- COMP-029: 1) **Default licensed lead data provider (MVP)**
- COMP-030: - **Compliance:** enforce unsubscribe + suppression; user attests lawful basis; store minimal PII; delete/export support.
- COMP-032: - MVP includes exactly **one** licensed provider connector implemented end-to-end.
- COMP-033: - Compliance (suppression active, unsubscribe present)
- COMP-034: - Compliance prompts at launch are mandatory.
- COMP-035: - source connector (licensed provider)
- COMP-036: - System enforces unsubscribe placeholder and compliance footer.
- COMP-037: - compliance + attestation
- COMP-038: - Factual, action-oriented, no auto-send; mandatory compliance confirmation at launch.


### Accessibility Requirements

- UI-R-012: - **Information clarity over decoration**: functional contrast and hierarchy.
- UI-R-019: - Use light-mode variants unless explicitly added by governance (this system is dark-first).
- UI-R-025: - Accessibility: must keep sufficient contrast with surface boundaries.
- UI-R-026: - Forbidden: do not place body text directly on this without a surface unless contrast is verified.
- UI-R-029: - Accessibility: body text on this surface must meet WCAG AA contrast.
- UI-R-033: - Usage: overlays and “active focus” containers.
- UI-R-034: - Accessibility: must be visually distinguishable from `--color-bg-surface` by at least one of: border, shadow, or delta in luminance.
- UI-R-037: - Accessibility: must not be the sole indicator of focus; pair with focus ring.
- UI-R-041: - Forbidden: do not use for every container; reserve for selection/focus.
- UI-R-053: - Accessibility: must not be used for required field labels or core instructions.
- UI-R-056: - Usage: used sparingly for contrast on bright fills.
- UI-R-060: - Accessibility: text on accent fill must pass WCAG AA; default is `--color-text-inverse`.
- UI-R-062: - Purpose: hover/active accent variant.
- UI-R-078: - `--color-focus-ring: rgba(89, 102, 58, 0.55);`
- UI-R-079: - Purpose: accessible focus ring.
- UI-R-080: - Usage: keyboard focus outlines for all interactive components.
- UI-R-081: - Forbidden: do not replace with subtle border-only focus.
- UI-R-099: - Minimum contrast targets:
- UI-R-100: - Body text vs surface: WCAG AA (4.5:1).
- UI-R-101: - Large text (≥ 18pt regular or 14pt bold): WCAG AA (3:1).
- UI-R-102: - Interactive focus ring must be visible on both `--color-bg-surface` and `--color-bg-elevated`.
- UI-R-103: - Color must never be the only indicator of:
- UI-R-104: - selection
- UI-R-105: - focus
- STATE-016: - error state
- UI-R-106: - campaign status
- UI-R-162: - Focus/overlays: bg-elevated
- STATE-018: - Focus state must be keyboard-visible using `--color-focus-ring`.
- UI-R-171: - Focus ring always visible.
- STATE-020: - Inputs are calm, high-contrast, with clear focus and error states.
- UI-R-175: - Focus: border `--color-border-strong` + focus ring
- UI-R-178: - Placeholder-only labels (labels must exist for accessibility).
- UI-R-191: - Overly thin fonts; insufficient line height; hidden controls without focus access.
- UI-R-201: - Destructive actions: show `--color-danger` icon + explicit label “Delete”, never default-focus destructive button.
- UI-R-213: - `--motion-fast: 120ms;` (hover, focus transitions)
- UI-R-218: - For accessibility: respect reduced motion preferences; provide zero-motion path.
- UI-R-251: - Code blocks in mono, high contrast.
- UI-R-253: - Limit decorative elements; focus on clarity and trust.
- UI-R-270: - accessibility notes
- UI-R-278: - Use CSS variables as the source of truth (`:root` or `[data-theme="dark"]`).
- UI-R-279: - Tailwind should reference variables (e.g., `bg-[color:var(--color-bg-surface)]`) or via theme config mapping.
- UI-R-280: - Semantic tokens must be mapped to component variants, not used ad-hoc.
- DATA-009: - Is implementable directly in code through CSS variables and Tailwind mappings.
- DATA-038: - **Message Template**: editable subject/body with variables.
- SAFE-017: - Tables are first-class: dense, scannable, keyboard-friendly; bulk actions must have confirmation.
- UI-R-285: - Use tokens only (CSS variables / Tailwind tokens). No ad-hoc spacing, radii, or colors.
- STATE-029: - All interactive elements must define: default, hover, pressed, focus-visible, disabled, loading.
- UI-R-290: - Text < 18px: contrast ≥ 4.5:1
- UI-R-291: - Text ≥ 18px or ≥ 14px semibold: contrast ≥ 3:1
- UI-R-292: - Non-text UI required for understanding: contrast ≥ 3:1
- UI-R-293: - Focus indicator must be visible with **2px minimum** thickness; must not rely on border-only changes.
- UI-R-294: - Sans (primary UI): Inter (variable), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
- UI-R-335: - Focus-visible: focus ring (see §21)
- UI-R-355: - Focus: border `--ui-border-strong` + focus ring `--ui-focus-ring`
- UI-R-357: - Disabled: text `--ui-fg-muted`, reduced contrast background, no pointer events
- UI-R-378: - Arrow keys move row focus
- UI-R-398: - never default-focus destructive CTA
- UI-R-406: - hover/focus: 120ms
- UI-R-422: - Tailwind CSS mapped to CSS variables (source of truth)
- STATE-033: - Default, Hover, Active, Focus-visible, Disabled, Loading, Selected, Semantic states (where applicable)
- UI-R-426: - Focus visible everywhere (2px ring minimum).
- DATA-047: - Touch targets: ≥ 44x44 on mobile/tablet; ≥ 32px in dense tables on desktop only.
- UI-R-427: - Errors include text + icon + association; never color-only.
- UI-R-428: - Status includes label text; never color-only.
- STATE-039: - Keyboard navigable, focus states, ARIA labels, non-color indicators for severity.


---

## UNUSED_REQUIREMENTS

(none)
