# UX Spec (Behavioral)

Product: LeadBitz

Website: https://www.leadbitz.com

## Information architecture (routes/sections)
- `/app` Dashboard (canonical; auth required inside app shell)
- `/app/dashboard` Dashboard alias route (redirect-only to `/app`)
- `/app/onboarding` Connect inbox + workspace defaults
- `/app/campaigns` Campaign list
- `/app/campaigns/new` Campaign wizard
- `/app/campaigns/:id` Campaign overview (status, metrics, controls)
- `/app/campaigns/:id/discovery` Lead discovery configuration + runs
- `/app/campaigns/:id/candidates` Candidates review (filter/sort/approve)
- `/app/campaigns/:id/leads` Approved leads table (filter, suppression)
- `/app/campaigns/:id/sequence` Sequence builder + templates
- `/app/campaigns/:id/icp` ICP versions + quality score + actions
- `/app/campaigns/:id/icp/improve` Specialist ICP Interview wizard
- `/app/settings/icp-templates` (optional admin-only in MVP; can be hidden behind feature flag)
- `/app/replies` Unified replies inbox
- `/app/leads` Leads list (canonical)
- `/app/leads/:leadId` Lead detail (profile, provenance, timeline)
- `/app/settings` Workspace settings
  - `/app/settings/inboxes`
  - `/app/settings/deliverability`
  - `/app/settings/suppressions`
  - `/app/settings/sources` Source connectors + governance
  - `/app/settings/verification` Email verification provider settings (MVP minimal)

### Dashboard (Canonical)
- Canonical route: `/app`
- Alias route (redirect-only): `/app/dashboard` MUST 308 redirect to `/app`
- Global nav item "Dashboard" MUST link to `/app`
- Any internal links, breadcrumbs, and deep-link generation MUST use `/app` as the canonical Dashboard URL

### Leads
- Leads list (canonical): `/app/leads`
- Lead detail (preserved): `/app/leads/:leadId`
- Global nav item "Leads" MUST link to `/app/leads`
- Active-nav: "Leads" is active on `/app/leads` and `/app/leads/:leadId`

## App Shell
### Global Search - Behavior
- Placement: Top utility bar (SHELL-008). Must remain global and non-page-specific (SHELL-009).
- Mode: typeahead with inline results panel anchored to the search input.
- Scope (IA-defined domains only):
  - Campaigns (route targets under `/app/campaigns/*`)
  - Leads (route targets under `/app/leads` and `/app/leads/:leadId`)
  - Replies (route target: `/app/replies`)
  - Settings (route targets under `/app/settings/*`)
- Interaction:
  - Results update as the user types (debounced).
  - ArrowUp/ArrowDown moves selection.
  - Enter navigates to the selected result's canonical route.
  - Esc closes the results panel; focus remains on the input.
  - Clicking outside closes the results panel.
- Result rendering:
  - Results MUST be grouped by domain (Campaigns, Leads, Replies, Settings).
  - Each result MUST show a primary label and secondary context when available.

### Support / Help
- Entry: Sidebar lower section (SHELL-005)
- Behavior: Opens external support/docs destination in a new tab/window
- No in-app route is required for Support/Help

## Permissions model
- MVP roles: `Owner` only.

## Auth + signup UX decisions
- Primary sign-in option: Google OAuth.
- Secondary sign-in option: email/password.
- Login/signup should be one shared entry flow at `/login` with minimal fields and clear provider choices.
- Do not require extra profile steps before authentication completes.
- After first successful auth, user is routed into onboarding and workspace provisioning flow.

## Billing + trial UX decisions
- Trial starts through subscription checkout with payment method captured up front.
- Flow target:
  1. Authenticate (Google or email/password)
  2. Confirm plan/trial terms
  3. Complete checkout
  4. Land in `/app/onboarding`
- Do not implement a synthetic `$0` one-off purchase flow.
- Billing state messaging must be explicit:
  - trialing, active, payment required, canceled.

## Core user journeys (numbered)

1) **Connect inbox**
1. User signs in → onboarding prompts to connect Gmail/M365.
2. OAuth completes → app verifies send permission and stores encrypted tokens.
3. User sets sending limits (defaults applied).

2) **Create campaign (wizard) with automated lead discovery**
1. Start campaign → name + select connected inbox.
2. Provide website URL or paste description.
3. AI returns ICP draft; user edits and confirms.
4. Configure lead discovery (source connector, filters, required fields, limit).
5. Run discovery → system builds Candidates.
6. Review Candidates → approve to Leads.
7. Build sequence → AI drafts templates → user edits.
8. Deliverability checklist runs → resolve blockers.
9. Review + launch.

3) **Operate campaign**
1. Monitor campaign status, queue, warnings.
2. Pause/resume; edits only affect unsent jobs.
3. Deliverability events trigger prompts (e.g., high bounce rate → recommend pause).

4) **Handle replies**
1. Replies appear in `/app/replies`.
2. User categorizes and responds; follow-ups stop per rules.
3. AI suggested reply is optional and always requires explicit “Send.”

