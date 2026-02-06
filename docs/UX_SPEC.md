# UX Spec (Behavioral)

Product: LeadBitz

Website: https://www.leadbitz.com

## Information architecture (routes/sections)
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

## Core user journeys
1) Connect inbox → set caps/windows.
2) Create campaign wizard → ICP → leads → sequence → review → launch.
3) Operate campaign → monitor, pause/resume, handle warnings.
4) Handle replies → categorize, respond, stop sequence on reply.

## Per-screen requirements (high level)
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
