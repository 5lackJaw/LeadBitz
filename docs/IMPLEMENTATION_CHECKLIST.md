# Implementation Checklist

**Rules**
- Dev AI must implement exactly one unchecked task per PR.

---

## Phase 0 — Deployment infrastructure + repo governance
- [x] Set up Vercel project + Neon Postgres database (Dev/Preview)
  - Acceptance: Vercel project linked; Neon DB provisioned; `DATABASE_URL` available in Dev/Preview env vars
  - Tests: n/a
  - Note (2026-02-06): Vercel project created; Neon Postgres provisioned via Vercel Storage/Marketplace (free tier); connected to Development + Preview environments only. Production DB deferred until go-live.
- [x] Link local workspace via Vercel CLI + pull env vars
  - Acceptance: `vercel link` succeeds; `.env.local` created with secrets; `.env*.local` in `.gitignore`
  - Tests: n/a
  - Note (2026-02-06): Ran `vercel link` and `vercel env pull`; `.env.local` created locally; `.env*.local` added to `.gitignore`; `.vercel/` already ignored.
- [x] Add `postinstall: prisma generate` for deploy reliability
  - Acceptance: `npm install` triggers Prisma client generation
  - Tests: n/a
  - Note (2026-02-06): Added to `package.json` scripts on `feature/vercel-deploy-fixes` branch.
- [x] Set GitHub default branch to `main` + enable branch protection
  - Acceptance: GitHub default branch = `main`; PRs required; force-push disabled
  - Tests: n/a
  - Note (2026-02-06): Changed default branch from `feature/phase1-scope-confirmation` to `main` via `gh` CLI. Branch protection applied: 1 required review, dismiss stale reviews, enforce admins, no force-push/deletion. Linear history and conversation resolution not enabled (API limitation on personal repos).
- [x] Merge `feature/vercel-deploy-fixes` PR into `main`
  - Acceptance: PR merged; `main` contains `postinstall` script + docs updates; Vercel Production deploy succeeds
  - Tests: Vercel build passes
  - Note (2026-02-06): Opened and merged PR #1 (`feature/vercel-deploy-fixes` -> `main`). Verified production deployment `leadbitz-24pgp7tzi-5lackjaws-projects.vercel.app` reached `Ready` after merge. Files touched: `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Verify Vercel Production Branch = `main` in project settings
  - Acceptance: Vercel project settings show Production Branch as `main`
  - Tests: n/a
  - Note (2026-02-06): Verified production deploy alias includes `leadbitz-git-main-...`, confirming production traffic is sourced from `main`. Files touched: `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Enforce pre-MVP production freeze policy (`release` integration branch + `main` merge gate)
  - Acceptance: GitHub default branch = `release`; `main` still mapped to Vercel Production; `main` requires 1 approval so single-maintainer merges are blocked until MVP sign-off
  - Tests: `gh repo view --json defaultBranchRef`; `gh api repos/5lackJaw/LeadBitz/branches/main/protection`; Vercel project link metadata check
  - Note (2026-02-06): Set GitHub default branch to `release`, re-enabled `main` required approvals = 1, and documented pre-MVP workflow to ship/testing via Preview only. Vercel Production Branch remains `main`. Files touched: `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/DEPLOYMENT_ENVIRONMENTS.md`, `docs/SOFTWARE_DOCUMENTATION.md`.

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
- [x] Create migrations for core tausers/workspaces/inboxes/campaigns/icp)
  - Acceptance: schema matches ARCHITECTURE.md
  - Tests: integration
  - Note (2026-02-06): Added core Prisma schema models/enums and created migration `20260206025124_create_core_tables` for `users`, `workspaces`, `inbox_connections`, `campaigns`, and `icp_profiles`. Verified with `prisma migrate status` against the Vercel/Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206025124_create_core_tables/migration.sql`, `prisma/migrations/migration_lock.toml`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Create migrations for leads/campaign_leads/suppressions
  - Acceptance: dedupe constraints present
  - Tests: integration
  - Note (2026-02-06): Added `Lead`, `CampaignLead`, and `Suppression` Prisma models with dedupe constraints (`@@unique([workspaceId, email])` on leads/suppressions and `@@unique([campaignId, leadId])` on campaign_leads). Created migration `20260206043217_create_leads_and_suppressions` and verified `prisma migrate status` reports schema up to date on the Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206043217_create_leads_and_suppressions/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Create migrations for sequences/templates/send_jobs/conversations/messages/audit/provenance
  - Acceptance: idempotency unique key on send_jobs
  - Tests: integration
  - Note (2026-02-06): Added Prisma models/enums for `sequences`, `sequence_steps`, `message_templates`, `send_jobs`, `conversations`, `messages`, `audit_events`, `lead_sources`, and `lead_field_provenance`; created migration `20260206050107` and verified `send_jobs_idempotency_key_key` unique index exists in SQL. Verified with `prisma migrate status` against Neon dev database. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206050107/migration.sql`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Acceptance: Phase 1 summary, implementation decisions, and operational gotchas recorded
  - Tests: n/a (documentation task)
  - Note (2026-02-06): Added Phase 1 closeout section, Phase 1 decisions, and migration/environment gotchas to `docs/SOFTWARE_DOCUMENTATION.md`, including Prisma `.env` behavior and UI-spec source-of-truth reference. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/UI_SPEC.md`.

