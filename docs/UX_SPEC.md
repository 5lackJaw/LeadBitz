# UX Spec (Behavioral)

Product: LeadBitz

Website: https://www.leadbitz.com

## Information architecture (routes/sections)
- `/` Marketing/entry page
- `/login` Sign in/up entry
- `/app` App shell (auth required)
- `/app/onboarding` Connect inbox + workspace defaults
- `/app/campaigns` Campaign list
- `/app/campaigns/new` Campaign wizard
- `/app/campaigns/:id` Campaign overview
- `/app/campaigns/:id/leads` Lead table
- `/app/campaigns/:id/sequence` Sequence builder + templates
- `/app/replies` Unified replies inbox
- `/app/leads/:leadId` Lead detail
- `/app/settings/*` Workspace settings (inboxes, deliverability, suppressions, sources)

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

## Core user journeys
1) Sign in/up -> start trial checkout -> enter app onboarding.
2) Connect inbox -> set caps/windows.
3) Create campaign wizard -> ICP -> leads -> sequence -> review -> launch.
4) Operate campaign -> monitor, pause/resume, handle warnings.
5) Handle replies -> categorize, respond, stop sequence on reply.

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

### Campaign wizard
- Step 1 Inputs: require URL xor description.
- Step 2 ICP: editable; save reusable ICP.
- Step 3 Leads: CSV/paste/manual; validate, dedupe, suppression reject with explanation.
- Step 4 Sequence: email steps only; stop rules enforced; template editor with variable insert + lint.
- Step 5 Review: blockers vs warnings; launch attestation required.

### Campaign overview
- Metrics: queued/sent/failed/replies/bounces/unsubs.
- Controls: pause/resume; edit future steps only.

### Leads table + detail
- Filters; bulk suppress; timeline + provenance.

### Replies inbox
- Needs-response queue; thread view; optional AI draft reply; user must click Send.

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
