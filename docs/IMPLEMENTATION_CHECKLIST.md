# Implementation Checklist

**Rules**
- Dev AI must implement exactly one unchecked task per PR.

---

## Phase 1 — Skeleton + DB
- [x] Plan/confirm Phase 1 scope
  - Acceptance: tasks match docs
  - Tests: n/a
  - Note (2026-02-05): Confirmed Phase 1 scope alignment with `docs/PRODUCT_BRIEF.md`, `docs/UX_SPEC.md`, and `docs/ARCHITECTURE.md`; documented boundaries and acceptance mapping in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Initialize Next.js appbles ( shell + TypeScript + lint/format
  - Acceptance: `/app` loads locally
  - Tests: n/a
  - Note (2026-02-05): Bootstrapped Next.js App Router project with TypeScript + ESLint and added an explicit `/app` route page. Verified with lint/build and route generation. Files touched: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`, `app/*`, `public/*`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Add Prisma + Postgres connection + migration setup
  - Acceptance: migrations run
  - Tests: integration
  - Note (2026-02-05): Added Prisma 6 + PostgreSQL datasource setup, migration scripts, `.env.example`, and `lib/prisma.ts` singleton client helper. Verified `prisma generate` and migration commands against Prisma local Postgres (`prisma dev`). Files touched: `.gitignore`, `.env.example`, `package.json`, `package-lock.json`, `prisma/schema.prisma`, `lib/prisma.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [ ] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
  - Acceptance: schema matches ARCHITECTURE.md
  - Tests: integration
- [ ] Create migrations for leads/campaign_leads/suppressions
  - Acceptance: dedupe constraints present
  - Tests: integration
- [ ] Create migrations for sequences/templates/send_jobs/conversations/messages/audit/provenance
  - Acceptance: idempotency unique key on send_jobs
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 2 — Auth + workspace scoping
- [ ] Plan/confirm Phase 2 scope
  - Acceptance: route protections defined
  - Tests: n/a
- [ ] Add NextAuth for app login
  - Acceptance: sign-in/out works
  - Tests: e2e smoke
- [ ] Auto-provision workspace on first login
  - Acceptance: workspace created once
  - Tests: integration
- [ ] Add workspace-scoped authorization helper
  - Acceptance: cross-workspace access blocked
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 3 — Gmail connect
- [ ] Plan/confirm token encryption approach
  - Acceptance: documented decision
  - Tests: n/a
- [ ] Implement Google OAuth connect flow for inbox_connections
  - Acceptance: inbox shows connected
  - Tests: e2e with mocks
- [ ] Store encrypted tokens + refresh on demand
  - Acceptance: refresh updates DB
  - Tests: unit+integration
- [ ] Inbox settings (caps/windows/ramp) UI + API
  - Acceptance: persisted settings
  - Tests: e2e
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 4 — Campaign wizard (draft + ICP)
- [ ] Plan/confirm wizard routes/steps
  - Acceptance: matches UX_SPEC.md
  - Tests: n/a
- [ ] Campaign CRUD + list page
  - Acceptance: create/list/rename works
  - Tests: integration+e2e
- [ ] Wizard Step 1 inputs + validation
  - Acceptance: URL xor text enforced
  - Tests: e2e
- [ ] ICP generate endpoint (AI mocked in tests)
  - Acceptance: saves icp_profile row
  - Tests: integration
- [ ] ICP editor UI
  - Acceptance: edits persist
  - Tests: e2e
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 5 — Leads import + suppression + provenance
- [ ] Plan/confirm dedupe + suppression rules
  - Acceptance: documented
  - Tests: n/a
- [ ] CSV import API + mapping
  - Acceptance: row-level errors returned
  - Tests: integration
- [ ] Paste/manual add lead API
  - Acceptance: validates + dedupes
  - Tests: unit+integration
- [ ] Suppression checks on import/add
  - Acceptance: rejects suppressed with reason
  - Tests: integration
- [ ] Source registry + provenance writes for imports
  - Acceptance: provenance visible on lead detail
  - Tests: integration
- [ ] Leads table UI + bulk suppress
  - Acceptance: status updates correctly
  - Tests: e2e
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 6 — Sequence + templates + lint + AI draft
- [ ] Plan/confirm stop rules + placeholder enforcement
  - Acceptance: unsubscribe placeholder required
  - Tests: n/a
- [ ] Sequence CRUD APIs
  - Acceptance: steps persist
  - Tests: integration
- [ ] Template editor UI + save API
  - Acceptance: reload works
  - Tests: e2e
- [ ] Lint rules (spam/link/unsubscribe)
  - Acceptance: blocking rule for missing unsubscribe
  - Tests: unit
- [ ] AI draft endpoint (draft-only)
  - Acceptance: never auto-saves
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 7 — Launch + job scheduling
- [ ] Plan/confirm launch validators
  - Acceptance: blockers/warnings defined
  - Tests: n/a
- [ ] Launch endpoint validation
  - Acceptance: blocks missing requirements
  - Tests: integration
- [ ] Generate send_jobs with idempotency keys
  - Acceptance: queued jobs created
  - Tests: integration
- [ ] Pause/resume campaign endpoints
  - Acceptance: affects processing
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 8 — Cron sender + Gmail send
- [ ] Plan/confirm scheduling algorithm (caps/ramp/windows)
  - Acceptance: deterministic logic
  - Tests: unit plan
- [ ] `/api/cron/tick` due-job selection + locking
  - Acceptance: no double-send
  - Tests: integration
- [ ] Gmail send implementation + provider_message_id persistence
  - Acceptance: success+error paths handled
  - Tests: integration (mock)
- [ ] Enforce caps/ramp/windows in runner
  - Acceptance: never exceeds caps
  - Tests: unit+integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 9 — Inbox polling + replies inbox
- [ ] Plan/confirm polling + thread matching
  - Acceptance: rules documented
  - Tests: n/a
- [ ] `/api/cron/sync-inbox` polling for replies
  - Acceptance: inbound saved
  - Tests: integration (mock)
- [ ] Stop sequence on reply + cancel future jobs
  - Acceptance: no further sends after reply
  - Tests: integration
- [ ] Replies inbox UI + thread view
  - Acceptance: needs-response flow works
  - Tests: e2e
- [ ] Categorize endpoint + unsubscribe suppression
  - Acceptance: suppression created
  - Tests: integration
- [ ] AI draft reply + manual send reply
  - Acceptance: user-approved send only
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)

## Phase 10 — Compliance hardening
- [ ] Plan/confirm compliance UX
  - Acceptance: launch attestation required
  - Tests: n/a
- [ ] Launch attestation checkbox + persistence
  - Acceptance: cannot launch without it
  - Tests: e2e
- [ ] Global suppression management UI
  - Acceptance: affects import/sending
  - Tests: integration+e2e
- [ ] Export campaign results CSV
  - Acceptance: correct fields included
  - Tests: integration
- [ ] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