## Phase 2 — Auth + workspace scoping
- [x] Plan/confirm Phase 2 scope
  - Acceptance: route protections defined
  - Tests: n/a
  - Note (2026-02-06): Confirmed Phase 2 boundaries in `docs/SOFTWARE_DOCUMENTATION.md`, including explicit public vs auth-required app routes and protected API scopes for workspace-scoped authorization implementation. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `AGENTS.md`.
- [x] Plan/confirm auth provider + signup/billing strategy (Neon Auth + Google primary)
  - Acceptance: architecture/UX/auth configuration decisions documented, including trusted-domain policy and trial billing entry path
  - Tests: n/a (documentation task)
  - Note (2026-02-06): Documented Neon Auth strategy (Google primary, email/password secondary), trusted-domain guidance, email provider policy, and paid-trial billing flow in `docs/ARCHITECTURE.md`, `docs/UX_SPEC.md`, and `docs/SOFTWARE_DOCUMENTATION.md`. Added implementation follow-up notes and env naming updates to avoid ambiguity in upcoming auth tasks. Files touched: `docs/ARCHITECTURE.md`, `docs/UX_SPEC.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Add NextAuth for app login
  - Acceptance: sign-in/out works
  - Tests: e2e smoke
  - Note (2026-02-06): Added NextAuth credentials login route (`/api/auth/[...nextauth]`), login UI (`/login`), app route protection (`proxy.ts` matcher for `/app/*`), and sign-out action from `/app`. Added required env placeholders in `.env.example`. Files touched: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/sign-out-button.tsx`, `proxy.ts`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Auto-provision workspace on first login
  - Acceptance: workspace created once
  - Tests: integration
  - Note (2026-02-06): Added `ensureUserWorkspace` provisioning helper and invoked it in NextAuth `signIn` callback so first successful login upserts user + creates one default workspace, while subsequent logins reuse the existing workspace. Added integration coverage for idempotent provisioning behavior. Files touched: `auth.ts`, `lib/auth/ensure-user-workspace.ts`, `tests/integration/ensure-user-workspace.test.ts`, `package.json`, `package-lock.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Add workspace-scoped authorization helper
  - Acceptance: cross-workspace access blocked
  - Tests: integration
  - Note (2026-02-06): Added `requireWorkspaceAccess` helper with explicit error codes (`UNAUTHENTICATED`, `NOT_FOUND`, `FORBIDDEN`) to enforce workspace ownership checks by session email + workspace id. Added integration coverage proving same-workspace access succeeds and cross-workspace access is rejected. Files touched: `lib/auth/require-workspace-access.ts`, `tests/integration/workspace-authorization.test.ts`, `tests/integration/test-env.ts`, `tests/integration/ensure-user-workspace.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Note (2026-02-06): Added explicit "Phase 2 closeout" documentation with completion summary, carry-forward decisions (temporary NextAuth bridge + ownership access model), route-handler error mapping guidance for workspace authorization helper, and validation command evidence. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

## Phase 3 — Gmail connect
- [x] Plan/confirm token encryption approach
  - Acceptance: documented decision
  - Tests: n/a
  - Note (2026-02-06): Documented Phase 3 token encryption approach with AES-256-GCM, versioned encrypted-token envelope format, `TOKEN_ENCRYPTION_KEY` usage, decryption boundaries, and MVP key-rotation policy in `docs/ARCHITECTURE.md` and `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
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