## Per-screen requirements (high level)
### Login
- Show Google OAuth as primary CTA.
- Show email/password as secondary option.
- Error states are specific and actionable (invalid credentials, expired session, auth provider unavailable).

### Trial start/paywall gate
- Explain trial duration, renewal date behavior, and cancellation terms before checkout.
- Block access to protected app routes if trial/subscription is missing or invalid.

### Onboarding
- Connect Gmail/M365; show connected/error states; require required scopes.

### Campaign wizard (updated steps)
**Step 1: Inputs**
- Fields: campaign name, connected inbox, website URL or product description textarea.
- Validation: require exactly one of URL or description.
- AI failure: retry + “continue manually” (user can enter ICP without AI).

**Step 2: ICP (quality-gated)**
- Display AI draft sections; user can edit and save.
- After generation (or on demand), show **ICP Quality Panel**:
  - score (0–100), tier badge, missing fields checklist, “top questions” list
  - “Continue” is always available, but behavior differs by tier:
    - ≥ 75: Continue normally
    - 50–74: show warning + “Improve ICP” CTA
    - < 50: block progression by default and show Scenario A/B modal (override allowed)
- Actions:
  - “Improve ICP” → routes to Specialist Interview wizard (structured)
  - “Apply Template” → if archetype identified and template exists
  - “Continue anyway” → saves the current ICP version and proceeds

**Scenario A modal (archetype identified)**
- Copy requirements:
  - Must show why the ICP is insufficient (missing fields list)
  - Must show identified archetype + confidence (human-readable)
- Buttons:
  - “Apply {archetype} template”
  - “Improve with Specialist AI”
  - “Continue anyway”

**Scenario B modal (archetype not identified)**
- Must ask a minimal disambiguation set (5–8 questions max) before offering template:
  - e.g., business model, pricing, target user, sales motion, implementation type, typical buyer title
- Buttons:
  - “Answer questions”
  - “Improve with Specialist AI”
  - “Continue anyway”

**Step 3: Lead Discovery (NEW)**
- User selects:
  - source connector (licensed provider)
  - geo/industry/company size/title filters supported by provider
  - required fields (email required for sending)
  - max results + run label
- Actions:
  - “Run discovery” (creates Source Run)
- States:
  - idle, running (progress), completed, failed (provider error), partial (rate limited)
- Edge cases:
  - provider quota exceeded → explain and stop run
  - connector disabled in settings → block and link to settings
  - missing verification provider configured → allow run but warn that sending will be restricted

**Step 4: Candidates Review (NEW)**
- Candidates list supports:
  - filters: verification status, role, seniority, company size, geo, confidence
  - sorting: confidence, recency, company size
  - sampling: open candidate detail drawer (show provenance for key fields)
- Approval flow:
  - select candidates → “Approve to Leads”
  - approval enforces suppression + dedupe + verification rules
- Required behavior:
  - default view hides unverified/unknown unless toggled
  - bulk approve requires confirmation if including risky statuses

**Step 5: Sequence**
- Sequence builder linear; stop conditions enforced.
- Template editor includes lint panel.
- System enforces unsubscribe placeholder and compliance footer.

**Step 6: Review & Launch**
- Shows:
  - send plan and caps
  - sample renders across approved leads
  - deliverability checklist blockers/warnings
  - compliance + attestation
- Launch requires:
  - no blockers
  - attestation checkbox checked

### Campaign overview
- Metrics: queued/sent/failed/replies/bounces/unsubs.
- Controls: pause/resume; edit future steps only.

### ICP center (campaign-scoped)
Route: `/app/campaigns/:id/icp`
- Shows ICP versions list:
  - Website draft
  - Template-applied (if any)
  - Specialist-improved (if any)
- Each version shows:
  - quality score + tier
  - missing fields checklist
  - “Use this ICP for discovery/messaging” selector (default = latest)
- Actions:
  - “Re-score” (if edited)
  - “Apply template” (if archetype identified)
  - “Improve with Specialist AI”
- Edge cases:
  - If AI scoring fails: show last known score + allow proceed
  - If user edits ICP: mark score stale until re-score runs

### E) Approved Leads table (updated)
- Shows only **approved** leads.
- Filters by: status, replied, suppressed, verification status, source run.
- Bulk actions: suppress, remove from campaign, export.
- Lead detail shows: timeline + provenance + verification record.

### Replies inbox
- Needs-response queue; thread view; optional AI draft reply; user must click Send.

### Settings — sources (updated)
- Manage source connectors:
  - enabled/disabled
  - API key/config status
  - allowed usage note
  - last run status/errors
- Disabling a connector blocks new discovery runs and enrichment.

## Validation + error handling
- Inline validation + form-level summary.
- AI failures never block manual progress.
- Sending errors classified and actionable.

## Responsive
- Mobile-first; tables become cards under ~768px; wizard stepper collapses.

## Accessibility
- Keyboard navigable, focus states, ARIA labels, non-color indicators for severity.

## UX tone (behavioral)
- Factual, action-oriented, no auto-send; mandatory compliance confirmation at launch.
