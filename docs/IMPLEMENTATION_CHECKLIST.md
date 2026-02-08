# Implementation Checklist

**Rules**
- Dev AI must implement exactly one unchecked task per PR.

---

## Phase 0 â€” Deployment infrastructure + repo governance
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

## Phase 0b â€” Workflow hardening follow-up
- [x] Add PR hygiene + verification automation baseline
  - Acceptance: `AGENTS.md` wording/path issues corrected; PR template exists; `npm run verify` runs lint+integration+build; PR CI runs verify on `release` pull requests
  - Tests: `npm run verify`; GitHub Actions workflow file lint-by-execution on PR
  - Note (2026-02-06): Updated `AGENTS.md` for path and wording clarity, added `.github/pull_request_template.md`, added `verify` script in `package.json`, added `.github/workflows/pr-verify.yml` for pull-request verification on `release`, and applied `release` branch protection requiring `verify` status before merge. Files touched: `AGENTS.md`, `.github/pull_request_template.md`, `package.json`, `.github/workflows/pr-verify.yml`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

---

## Phase 1 â€” Skeleton + DB
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
- [x] **Add schema + migration for ICP versions + quality scoring + archetype + templates + interview sessions**
  - Acceptance: tables exist (`icp_versions`, `icp_quality_scores`, `product_archetype_classifications`, `icp_templates`, `icp_interview_sessions`)
  - Tests: integration (migration applies)
  - Notes: Keep existing `icp_profiles` intact; treat new tables as additive. Consider backfill path later.
  - Note (2026-02-07): Added additive Prisma models/enums for `icp_versions`, `icp_quality_scores`, `product_archetype_classifications`, `icp_templates`, and `icp_interview_sessions` while keeping `icp_profiles` unchanged; generated migration `20260207045941_add_icp_quality_tables` with foreign keys and indexes, and validated migration apply on local Prisma Postgres (`prisma dev`). Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207045941_add_icp_quality_tables/migration.sql`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

## Phase 2 â€” Auth + workspace scoping
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

## Phase 3 â€” Gmail connect
- [x] Plan/confirm token encryption approach
  - Acceptance: documented decision
  - Tests: n/a
  - Note (2026-02-06): Documented Phase 3 token encryption approach with AES-256-GCM, versioned encrypted-token envelope format, `TOKEN_ENCRYPTION_KEY` usage, decryption boundaries, and MVP key-rotation policy in `docs/ARCHITECTURE.md` and `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement Google OAuth connect flow for inbox_connections
  - Acceptance: inbox shows connected
  - Tests: e2e with mocks
  - Note (2026-02-06): Implemented Google OAuth connect + callback routes (`/api/inboxes/google/connect`, `/api/inboxes/google/callback`), added `/app/settings/inboxes` UI to show Gmail connection status, and persisted `inbox_connections` as connected after OAuth exchange. Added integration test with mocked Google token/userinfo responses to validate connection creation and cross-workspace provider-account conflict blocking. Files touched: `app/api/inboxes/google/connect/route.ts`, `app/api/inboxes/google/callback/route.ts`, `app/app/settings/inboxes/page.tsx`, `app/app/page.tsx`, `lib/inbox/google-oauth.ts`, `lib/inbox/complete-google-connection.ts`, `lib/auth/get-primary-workspace.ts`, `tests/integration/google-connect-flow.test.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Store encrypted tokens + refresh on demand
  - Acceptance: refresh updates DB
  - Tests: unit+integration
  - Note (2026-02-06): Added AES-256-GCM token encryption/decryption helper, stored encrypted access/refresh tokens during Google OAuth callback completion, and implemented on-demand token refresh helper that updates encrypted token fields in `inbox_connections`. Added unit test coverage for token encryption format/roundtrip and integration coverage for refresh update behavior. Files touched: `lib/inbox/token-encryption.ts`, `lib/inbox/complete-google-connection.ts`, `lib/inbox/google-token-refresh.ts`, `tests/unit/token-encryption.test.ts`, `tests/integration/google-connect-flow.test.ts`, `tests/integration/google-token-refresh.test.ts`, `tests/integration/test-env.ts`, `package.json`, `.env.example`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Inbox settings (caps/windows/ramp) UI + API
  - Acceptance: persisted settings
  - Tests: e2e
  - Note (2026-02-06): Added persisted inbox settings fields on `inbox_connections` (`daily_send_cap`, `send_window_start_hour`, `send_window_end_hour`, `ramp_up_per_day`), implemented `PATCH /api/inboxes/:inboxConnectionId/settings` with workspace-ownership and input validation, and added `/app/settings/inboxes` form for saving settings. Added integration coverage for persistence and validation failures. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206142046_add_inbox_connection_sending_settings/migration.sql`, `lib/inbox/inbox-settings.ts`, `app/api/inboxes/[inboxConnectionId]/settings/route.ts`, `app/app/settings/inboxes/inbox-settings-form.tsx`, `app/app/settings/inboxes/page.tsx`, `tests/integration/inbox-settings.test.ts`, `package.json`, `docs/ARCHITECTURE.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Note (2026-02-06): Added explicit "Phase 3 closeout" documentation with completion summary (Google OAuth connect, encrypted token storage/refresh, inbox settings API/UI), carry-forward decisions, migration/runtime gotchas, and validation command evidence. Also corrected stale Phase 3 note so token persistence status matches implementation. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

## Phase 4 â€” Campaign wizard (draft + ICP)
- [x] Plan/confirm wizard routes/steps
  - Acceptance: matches UX_SPEC.md
  - Tests: n/a
  - Note (2026-02-06): Confirmed Phase 4 wizard route/step boundaries in `docs/SOFTWARE_DOCUMENTATION.md` for `/app/campaigns/new`, including Step 1 xor-input validation contract and explicit scope limits (Step 1 + ICP draft/edit only). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Campaign CRUD + list page
  - Acceptance: create/list/rename works
  - Tests: integration+e2e
  - Note (2026-02-06): Added workspace-scoped campaign CRUD service + API routes (`GET/POST /api/campaigns`, `PATCH /api/campaigns/:campaignId`) and implemented `/app/campaigns` list UI with create + inline rename controls using the CVBS/UI spec token system. Added integration coverage in `tests/integration/campaign-crud.test.ts`. Files touched: `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/app/page.tsx`, `app/app/settings/inboxes/*`, `tests/integration/campaign-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Wizard Step 1 inputs + validation
  - Acceptance: URL xor text enforced
  - Tests: e2e
  - Note (2026-02-06): Added `/app/campaigns/new` Step 1 form and `POST /api/campaigns/wizard/step1` validation endpoint enforcing `websiteUrl` xor `productDescription` with URL format checks (`http/https` only). Added unit validation coverage in `tests/unit/wizard-step1-validation.test.ts` and wired campaigns list CTA to wizard route. Files touched: `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/campaigns/wizard/step1/route.ts`, `lib/campaigns/wizard-step1.ts`, `app/app/campaigns/campaigns-client.tsx`, `tests/unit/wizard-step1-validation.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] ICP generate endpoint (AI mocked in tests)
  - Acceptance: saves icp_profile row
  - Tests: integration
  - Note (2026-02-06): Added `POST /api/icp/generate` with Step 1 xor-input validation, workspace-scoped `icp_profiles` persistence, optional campaign linkage (`campaigns.icp_profile_id`), and structured response payload. Added integration test coverage with mocked AI generator in `tests/integration/icp-generate.test.ts` to verify persisted ICP rows and workspace ownership checks. Files touched: `app/api/icp/generate/route.ts`, `lib/icp/generate-icp-profile.ts`, `tests/integration/icp-generate.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] ICP editor UI
  - Acceptance: edits persist
  - Tests: e2e
  - Note (2026-02-06): Added Step 2 ICP editor UI on `/app/campaigns/new`, wired Step 1 generation to `POST /api/icp/generate`, and implemented persisted save via `PATCH /api/icp/profiles/:icpProfileId`. Added workspace-scoped edit persistence service + integration coverage in `tests/integration/icp-editor.test.ts`. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `app/api/icp/profiles/[icpProfileId]/route.ts`, `lib/icp/update-icp-profile.ts`, `lib/icp/generate-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-editor.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Follow-up note (2026-02-06): Adjusted Step 1 UX so typing into website/product-description auto-clears the alternate source, and added explicit Step 2 "last saved" feedback in the editor after `PATCH` success. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Note (2026-02-06): Added explicit "Phase 4 closeout" section to `docs/SOFTWARE_DOCUMENTATION.md` with completion summary, carry-forward decisions (strict Step 1 XOR contract + explicit-save ICP editor behavior), operational gotchas, and validation evidence (`lint`, `unit`, `integration`, `build`). Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Phase 4 follow-up: campaign overview + wizard resume + sources settings stub
  - Acceptance: `/app/campaigns/:id` shows ICP summary + inbox + next-step CTAs + status lifecycle placeholder; campaign row supports Resume Wizard; wizard state persists by campaign; `/app/settings/sources` stub exists.
  - Tests: integration+build
  - Note (2026-02-06): Added campaign control-surface fields (`messaging_rules`, `discovery_rules`, `wizard_state`, optional `inbox_connection_id`) with migration `20260206202000_add_campaign_control_surfaces`; expanded campaign API/service contracts to support overview + updates; added `/app/campaigns/[campaignId]` overview UI and discovery/candidates/sequence placeholder routes; added `Resume wizard` flow from campaign row and campaign-linked wizard state persistence on `/app/campaigns/new?campaignId=...`; added sources registry stub at `/app/settings/sources`; expanded campaign CRUD integration coverage for rules/wizard state updates. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260206202000_add_campaign_control_surfaces/migration.sql`, `lib/campaigns/campaign-crud.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[campaignId]/route.ts`, `app/app/campaigns/page.tsx`, `app/app/campaigns/campaigns-client.tsx`, `app/app/campaigns/new/page.tsx`, `app/app/campaigns/new/wizard-step1-form.tsx`, `app/app/campaigns/[campaignId]/page.tsx`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `app/app/campaigns/[campaignId]/discovery/page.tsx`, `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/sequence/page.tsx`, `app/app/settings/sources/page.tsx`, `app/app/page.tsx`, `tests/integration/campaign-crud.test.ts`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] **Define ICP rubric + tier thresholds (deterministic)**
  - Acceptance: rubric documented in code as constants; returns score 0â€“100 + tier mapping
  - Tests: unit
  - Notes: No model call needed for rubric math; model only produces structured ICP and missing-field detection if required.
  - Note (2026-02-07): Added deterministic ICP quality rubric constants and scoring utility with explicit tier thresholds and 100-point weighting in `lib/icp/icp-quality-rubric.ts`; added unit tests covering complete/partial/sparse payload scoring, tier boundary mapping, and rubric total validation in `tests/unit/icp-quality-rubric.test.ts`. Files touched: `lib/icp/icp-quality-rubric.ts`, `tests/unit/icp-quality-rubric.test.ts`, `package.json`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Add ICP Versioning (website/manual) for campaigns**
  - Acceptance: generating ICP creates an `icp_versions` row; edits create new version or update same version per defined rule
  - Tests: integration
  - Notes: Do not break current wizard persistence; wire to new tables behind feature flag if needed.
  - Note (2026-02-07): Added campaign-scoped ICP version persistence in generation/edit services: `POST /api/icp/generate` now creates an active `icp_versions` row (`WEBSITE` for website input, `MANUAL` for product-description input), and profile edits update the active website/manual version in place or create a new active manual version when the active source is non-editable (e.g., template/specialist). Added integration assertions in `tests/integration/icp-generate.test.ts` and `tests/integration/icp-editor.test.ts` for creation, active-version updates, and fallback new-version creation behavior. Files touched: `lib/icp/generate-icp-profile.ts`, `lib/icp/update-icp-profile.ts`, `app/api/icp/generate/route.ts`, `tests/integration/icp-generate.test.ts`, `tests/integration/icp-editor.test.ts`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.

- [x] **Implement `/api/icp/score` endpoint + persistence of `icp_quality_scores`**
  - Acceptance: scoring runs for a given icpVersionId and saves results; returns explainable payload
  - Tests: integration
  - Note (2026-02-07): Added `POST /api/icp/score` endpoint and `scoreIcpVersionForWorkspace` service to validate workspace/campaign/version ownership, normalize ICP JSON, run deterministic rubric scoring, and persist explainable results to `icp_quality_scores` (`missingFields`, `explanations`, `questions`, scorer metadata). Added integration coverage in `tests/integration/icp-score.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/score/route.ts`, `lib/icp/score-icp-version.ts`, `tests/integration/icp-score.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Add ICP Quality Panel in wizard Step 2**
  - Acceptance: shows score, tier, missing fields, â€œImprove ICPâ€ CTA; supports â€œContinue anywayâ€ paths
  - Tests: e2e (happy path + insufficient path)
  - Note (2026-02-07): Added an ICP Quality Panel to Step 2 in `app/app/campaigns/new/wizard-step1-form.tsx` with rubric scoring integration (`POST /api/icp/score`), score/tier display, missing-fields/questions visibility, `Improve ICP` CTA, and `Continue anyway to Step 3` behavior that adapts to `USABLE`/`INSUFFICIENT` tiers. Quality scoring is automatically triggered after generation and after saves when `campaignId` + `icpVersionId` are available, and can be manually re-run. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Implement archetype classification endpoint `/api/icp/classify-archetype`**
  - Acceptance: returns archetypeKey/confidence/evidence; persisted to `product_archetype_classifications`
  - Tests: integration (mock AI)
  - Note (2026-02-07): Added `POST /api/icp/classify-archetype` and `classifyProductArchetypeForWorkspace` service with workspace/campaign/version ownership checks, classifier hook for mocked AI behavior, and persistence to `product_archetype_classifications` (including undecided fallback key `UNIDENTIFIED`). Added integration coverage in `tests/integration/icp-classify-archetype.test.ts` and wired it into `npm run test:integration`. Files touched: `app/api/icp/classify-archetype/route.ts`, `lib/icp/classify-product-archetype.ts`, `tests/integration/icp-classify-archetype.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Add Scenario A/B modal flows in wizard**
  - Acceptance: <50 score triggers modal; A if archetype identified above threshold, else B; includes required buttons and persistence behavior
  - Tests: e2e
  - Note (2026-02-07): Added Scenario A/B quality-gate modal flow logic to `app/app/campaigns/new/wizard-step1-form.tsx`: insufficient-score (`tier=INSUFFICIENT`) now triggers archetype classification, opens Scenario A when archetype confidence meets threshold, otherwise Scenario B with disambiguation-question submission loop. Included required buttons (`Apply template`, `Improve with Specialist AI`, `Continue anyway` / `Answer questions`) and persistence behavior by recording wizard state on continue/disambiguation actions. Files touched: `app/app/campaigns/new/wizard-step1-form.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Implement Specialist ICP Interview wizard route `/app/campaigns/:id/icp/improve`**
  - Acceptance: start session â†’ answer questions â†’ completes and creates a new ICP version; shows diff summary
  - Tests: e2e (mock AI)
  - Note (2026-02-07): Implemented Specialist Interview session service + APIs (`/api/icp/interview/start`, `/api/icp/interview/answer`, `/api/icp/interview/complete`) and campaign route UI at `/app/campaigns/[campaignId]/icp/improve` with session start/answer/complete flow and visible ICP diff summary. Wired Scenario A/B "Improve with Specialist AI" actions in wizard Step 2 to navigate into the new route. Added lifecycle integration coverage in `tests/integration/icp-specialist-interview.test.ts`. Files touched: `lib/icp/specialist-interview.ts`, `app/api/icp/interview/*`, `app/app/campaigns/[campaignId]/icp/improve/*`, `app/app/campaigns/new/wizard-step1-form.tsx`, `tests/integration/icp-specialist-interview.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Add ICP Center route `/app/campaigns/:id/icp` (versions + select active)**
  - Acceptance: list versions, show scores, set active version; â€œRe-scoreâ€ action works
  - Tests: e2e smoke
  - Note (2026-02-07): Added campaign-scoped ICP Center route at `/app/campaigns/[campaignId]/icp` with versions table, latest score/tier display, active-version indicator, `Set active` action, and `Re-score` action wired to `/api/icp/score`. Added active-version API `PATCH /api/campaigns/[campaignId]/icp/active` and ICP center service layer for version listing/ownership-safe activation. Added integration coverage in `tests/integration/icp-center.test.ts`. Files touched: `app/app/campaigns/[campaignId]/icp/page.tsx`, `app/app/campaigns/[campaignId]/icp/icp-center-client.tsx`, `app/api/campaigns/[campaignId]/icp/active/route.ts`, `lib/icp/icp-center.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `tests/integration/icp-center.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

- [x] **Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)**
  - Acceptance: Phase 4 extension + ICP surfaces documented (quality gate, scenario flows, templates, interview, routes, data model, APIs)
  - Tests: n/a (documentation task)
  - Notes: Record implementation decisions, gotchas, and any follow-up actions.
  - Note (2026-02-07): Added explicit Phase 4 extension closeout section in `docs/SOFTWARE_DOCUMENTATION.md` consolidating delivered ICP quality surfaces (scoring, Scenario A/B, archetype classification, Specialist interview, ICP Center), carry-forward decisions, and validation evidence. Also confirmed route/API/data-model references are represented in summary sections and operational gotchas. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.

## Phase 5 â€” Lead discovery pipeline (licensed provider) + candidates + verification
- [x] Plan/confirm Phase 5 provider selection + fields + quotas
  - Acceptance: provider chosen and documented; supported filters listed
  - Tests: n/a
  - Note (2026-02-06): Selected People Data Labs (`provider_key: pdl`) as the single MVP licensed discovery connector and documented supported filter contract, required normalized fields, and quota/cost guardrails (per-run cap, daily workspace cap, partial/failure behavior) in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Add DB tables for source_connectors, source_runs, candidates, email_verifications
  - Acceptance: migration applies; indexes on campaign_id, source_run_id, email
  - Tests: integration
  - Note (2026-02-07): Added Prisma models/enums for `source_connectors`, `source_runs`, `candidates`, and `email_verifications` with required indexes (`candidates_campaign_id_idx`, `candidates_source_run_id_idx`, `candidates_email_idx`) and generated migration `20260207162122_add_source_discovery_tables`. Added integration coverage in `tests/integration/source-discovery-schema.test.ts` to verify table + index presence. Files touched: `prisma/schema.prisma`, `prisma/migrations/20260207162122_add_source_discovery_tables/migration.sql`, `tests/integration/source-discovery-schema.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement source connector CRUD API (create/update/enable/disable)
  - Acceptance: can create connector; disable blocks runs
  - Tests: integration
  - Note (2026-02-07): Added `GET/POST /api/sources` and `PATCH /api/sources/:id` routes backed by workspace-scoped source connector service functions. Added disabled-connector run guard (`assertSourceConnectorEnabledForWorkspace`) and integration coverage in `tests/integration/source-connectors-crud.test.ts` proving create/update/disable behavior and disabled-run blocking. Files touched: `app/api/sources/route.ts`, `app/api/sources/[sourceConnectorId]/route.ts`, `lib/sources/source-connectors.ts`, `tests/integration/source-connectors-crud.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement discovery run creation endpoint (creates source_run)
  - Acceptance: validates connector enabled; stores query_json; status queued
  - Tests: integration
  - Note (2026-02-07): Added `POST /api/campaigns/:id/discovery/run` backed by `createDiscoveryRunForWorkspace` service (`lib/sources/source-runs.ts`) with workspace ownership checks, connector-enabled enforcement, `query_json` persistence (`filters` + `limit`), and queued run status. Added integration coverage in `tests/integration/discovery-run-create.test.ts`. Files touched: `app/api/campaigns/[campaignId]/discovery/run/route.ts`, `lib/sources/source-runs.ts`, `tests/integration/discovery-run-create.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement provider client wrapper (rate limiting, retries, pagination, typed responses)
  - Acceptance: handles transient errors; respects provider limits
  - Tests: unit (retry/backoff), integration (mock provider)
  - Note (2026-02-07): Added PDL provider wrapper `lib/sources/pdl-client.ts` with typed candidate response parsing, request pacing (`minRequestIntervalMs`), transient retry/backoff for `429/5xx`, and cursor-based pagination (`searchPage`, `fetchAllCandidates`). Added unit retry/backoff coverage in `tests/unit/pdl-client.test.ts` and mock-provider pagination integration coverage in `tests/integration/pdl-client-mock.test.ts`. Files touched: `lib/sources/pdl-client.ts`, `tests/unit/pdl-client.test.ts`, `tests/integration/pdl-client-mock.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement discovery run worker (fetch â†’ normalize â†’ store candidates)
  - Acceptance: creates candidates with confidence + provenance; run stats recorded
  - Tests: integration (mock provider)
  - Note (2026-02-07): Added discovery run worker `executeDiscoveryRun` in `lib/sources/discovery-run-worker.ts` to transition run status (`QUEUED` -> `RUNNING` -> `COMPLETED/FAILED`), fetch candidates via provider client abstraction, normalize and persist candidate rows, and record run stats in `source_runs.stats_json`. Added integration coverage in `tests/integration/discovery-run-worker.test.ts` with mocked provider responses. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement email verification client + batch verify worker
  - Acceptance: writes email_verifications; updates candidates verification_status
  - Tests: integration (mock verifier)
  - Note (2026-02-07): Added `lib/sources/email-verification-client.ts` (retry-capable, provider-keyed batch verify client) and `lib/sources/email-verification-worker.ts` (`verifyCandidateEmailsForSourceRun`) that writes `email_verifications` rows and updates candidate `verification_status` values for the source run. Added integration coverage in `tests/integration/email-verification-worker.test.ts` with a mocked verifier implementation. Files touched: `lib/sources/email-verification-client.ts`, `lib/sources/email-verification-worker.ts`, `tests/integration/email-verification-worker.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement suppression + dedupe application during candidate creation
  - Acceptance: suppressed/duplicate candidates marked and excluded from â€œapprovableâ€
  - Tests: integration
  - Note (2026-02-08): Extended discovery worker candidate creation path to apply suppression list + dedupe rules (existing suppressions, existing leads, existing campaign candidates, and same-run duplicates by email/person/company IDs). Candidates matching these checks are persisted with `status=SUPPRESSED`, while approvable rows remain `status=NEW`. Added integration coverage in `tests/integration/discovery-run-suppression-dedupe.test.ts` and updated worker stats to include `approvableCandidates`, `suppressedByBlocklist`, and `suppressedByDuplicate`. Files touched: `lib/sources/discovery-run-worker.ts`, `tests/integration/discovery-run-worker.test.ts`, `tests/integration/discovery-run-suppression-dedupe.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement candidates list API (filters, pagination)
  - Acceptance: filters work (verification, confidence, role, source_run)
  - Tests: integration
  - Note (2026-02-08): Added workspace-scoped candidates listing service and API endpoint `GET /api/campaigns/:campaignId/candidates` with filter support (`verificationStatus`, `confidenceMin`, `role`, `sourceRunId`) and cursor pagination (`pageSize`, `cursor`). Added integration coverage in `tests/integration/candidates-list.test.ts` for filters, pagination, workspace isolation, and invalid-input/not-found handling. Files touched: `lib/sources/candidates.ts`, `app/api/campaigns/[campaignId]/candidates/route.ts`, `tests/integration/candidates-list.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement candidates review UI (/candidates) with approve/reject flows
  - Acceptance: bulk approve moves to Leads; reject persists
  - Tests: e2e
  - Note (2026-02-08): Replaced `/app/campaigns/:id/candidates` placeholder with a working candidates review UI including filters, selectable table rows, bulk "Approve to leads" and "Reject selected" flows, and cursor pagination controls. Implemented server-side review actions and candidate-review service to persist candidate status updates and campaign lead creation. Added integration coverage in `tests/integration/candidates-review.test.ts`. Files touched: `app/app/campaigns/[campaignId]/candidates/page.tsx`, `app/app/campaigns/[campaignId]/candidates/candidates-review-client.tsx`, `app/app/campaigns/[campaignId]/candidates/actions.ts`, `lib/sources/candidate-review.ts`, `tests/integration/candidates-review.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement approve endpoint (Candidates â†’ Leads) with enforcement rules
  - Acceptance: cannot approve invalid emails; verified-only default; explicit allowUnverified requires confirmation
  - Tests: integration
  - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/candidates/approve` with workspace/campaign ownership checks and enforcement rules: invalid emails are always rejected, approvals are verified-only by default, and `allowUnverified=true` requires `confirmAllowUnverified=true`. Implemented approval service with structured rejection reasons and persisted lead/campaign_lead creation for approved candidates. Added integration coverage in `tests/integration/candidates-approve-rules.test.ts`. Files touched: `app/api/campaigns/[campaignId]/candidates/approve/route.ts`, `lib/sources/candidate-approval.ts`, `tests/integration/candidates-approve-rules.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Note (2026-02-08): Added explicit Phase 5 closeout documentation with completion summary, implementation decisions, and operational gotchas for discovery runs, candidate approval gating, and verification enforcement. Updated route/API/data-model summaries and changelog continuity in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


## Phase 6 â€” Lead import fallback (CSV/paste/manual) + provenance (optional but recommended)
- [x] Plan/confirm Phase 6 fallback import scope + mapping UX
  - Acceptance: fallback explicitly positioned; does not replace discovery
  - Tests: n/a
  - Note (2026-02-08): Confirmed Phase 6 is a fallback ingestion surface only (CSV/paste/manual) and does not replace licensed-provider discovery as the primary lead acquisition path. Documented mapping UX boundaries, dedupe/suppression/provenance expectations, and out-of-scope constraints in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement CSV import API with dedupe + suppression + provenance source csv_import
  - Acceptance: row-level errors; provenance recorded
  - Tests: integration
  - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/csv` backed by `importCsvLeadsForWorkspace` service with CSV parsing, row-level outcome reporting, suppression filtering, dedupe (in-file + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=csv_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/csv-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/csv/route.ts`, `lib/leads/csv-import.ts`, `tests/integration/csv-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement paste/manual add API with dedupe + suppression
  - Acceptance: validates email; prevents duplicates
  - Tests: unit+integration
  - Note (2026-02-08): Added `POST /api/campaigns/:campaignId/leads/import/manual` backed by `importManualLeadsForWorkspace` with payload-level email validation, suppression filtering, dedupe (in-request + existing leads), campaign lead linking, and provenance writes via `lead_sources(name=manual_import)` + `lead_field_provenance`. Added integration coverage in `tests/integration/manual-import-api.test.ts`. Files touched: `app/api/campaigns/[campaignId]/leads/import/manual/route.ts`, `lib/leads/manual-import.ts`, `tests/integration/manual-import-api.test.ts`, `package.json`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Implement UI import tools inside campaign leads page
  - Acceptance: import works; dedupe outcomes visible
  - Tests: e2e
  - Note (2026-02-08): Added `/app/campaigns/:campaignId/leads` with working CSV + manual import tools wired to import APIs, visible per-row outcome reporting, and current campaign leads table refresh after imports. Added campaign overview CTA to the leads page. Files touched: `app/app/campaigns/[campaignId]/leads/page.tsx`, `app/app/campaigns/[campaignId]/leads/leads-import-client.tsx`, `lib/leads/campaign-leads.ts`, `app/app/campaigns/[campaignId]/campaign-overview-client.tsx`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Update SOFTWARE_DOCUMENTATION.md (phase summary + decisions + gotchas)
  - Note (2026-02-08): Added explicit Phase 6 closeout documentation summarizing fallback import implementation, key decisions, and operational gotchas for CSV/manual ingestion and provenance behavior. Updated changelog continuity in `docs/SOFTWARE_DOCUMENTATION.md`. Files touched: `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.


- [x] Implement canonical app shell + global navigation + top-level screen skeleton scaffolds
  - Acceptance: all `/app/*` routes render inside reusable shell; global nav includes Dashboard/Campaigns/Leads/Replies/Settings with stable active state; skeleton routes exist for `/app/dashboard`, `/app/campaigns`, `/app/leads`, `/app/replies`, `/app/settings`
  - Tests: lint + integration + build
  - Note (2026-02-08): Added shared app layout wrapper (`app/app/layout.tsx`) using new shell component (`app/app/_components/app-shell.tsx`) with collapsible left navigation, top utility bar, and persisted nav shell state. Added reusable skeleton primitives (`app/app/_components/screen-skeleton.tsx`) and implemented top-level structure-only pages for dashboard/campaigns/leads/replies/settings. Finalized canonical dashboard/leads routes, global search interaction contract, mobile top-bar behavior, tablet right-rail interaction, and Support/Help destination behavior in code + canonical specs. Files touched: `app/app/layout.tsx`, `app/app/_components/*`, `app/app/page.tsx`, `app/app/dashboard/page.tsx`, `app/app/campaigns/page.tsx`, `app/app/leads/page.tsx`, `app/app/leads/[leadId]/page.tsx`, `app/app/replies/page.tsx`, `app/app/settings/page.tsx`, `app/globals.css`, `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/UX_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/UI_SPEC.md`, `docs/COVERAGE_MATRIX.md`, `docs/SPEC_GAPS.md`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
  - Follow-up note (2026-02-08): Removed scaffold-only skeleton screen implementation for top-level app routes and restored real route content behavior for `/app`, `/app/campaigns`, and `/app/settings` while keeping app-shell layout wrapping intact. Preserved campaign list server-data wiring and wizard entry points (`Open wizard`, `Create campaign`, `Resume wizard`). Removed duplicated rail links from the shell and retained a single sidebar navigation surface. Files touched: `app/app/_components/app-shell.tsx`, `app/app/_components/app-shell.constants.ts`, `app/app/page.tsx`, `app/app/campaigns/page.tsx`, `app/app/settings/page.tsx`, `app/app/leads/page.tsx`, `app/app/leads/[leadId]/page.tsx`, `app/app/replies/page.tsx`, `app/globals.css`, `docs/SOFTWARE_DOCUMENTATION.md`, `docs/IMPLEMENTATION_CHECKLIST.md`.
- [x] Resolve GAP-001: Dashboard canonical route
  - Note (2026-02-08): Defined `/app` as canonical Dashboard route and made `/app/dashboard` redirect-only (308) in code and specs. Files touched: `app/app/page.tsx`, `app/app/dashboard/page.tsx`, `app/app/_components/app-shell.constants.ts`, `app/app/_components/app-shell.tsx`, `docs/UX_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/COVERAGE_MATRIX.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Resolve GAP-002: Leads global route contract
  - Note (2026-02-08): Defined `/app/leads` as canonical Leads list route and preserved `/app/leads/:leadId` detail contract with deterministic list-to-detail navigation and active-nav behavior. Files touched: `app/app/_components/app-shell.constants.ts`, `app/app/_components/app-shell.tsx`, `app/app/leads/page.tsx`, `app/app/leads/[leadId]/page.tsx`, `docs/UX_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/COVERAGE_MATRIX.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Resolve GAP-003: Global search behavior contract
  - Note (2026-02-08): Implemented top-bar global typeahead with debounced grouped results (Campaigns/Leads/Replies/Settings), combobox/listbox keyboard behavior, and canonical-route navigation. Files touched: `app/app/_components/app-shell.constants.ts`, `app/app/_components/app-shell.tsx`, `app/globals.css`, `docs/UX_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Resolve GAP-004: Top bar tablet/mobile behavior
  - Note (2026-02-08): Set top utility bar as persistent across breakpoints and confirmed mobile drawer opens beneath fixed top bar. Files touched: `app/app/_components/app-shell.tsx`, `app/globals.css`, `docs/UI_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Resolve GAP-005: Right-rail tablet interaction contract
  - Note (2026-02-08): Implemented tablet default-closed right rail with screen-level toggle and overlay panel dismissal via close button, Esc, and scrim click. Files touched: `app/app/_components/screen-skeleton.tsx`, `app/globals.css`, `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/UI_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.
- [x] Resolve GAP-006: Support/help destination contract
  - Note (2026-02-08): Implemented sidebar lower-section Support entry as configurable external destination opening in new tab/window. Files touched: `app/app/_components/app-shell.constants.ts`, `app/app/_components/app-shell.tsx`, `app/globals.css`, `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`, `docs/UX_SPEC.md`, `docs/SCREEN_BY_SCREEN_UX_SPEC.md`, `docs/SPEC_GAPS.md`, `docs/IMPLEMENTATION_CHECKLIST.md`, `docs/SOFTWARE_DOCUMENTATION.md`.

## Phase 7 — Sequence + templates + lint + AI draft
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

## Phase 8 â€” Launch + job scheduling
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

## Phase 9 â€” Cron sender + Gmail send
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

## Phase 10 â€” Inbox polling + replies inbox
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

## Phase 11 â€” Compliance hardening
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


