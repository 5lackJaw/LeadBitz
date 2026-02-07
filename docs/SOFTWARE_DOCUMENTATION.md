# Software Documentation (Living)

## Overview
Product: LeadBitz

Website: https://www.leadbitz.com

Deliverability-first cold outreach operations app:
- ICP generation (URL/text) + editor
- Automated lead discovery via licensed provider connector
- Candidate review + approval gate (Candidates → Leads)
- Email verification + suppression safety
- AI-assisted email drafting (human approval)
- Safe sending via connected inbox
- Replies inbox + categorization
- ICP quality gating (score + tier + missing-field checklist)
- Archetype templates + Specialist ICP Interview wizard
- ICP versions center (campaign-scoped)

## Phase planning log
### Phase 1 scope confirmation (2026-02-05)
- Confirmed Phase 1 is limited to project skeleton and database foundations only.
- In scope for Phase 1:
  - Next.js app shell setup with TypeScript and lint/format.
  - Prisma + Postgres connection and migration workflow.
  - Schema/migrations for the core entities listed in `ARCHITECTURE.md`:
    - users, workspaces, inbox_connections, campaigns, icp_profiles
    - leads, campaign_leads, suppressions
    - sequences, sequence_steps, message_templates, send_jobs, conversations, messages, audit_events, lead_sources, lead_field_provenance
  - `send_jobs.idempotency_key` unique constraint.
- Out of scope for Phase 1:
  - Auth, OAuth inbox connection flows, campaign wizard UI, sending runner, reply sync, and compliance UX.
- Acceptance mapping:
  - Phase 1 checklist tasks match the product and architecture docs without adding requirements.

### Phase 1 closeout (2026-02-06)
- Phase 1 implementation completed for scaffold + database foundations.
- Delivered database migrations in three passes:
  - `20260206025124_create_core_tables`
  - `20260206043217_create_leads_and_suppressions`
  - `20260206050107` (sequences/templates/send jobs/conversations/messages/audit/provenance)
- Verified `send_jobs.idempotency_key` unique constraint in generated SQL (`send_jobs_idempotency_key_key`).
- Validation completed after merge to `release`:
  - `npm run db:migrate:status` (schema up to date on Neon dev DB)
  - `npm run lint`
  - `npm run build`

### Phase 1 decisions (2026-02-06)
- Chosen migration sequencing:
  - Core entities first, then leads/suppressions, then scheduling/messaging/provenance tables.
  - Reason: keeps each migration atomic and reviewable while reducing rollback ambiguity.
- Workspace-scoped dedupe constraints were enforced at DB level:
  - leads: `@@unique([workspaceId, email])`
  - suppressions: `@@unique([workspaceId, email])`
  - campaign_leads: `@@unique([campaignId, leadId])`
- Pre-MVP release workflow remains in effect:
  - Development merges into `release`.
  - `main` remains production-gated until MVP sign-off.

### Phase 1 extension progress: ICP quality schema tables (2026-02-07)
- Added additive Prisma schema coverage for ICP quality/versioning surfaces:
  - `icp_versions`
  - `icp_quality_scores`
  - `product_archetype_classifications`
  - `icp_templates`
  - `icp_interview_sessions`
- Added supporting enums for deterministic state typing:
  - `IcpVersionSource`
  - `IcpQualityTier`
  - `IcpInterviewSessionStatus`
- Existing `icp_profiles` table remains unchanged and continues to back current wizard persistence.
- Migration added:
  - `prisma/migrations/20260207045941_add_icp_quality_tables/migration.sql`
- Validation evidence:
  - `npx prisma migrate dev --name add_icp_quality_tables` executed against local Prisma Postgres (`prisma dev`) from a clean migration history.

### Phase 2 scope confirmation (2026-02-06)
- Confirmed Phase 2 is limited to authentication and workspace access-control foundations.
- In scope for Phase 2:
  - Add NextAuth login/logout flow.
  - Auto-provision one workspace for first-time users.
  - Add reusable workspace-scoped authorization helper for API/data access.
  - Define route/API protection boundaries used by later phases.
- Out of scope for Phase 2:
  - Gmail/M365 inbox OAuth connection and token encryption implementation (Phase 3).
  - Campaign wizard/business workflow behavior (Phase 4+).
  - Sending/reply processing and cron job behavior (Phase 7+).
- Route protection map for implementation:
  - Public routes: `/` and auth entry routes only.
  - Auth-required app routes: `/app`, `/app/onboarding`, `/app/campaigns`, `/app/replies`, `/app/settings/*`.
  - Protected API routes (session + workspace checks): `/api/campaigns/*`, `/api/replies*`, `/api/conversations/*`, `/api/cron/*` (cron also requires shared secret once added).
  - AI helper endpoints: `/api/icp/generate`, `/api/messages/draft` require authenticated session and workspace context.
- Acceptance mapping:
  - Phase 2 checklist item "Plan/confirm Phase 2 scope" is satisfied when these route protections and boundaries are documented and subsequent tasks implement against this contract.

### Phase 2 auth strategy confirmation (2026-02-06)
- Identity provider decision: Neon Auth.
- Login method priority:
  - Primary: Google OAuth.
  - Secondary: email/password.
- Domain strategy decision:
  - Keep MVP app routes under the primary domain path (`/app/*`) instead of introducing an `app.` subdomain now.
  - Neon Auth trusted domains should list allowed origins (no path segments), including production domains, release preview alias, and localhost for development only.
- Email provider decision:
  - Shared provider acceptable for dev/preview.
  - Configure custom production sender/domain before go-live.
- Billing/trial decision:
  - Trial starts through subscription checkout with card collected up front.
  - Automatic conversion to paid tier after trial window unless canceled.
  - Do not model trial start as a synthetic `$0` one-off purchase.
- Implementation boundary:
  - Current NextAuth credentials flow is temporary; planned implementation should move to Neon Auth-backed sign-in/session model.

### Phase 2 progress: workspace auto-provision on login (2026-02-06)
- Implemented first-login workspace provisioning in the current NextAuth bridge flow.
- On successful sign-in:
  - User is upserted in `users` by normalized email.
  - If no workspace exists for that owner, one default workspace is created.
  - If a workspace already exists, no additional workspace is created.
- Provisioning behavior lives in `lib/auth/ensure-user-workspace.ts` and is called from NextAuth `signIn` callback in `auth.ts`.
- Integration test coverage was added to verify idempotency (created once, reused on subsequent login).

### Phase 2 progress: workspace-scoped authorization helper (2026-02-06)
- Added reusable helper `requireWorkspaceAccess` in `lib/auth/require-workspace-access.ts`.
- Helper contract:
  - Input: `workspaceId` + authenticated `userEmail`.
  - Output: authorized workspace metadata for downstream route handlers.
  - Errors: explicit `WorkspaceAuthorizationError` codes (`UNAUTHENTICATED`, `NOT_FOUND`, `FORBIDDEN`).
- Authorization rule enforced:
  - Access is allowed only when the requested workspace belongs to the authenticated user (`workspace.ownerId === user.id`).
- Integration coverage added to confirm:
  - same-workspace access succeeds
  - cross-workspace access is blocked with `FORBIDDEN`

### Phase 2 closeout (2026-02-06)
- Phase 2 scope status: complete (auth bridge + workspace access-control foundations).
- Delivered implementation in Phase 2:
  - NextAuth credentials login/logout flow with `/login` and `/api/auth/[...nextauth]`.
  - First-login user/workspace auto-provisioning (`ensureUserWorkspace`).
  - Reusable workspace authorization helper (`requireWorkspaceAccess`) with explicit error codes.
- Decisions confirmed for downstream phases:
  - NextAuth credentials remains a temporary bridge until Neon Auth-backed session integration is implemented.
  - Workspace ownership (`workspace.ownerId`) is the current source of truth for access checks.
- Operational gotchas for implementers:
  - Auth callback provisioning requires a reachable `DATABASE_URL`; login fails if DB connectivity is unavailable.
  - Route handlers using `requireWorkspaceAccess` should map helper errors deterministically:
    - `UNAUTHENTICATED` -> `401`
    - `NOT_FOUND` -> `404`
    - `FORBIDDEN` -> `403`
- Validation evidence captured for Phase 2 completion:
  - `npm run lint`
  - `npm run test:integration`
  - `npm run build`

### Phase 3 planning: token encryption approach (2026-02-06)
- Confirmed token-at-rest encryption approach for provider OAuth credentials.
- Encryption decision:
  - Algorithm: AES-256-GCM (authenticated encryption).
  - Key source: `TOKEN_ENCRYPTION_KEY` (32-byte secret, environment-scoped).
  - Token envelope format: `v1:<iv_b64>:<tag_b64>:<ciphertext_b64>`.
- Storage + runtime rules:
  - Persist only encrypted token payloads in `inbox_connections.access_token_encrypted` and `inbox_connections.refresh_token_encrypted`.
  - Decrypt only on server when invoking provider APIs or refresh flows.
  - Never log plaintext access/refresh tokens or decrypted payloads.
- Rotation policy for MVP:
  - Single active key per environment.
  - If key rotation occurs, existing connections must be re-authorized (deferred re-encryption tooling can be added in a later checklist task if needed).

### Phase 3 progress: Google OAuth inbox connect flow (2026-02-06)
- Implemented Google connect entry + callback routes:
  - `GET /api/inboxes/google/connect`
  - `GET /api/inboxes/google/callback`
- Added inbox connection settings page:
  - `GET /app/settings/inboxes`
  - Displays current Gmail connection status for the signed-in user's primary workspace.
- Current behavior:
  - Connect flow performs OAuth state + PKCE challenge generation.
  - Callback validates state and workspace ownership, exchanges code for access token, fetches Google user identity, and persists `inbox_connections` row as connected.
  - OAuth access/refresh tokens are encrypted at rest during callback completion.
- Validation:
  - Integration test with mocked Google token + userinfo endpoints verifies connection creation and cross-workspace provider-account conflict blocking.

### Phase 3 progress: encrypted token storage + refresh-on-demand (2026-02-06)
- Implemented token encryption helper in `lib/inbox/token-encryption.ts`:
  - AES-256-GCM, envelope format `v1:<iv_b64>:<tag_b64>:<ciphertext_b64>`.
  - Key source: `TOKEN_ENCRYPTION_KEY`.
- Updated Google OAuth completion flow (`completeGoogleConnection`) to persist encrypted provider tokens:
  - `inbox_connections.access_token_encrypted`
  - `inbox_connections.refresh_token_encrypted`
- Added on-demand refresh helper in `lib/inbox/google-token-refresh.ts`:
  - `refreshGoogleAccessToken` exchanges refresh token and updates encrypted DB fields.
  - `getGoogleAccessToken` returns decrypted cached token or refreshes on demand (`forceRefresh` supported).
- Validation:
  - Unit test verifies encryption/decryption roundtrip and payload-format validation.
  - Integration test verifies refresh updates encrypted token fields in DB.

### Phase 3 progress: inbox settings (caps/windows/ramp) UI + API (2026-02-06)
- Added persisted inbox sending settings fields on `inbox_connections`:
  - `daily_send_cap` (default `30`)
  - `send_window_start_hour` (default `9`)
  - `send_window_end_hour` (default `17`)
  - `ramp_up_per_day` (default `5`)
- Added API endpoint:
  - `PATCH /api/inboxes/:inboxConnectionId/settings`
  - Validates session + workspace ownership and enforces bounded numeric settings.
- Added settings UI at `/app/settings/inboxes` for connected Gmail inboxes:
  - Editable cap/window/ramp form.
  - Saves via API and confirms persisted update.
- Validation:
  - Integration test verifies settings persistence and validation failure behavior.

### Phase 3 closeout (2026-02-06)
- Phase 3 scope status: complete (Gmail connect + token handling + inbox send-constraint settings).
- Delivered implementation in Phase 3:
  - Google OAuth connect/callback routes and inbox connection status UI.
  - Encrypted access/refresh token storage and on-demand refresh helpers.
  - Persisted inbox cap/window/ramp settings with API + UI form.
- Decisions confirmed for downstream phases:
  - Token encryption format remains versioned (`v1`) for forward-compatible key/format evolution.
  - Workspace ownership enforcement (`requireWorkspaceAccess`) is required before inbox settings mutation.
  - Inbox send settings are persisted on `inbox_connections` and are now the source of truth for sender scheduling constraints.
- Operational gotchas for implementers:
  - Prisma generate on Windows can fail if `next dev` is running and locking Prisma query engine files; stop dev server before regenerate/migrate.
  - Google connect and refresh flows require `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `TOKEN_ENCRYPTION_KEY` in each environment.
  - Migration `20260206142046_add_inbox_connection_sending_settings` must be applied before using inbox settings API/UI.
- Validation evidence captured for Phase 3 completion:
  - `npm run db:migrate:status`
  - `npm run verify`

### Phase 4 scope confirmation (2026-02-06)
- Confirmed Phase 4 is limited to campaign wizard draft flow + ICP generation/editing foundations.
- In scope for Phase 4:
  - Campaign list + create/rename surfaces.
  - Wizard route and step contract for `/app/campaigns/new`.
  - Step 1 input validation (`websiteUrl` xor `productDescription`).
  - ICP generation endpoint + persistence to `icp_profiles`.
  - ICP editor persistence in the wizard flow.
- Wizard route/step contract for implementation:
  - Route: `/app/campaigns/new`
  - Step 1: Inputs (`websiteUrl` xor `productDescription`, required one path only)
  - Step 2: ICP draft generation + edit
  - Step 3+: deferred to later phases (leads/sequence/review are out of Phase 4 scope)
- Out of scope for Phase 4:
  - Launch pipeline, send job scheduling, and provider send/reply logic (Phase 7+).
  - Leads import/suppression/provenance implementation (Phase 5).
  - Sequence template linting and AI message drafting endpoint behavior beyond stub contracts (Phase 6).
- Acceptance mapping:
  - Phase 4 checklist item "Plan/confirm wizard routes/steps" is satisfied when these routes/step boundaries are documented and subsequent Phase 4 tasks follow this contract.

### Phase 4 progress: campaign CRUD + list page (2026-02-06)
- Implemented workspace-scoped campaign CRUD foundation for Phase 4 list management.
- Delivered backend surfaces:
  - `GET /api/campaigns` returns campaigns for the authenticated user's primary workspace.
  - `POST /api/campaigns` creates a draft campaign with validated name input.
  - `PATCH /api/campaigns/:campaignId` renames an existing campaign in-workspace.
- Delivered UI surfaces:
  - Added `/app/campaigns` page with campaign list table, create form, and inline rename controls.
  - Updated app shell navigation to include campaigns route.
- Validation rules:
  - `campaign.name` required, trimmed, max length 120.
  - Cross-workspace rename is blocked and returned as not found.
- Added integration coverage for create/list/rename and workspace-scope enforcement in `tests/integration/campaign-crud.test.ts`.

### Phase 4 progress: wizard Step 1 inputs + validation (2026-02-06)
- Added wizard Step 1 route:
  - `GET /app/campaigns/new`
- Added validation endpoint:
  - `POST /api/campaigns/wizard/step1`
- Validation contract implemented:
  - Exactly one of `websiteUrl` or `productDescription` is required.
  - Providing both values is rejected.
  - `websiteUrl` must be a valid `http://` or `https://` URL.
- Added client form behavior for Step 1:
  - Input mode is mutually exclusive in UI. Typing into one source input auto-clears the other.
  - Submission validates client-side first, then server-side through the API endpoint.
  - Success message confirms Step 1 completion and indicates Step 2 (ICP generation) is next.
- Added unit test coverage for the validation helper in `tests/unit/wizard-step1-validation.test.ts`.

### Phase 4 progress: ICP generate endpoint (2026-02-06)
- Added authenticated endpoint:
  - `POST /api/icp/generate`
- Endpoint behavior:
  - Validates Step 1 source input contract (`websiteUrl` xor `productDescription`).
  - Generates an ICP draft payload and persists an `icp_profiles` row.
  - Optionally links the generated ICP profile to a campaign (`campaigns.icp_profile_id`) when `campaignId` is provided and workspace-scoped ownership is valid.
  - Returns `{ icpProfileId, icp, sourceType, sourceValue, campaignId }`.
- Added service layer:
  - `lib/icp/generate-icp-profile.ts` with explicit validation/not-found error classes and injectable AI draft generator.
- Testing:
  - Added integration coverage in `tests/integration/icp-generate.test.ts` using a mocked AI generator function to verify profile persistence and campaign-link behavior.

### Phase 4 progress: ICP editor UI (2026-02-06)
- Added Step 2 ICP editor UI to `/app/campaigns/new`:
  - Step 1 now generates draft ICP via `POST /api/icp/generate`.
  - Step 2 renders editable ICP fields and profile name after generation.
  - Save action persists edits through `PATCH /api/icp/profiles/:icpProfileId` and shows explicit save confirmation with a last-saved timestamp in the editor.
- Added persistence service:
  - `lib/icp/update-icp-profile.ts` with validation for editable ICP structure and workspace ownership checks.
- Added API endpoint:
  - `PATCH /api/icp/profiles/:icpProfileId`
  - Enforces authenticated workspace scope and returns persisted profile payload.
- Testing:
  - Added integration test `tests/integration/icp-editor.test.ts` to verify edit persistence and cross-workspace update blocking.

### Phase 4 closeout (2026-02-06)
- Phase 4 scope status: complete (campaign CRUD/list + wizard Step 1 + ICP generation + ICP editor persistence).
- Delivered implementation in Phase 4:
  - Workspace-scoped campaign create/list/rename (`/api/campaigns`, `/api/campaigns/:campaignId`) and `/app/campaigns` management UI.
  - Wizard route `/app/campaigns/new` with Step 1 `websiteUrl` xor `productDescription` validation and clear mutually-exclusive input behavior.
  - ICP generation endpoint `POST /api/icp/generate` with workspace-scoped `icp_profiles` persistence and optional campaign linkage.
  - ICP editor persistence endpoint `PATCH /api/icp/profiles/:icpProfileId` with workspace ownership checks and visible save confirmation in UI.
- Decisions confirmed for downstream phases:
  - ICP generation remains deterministic/mock-backed in current implementation; OpenAI-powered generation quality improvements are deferred to later AI tasks.
  - Step 1 source contract is strict XOR at API boundary; UI assists by auto-clearing alternate source field to keep payload valid.
  - ICP edits are explicit-save only (no autosave), matching operator-controlled workflow requirements.
- Operational gotchas for implementers:
  - A successful "ICP edits saved" message confirms DB persistence, but there is no separate list/detail view yet to re-open previously saved profiles in this phase.
  - Do not treat placeholder/mock ICP content as website-scraping completion; source-specific extraction depth is out of Phase 4 scope.
  - Step 1 validation still enforces `http/https` URLs only and rejects empty/both-provided source input.
- Validation evidence captured for Phase 4 completion:
  - `npm run lint`
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm run build`

### Phase 4 follow-up: campaign control surfaces + wizard resume scaffolding (2026-02-06)
- Added campaign overview route and placeholder flow routes:
  - `GET /app/campaigns/:id`
  - `GET /app/campaigns/:id/discovery`
  - `GET /app/campaigns/:id/candidates`
  - `GET /app/campaigns/:id/sequence`
- Overview behavior now includes:
  - ICP summary visibility from linked `icp_profile`.
  - Connected inbox selector and current connected inbox display.
  - Next-step CTAs: Discovery -> Candidates -> Sequence -> Review/Launch (launch remains placeholder).
  - Status lifecycle placeholder chips (`DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`).
  - Campaign-level control surfaces for `messagingRules` and `discoveryRules`.
- Added wizard resume and campaign linkage behavior:
  - Campaign list now provides `Resume wizard` action per row.
  - Wizard accepts `campaignId` query param and restores persisted `wizardState` when present.
  - Wizard generation/save now persists `wizardState` to campaign and includes `campaignId` in `POST /api/icp/generate`, linking ICP generation to that campaign.
- Added settings sources registry UI stub:
  - `GET /app/settings/sources`
  - Non-functional governance placeholder for enabled/disabled state, usage note, and last status.
- Data model updates for campaign control surfaces:
  - `campaigns.inbox_connection_id` (nullable FK -> `inbox_connections.id`)
  - `campaigns.messaging_rules` (nullable text)
  - `campaigns.discovery_rules` (nullable text)
  - `campaigns.wizard_state` (nullable JSON)
  - Migration: `20260206202000_add_campaign_control_surfaces`
- API updates:
  - `GET /api/campaigns/:campaignId` now returns campaign overview payload.
  - `PATCH /api/campaigns/:campaignId` now supports updates for name, inbox selection, campaign rules, and wizard state.
  - `GET /api/campaigns` and `POST /api/campaigns` payloads now include campaign control-surface fields.
- Validation evidence for this follow-up:
  - `npm run verify`
- Implementation note: Phase 4 extension: ICP quality gate + Scenario A/B + archetype templates + Specialist interview wizard were added as additive surfaces without removing existing wizard contracts.

### Phase 4 progress: deterministic ICP quality rubric thresholds (2026-02-07)
- Added rubric constants and deterministic scoring utility in `lib/icp/icp-quality-rubric.ts`.
- Rubric behavior:
  - Fixed weighted 100-point scale across ICP sections.
  - Returns integer score `0..100`.
  - Tier mapping is constant-driven:
    - `HIGH`: score >= 75
    - `USABLE`: score >= 50 and < 75
    - `INSUFFICIENT`: score < 50
- Output contract includes:
  - `score`
  - `tier`
  - per-field rubric `breakdown`
  - `missingFields` list for sections below minimum requirements
- Unit coverage added in `tests/unit/icp-quality-rubric.test.ts` for:
  - complete payload (`100/HIGH`)
  - partial payload (`59/USABLE`)
  - sparse payload (`11/INSUFFICIENT`)
  - threshold-boundary tier mapping and rubric total-point validation.

### Phase 4 progress: ICP versioning for campaign generation/edit flows (2026-02-07)
- Added campaign-scoped ICP version persistence to existing wizard services without changing current `icp_profiles` persistence contract.
- `generateIcpProfileForWorkspace` now, when `campaignId` is present:
  - deactivates prior active version(s) for the campaign
  - creates a new active `icp_versions` row
  - maps generation input source:
    - website URL -> `IcpVersionSource.WEBSITE` (`title: "Website Draft"`)
    - product description -> `IcpVersionSource.MANUAL` (`title: "Manual Draft"`)
- `updateIcpProfileForWorkspace` now synchronizes linked campaign versions on ICP edit:
  - if active version source is `WEBSITE` or `MANUAL`: update the same active row in place and normalize source to `MANUAL`
  - if active source is non-editable (`TEMPLATE`/`SPECIALIST`) or missing: create a new active manual version and deactivate prior active rows
- `POST /api/icp/generate` response now includes `icpVersionId` for campaign-linked generation calls.
- Integration coverage updates:
  - `tests/integration/icp-generate.test.ts` asserts active version creation + source/title/json linkage.
  - `tests/integration/icp-editor.test.ts` asserts:
    - in-place active manual update path
    - fallback new-manual-version creation path when active source is template.

### Phase 5 planning: provider selection + fields + quotas (2026-02-06)
- Checklist task completed: plan/confirm licensed provider, supported filters, and quota guardrails for discovery.
- Provider selection (MVP default):
  - Chosen provider: `People Data Labs` (`provider_key = pdl`).
  - Scope decision: implement one end-to-end connector only in Phase 5 (search/discovery + pagination + retries + rate-limit handling).
  - Rationale: strong person/company identifiers for dedupe (`person_provider_id`, `company_provider_id`), rich B2B filters, and clear API boundaries for typed wrapper implementation.
- Supported discovery filters for MVP (must be available through connector contract):
  - `industry`
  - `companySize`
  - `jobTitle`
  - `seniority`
  - `department`
  - `geoCountry`
  - `geoRegion`
  - `geoCity`
  - `requiredFields` (email required for sendable candidates)
  - `resultLimit`
- Required candidate/provider fields for normalization:
  - Person: first name, last name, title, seniority, department, email, provider person id.
  - Company: name, domain, website, provider company id.
  - Metadata: source timestamp, confidence score, verification status, provenance source key.
- Quota and cost guardrails (MVP defaults):
  - Per discovery run max candidates fetched: `1000`.
  - Per workspace daily discovery cap: `5000` fetched candidates (hard stop).
  - Connector call budget: enforce provider documented rate limits in wrapper + exponential backoff on transient errors.
  - Terminal run behavior:
    - provider quota exhausted -> mark run `failed` with explicit quota error code.
    - rate-limited partial fetch -> mark run `partial` with stats snapshot.
- Carry-forward implementation rules:
  - Discovery output lands in `candidates` only; no auto-promotion into `leads`.
  - Approval endpoint remains the only path from candidate to sendable lead.
  - Verified-email default remains enforced at approval/sending boundaries, with explicit per-campaign override.

### Phase 0b workflow hardening follow-up (2026-02-06)
- Added baseline developer workflow automation focused on consistency and speed:
  - `AGENTS.md` path/writing clarifications to reduce instruction ambiguity.
  - PR template at `.github/pull_request_template.md` to standardize checklist item text, PASS/FAIL acceptance, and test evidence.
  - New `npm run verify` command that runs lint + integration tests + build in one command.
  - GitHub Actions workflow `.github/workflows/pr-verify.yml` that runs `npm run verify` for pull requests targeting `release`.
  - Branch protection enabled on `release` requiring status check `verify` before merge.
- Expected outcome:
  - Faster PR authoring, less review back-and-forth, and consistent verification before merge.

## Local setup
1. Install dependencies: `npm ci`
2. Set env vars (names below). For local development you can copy `.env.example` to `.env` and adjust values.
  - If using Vercel, you can also link the repo and pull Vercel Development env vars into a local file (see Deployment notes).
3. Generate Prisma client: `npm run prisma:generate`
4. Run DB migrations: `npm run db:migrate:dev -- --name <migration_name>`
5. Start dev server: `npm run dev`

## Env vars (names only)
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_DEMO_EMAIL`
- `AUTH_DEMO_PASSWORD`
- `NEON_AUTH_URL`
- `NEON_AUTH_JWKS_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_*`

## Architecture snapshot
- Next.js UI + API routes
- Postgres (Prisma)
- Cron endpoints for sending + inbox sync
- Gmail/M365 provider APIs
- OpenAI API for ICP/drafting

## Routes/endpoints summary
(Keep updated as built.)

UI:
- `/app/onboarding`
- `/app/campaigns`, `/app/campaigns/new`, `/app/campaigns/:id`
- `/app/campaigns/:id/discovery`
- `/app/campaigns/:id/candidates`
- `/app/campaigns/:id/leads`
- `/app/campaigns/:id/sequence`
- `/app/campaigns/:id/icp`
- `/app/campaigns/:id/icp/improve`
- `/app/settings/icp-templates`
- `/app/replies`
- `/app/settings/sources`
- `/app/settings/verification`

API (high level):
- Sources/connectors: `/api/sources/*`
- Discovery runs: `/api/campaigns/:id/discovery/run`, `/api/campaigns/:id/discovery/runs`
- Candidates: `/api/campaigns/:id/candidates`, `/api/campaigns/:id/candidates/approve`, `/api/campaigns/:id/candidates/reject`
- Verification: `/api/verification/batch`
- ICP + drafting: `/api/icp/generate`, `/api/messages/draft`
- `/api/icp/score`
- `/api/icp/classify-archetype`
- `/api/icp/templates`
- `/api/icp/apply-template`
- `/api/icp/interview/*`
- Sending + sync: `/api/cron/tick`, `/api/cron/sync-inbox`
- Replies: `/api/replies`, `/api/conversations/*`

## Data model summary
(Keep updated after migrations.)

Core:
- users, workspaces
- inbox_connections
- campaigns, icp_profiles
- sequences, sequence_steps, message_templates
- send_jobs
- conversations, messages
- suppressions
- audit_events
- provenance: lead_field_provenance (and related source metadata)

Lead discovery:
- source_connectors
- source_runs
- candidates
- email_verifications
- icp_versions
- icp_quality_scores
- product_archetype_classifications
- icp_templates
- icp_interview_sessions

Approved outreach:
- leads
- campaign_leads

Campaign control-surface additions:
- `campaigns.inbox_connection_id`
- `campaigns.messaging_rules`
- `campaigns.discovery_rules`
- `campaigns.wizard_state`

## Integrations + webhooks
- Neon Auth (Google OAuth + email/password)
- Google OAuth + Gmail API
- Microsoft OAuth + Graph API
- OpenAI API
- Stripe Billing + webhooks

## Testing commands
- Lint: `npm run lint`
- Build/type check: `npm run build`
- Full verification: `npm run verify`
- Unit:
  - `npm run test:unit` (token encryption + wizard Step 1 validation)
- Integration:
  - `npm run db:migrate:status` (with a reachable Postgres `DATABASE_URL`)
  - `npm run test:integration` (validates workspace auto-provision + workspace authorization helper + mocked Google connect + token refresh + inbox settings persistence + campaign create/list/rename + ICP generation + ICP editor persistence behavior)
- E2E (Playwright):

## Deployment notes
- Vercel-first deployment.
- Refer to `DEPLOYMENT_ENVIRONMENTS.md`.

### Vercel project + Neon DB (2026-02-06)
- Created a Vercel project for this repo.
- Provisioned a free-tier Neon Postgres database via Vercel Storage/Marketplace.
  - **Why Neon**: free tier with generous limits; native Vercel integration; supports Preview-vs-Production separation via environment scoping; no paid Supabase subscription required.
- Connected the Neon database to Vercel **Development** and **Preview** environments (kept **Production** separate per `docs/DEPLOYMENT_ENVIRONMENTS.md`).
- Neon/Vercel integration created environment variables with a `DATABASE_` prefix, including `DATABASE_URL` for Prisma.
- **Production DB**: not provisioned yet. When closer to go-live, create a separate Neon project (or branch) and add its `DATABASE_URL` to Vercel Production env vars only.

### Neon Auth configuration decisions (2026-02-06)
- Neon Auth endpoints captured for integration planning:
  - Auth URL: configured in Neon project auth settings.
  - JWKS URL: configured in Neon project auth settings.
- Trusted domains list should include only origins and must cover:
  - `https://leadbitz.com`
  - `https://www.leadbitz.com`
  - `https://leadbitz-git-release-5lackjaws-projects.vercel.app`
  - localhost origins for development.
- Keep "Allow localhost" enabled for development only; disable before production go-live if no longer needed.
- Email provider policy:
  - Shared sender acceptable in non-production.
  - Production requires custom sender/domain setup for reliability and trust.

### Vercel CLI linking (2026-02-06)
- Linked the local workspace to the Vercel project using `vercel link`.
- Pulled Vercel Development environment variables into `.env.local` (created by Vercel CLI).
  - `.env.local` contains secrets and must not be committed.
  - `.vercel/` is created by the CLI and is ignored.

### Deployment hardening (2026-02-06)
- Added `"postinstall": "prisma generate"` script to `package.json` so Prisma Client is generated automatically during `npm install` on Vercel (prevents missing-client build failures).
- Added `.env*.local` pattern to `.gitignore` to prevent Vercel-pulled secrets from being committed.
- Updated `docs/DEPLOYMENT_ENVIRONMENTS.md` with section B1 ("Finding and classifying database URLs") explaining where to find DB URLs and how to classify live vs preview.

### GitHub governance (2026-02-06)
- **Default branch**: Changed GitHub repo default branch from `feature/phase1-scope-confirmation` to `main`.
- **Branch protection on `main`**:
  - Required: pull request workflow (direct pushes blocked).
  - Required approvals: initially set to **0** to permit Phase 0 merges in a single-maintainer setup.
  - Dismiss stale reviews on new pushes.
  - Enforce restrictions for admins (admins also need PRs).
  - Force pushes to `main`: disabled.
  - Branch deletion of `main`: disabled.
  - Linear history: not enabled (GitHub API returned 404 for personal-account repos; can be configured manually via GitHub UI > Settings > Branches if desired).
  - Conversation resolution required: not enabled (same 404 limitation).
- All changes applied via GitHub CLI (`gh`) after installing it locally.

### Pre-MVP production freeze policy (2026-02-06)
- GitHub default branch is now `release` for ongoing MVP integration work.
- Vercel Production Branch remains `main` (verified via project metadata/API).
- `main` branch protection now requires **1 approval**, which intentionally blocks merges in this single-maintainer repo until explicit MVP go-live sign-off.
- Expected workflow during MVP build:
  - `feature/*` -> `release` for all active development and Preview testing.
  - `release` -> `main` only when ready to promote a vetted MVP release to Production.

### Phase 0 closeout (2026-02-06)
- Merged PR #1 (`feature/vercel-deploy-fixes` -> `main`) to land deploy hardening changes (`postinstall` Prisma generation and deployment governance docs) into `main`.
- Verified Vercel production deployment succeeded after merge:
  - Intended production domain: https://www.leadbitz.com
  - Deployment: `https://leadbitz-24pgp7tzi-5lackjaws-projects.vercel.app`
  - Status: `Ready`
- Verified Vercel production branch source is `main`:
  - Production alias includes `https://leadbitz-git-main-5lackjaws-projects.vercel.app`.

## Operational gotchas
- Prisma migrations require a reachable PostgreSQL server.
- Prisma migrate commands read `.env` by default. Keep `.env` aligned with `.env.development.local` (or explicitly set `DATABASE_URL` in shell) before running migration commands.
- NextAuth credentials login depends on `AUTH_DEMO_EMAIL`, `AUTH_DEMO_PASSWORD`, and `NEXTAUTH_SECRET`; sign-in will fail if any are missing.
- NextAuth sign-in now also requires a reachable `DATABASE_URL` because user/workspace provisioning executes during `signIn`.
- Preview and local auth credentials can differ. Vercel Preview uses environment variables stored in Vercel, not `.env.preview.local` on your machine.
- Neon Auth trusted domains accept origins only (scheme + host [+ port]); do not enter path segments such as `/app` or `/dashboard`.
- Google OAuth callback URI must exactly match `${NEXTAUTH_URL}/api/inboxes/google/callback` in Google Cloud OAuth credentials per environment.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be present in local and Preview environments before testing inbox connect flow.
- `TOKEN_ENCRYPTION_KEY` is required for Google token encryption/decryption and refresh; a missing/invalid key will break callback persistence and token refresh operations.
- Campaign names are validated server-side and client-side:
  - required after trim
  - max 120 characters
- Wizard Step 1 source input requires `websiteUrl` xor `productDescription`; empty or both-provided payloads are rejected by API validation.
- `POST /api/icp/generate` currently uses an injectable draft generator abstraction; tests must mock the generator and verify DB persistence, while full OpenAI-backed generation remains a later implementation step.
- ICP editor persistence requires non-empty list values per editable ICP field; empty lists are rejected by `PATCH /api/icp/profiles/:icpProfileId`.
- Campaign-linked wizard resume requires `campaignId` query param (`/app/campaigns/new?campaignId=<id>`); without a campaign id, wizard state persistence is intentionally skipped.
- Inbox settings API validation bounds:
  - `dailySendCap`: `1..500`
  - `sendWindowStartHour`: `0..23`
  - `sendWindowEndHour`: `1..24` and must be greater than `sendWindowStartHour`
  - `rampUpPerDay`: `1..100`
- If Docker Desktop is unavailable locally, use `npx prisma dev -d` to start Prisma's local Postgres and source the printed `DATABASE_URL`.
- If you run `vercel env pull`, prefer pulling into `.env.development.local` (or `.env.local`) and keep it uncommitted (secrets).
- `postinstall` script runs `prisma generate` automatically on `npm install` / `npm ci`. This is required for Vercel builds; do not remove it.
- Branch protection enforces admins; even the repo owner must open a PR to merge into `main`.
- In a single-maintainer setup, GitHub disallows self-approval. With required approvals set to `1` on `main`, production merges are intentionally blocked until go-live policy is lifted.
- The `gh` CLI was installed locally for GitHub automation. It is **not** a project dependency (do not add it to `package.json`).
- Current UI design guidance source of truth is `docs/UI_SPEC.md` alongside `docs/CANONICAL_VISUAL_BRAND_SPECIFICATION.md`.
- `npm run verify` is now the canonical pre-push check. Use it for every feature branch before opening/updating a PR.
- Pull requests into `release` execute `.github/workflows/pr-verify.yml`; keep branch changes compatible with `npm ci` + `npm run verify` on Linux CI.
- `release` is branch-protected with required status check `verify`; merges are blocked until the CI verify job succeeds.
- If shared remote development DB migration checksums drift (for example after history changes on already-applied migrations), avoid resetting shared data; generate/validate new migrations against local `prisma dev` Postgres instead, then apply via normal deploy workflow.

## Changelog
- YYYY-MM-DD: Initial scaffold created.
- 2026-02-05: Confirmed and documented Phase 1 scope boundaries and acceptance mapping.
- 2026-02-05: Initialized Next.js App Router scaffold with TypeScript and ESLint; added `/app` shell route.
- 2026-02-05: Added Prisma + PostgreSQL connection setup, migration scripts, and a shared Prisma client helper.
- 2026-02-06: Set up Vercel project and provisioned a Neon Postgres database for Development/Preview; linked local workspace via Vercel CLI and pulled env vars into a local-only env file.
- 2026-02-06: Deployment workflow hardening: ensured `main` exists on origin for production-branch policy; added a deployment fix to generate Prisma client on install (tracked via PR branch).
- 2026-02-06: GitHub governance: changed default branch to `main`; applied branch protection (PR reviews, dismiss stale, enforce admins, no force-push/deletion).
- 2026-02-06: Updated `DEPLOYMENT_ENVIRONMENTS.md` with B1 section for finding and classifying database URLs.
- 2026-02-06: Added `.env*.local` to `.gitignore` for Vercel-pulled secrets.
- 2026-02-06: Merged `feature/vercel-deploy-fixes` into `main`; production deploy verified `Ready`; production branch verified as `main`.
- 2026-02-06: Adopted pre-MVP release flow: switched GitHub default branch to `release`, kept Vercel Production on `main`, and set `main` approvals to `1` to block live promotions until MVP sign-off.
- 2026-02-06: Completed Phase 1 DB migration set and documented Phase 1 closeout decisions/gotchas.
- 2026-02-06: Confirmed auth/signup strategy: Neon Auth as IdP, Google primary login, email/password secondary login, and subscription-trial billing entry model.
- 2026-02-06: Added first-login workspace auto-provisioning in NextAuth `signIn` flow with integration test coverage for one-time workspace creation.
- 2026-02-06: Added workspace-scoped authorization helper with explicit error codes and integration coverage for cross-workspace access denial.
- 2026-02-06: Closed Phase 2 documentation with consolidated phase summary, decisions, and operational gotchas.
- 2026-02-06: Confirmed Phase 3 token encryption approach (AES-256-GCM, versioned envelope format, env-scoped key policy).
- 2026-02-06: Added workflow automation baseline (`AGENTS` clarity updates, PR template, `npm run verify`, and `release` PR CI verification workflow).
- 2026-02-06: Implemented Phase 3 Google OAuth connect flow for `inbox_connections` with inbox settings UI and mocked integration coverage.
- 2026-02-06: Implemented encrypted OAuth token persistence and on-demand refresh helpers with unit + integration coverage.
- 2026-02-06: Added persisted inbox sending settings (caps/windows/ramp) with update API and settings UI.
- 2026-02-06: Closed Phase 3 documentation with consolidated phase summary, carry-forward decisions, and operational gotchas.
- 2026-02-06: Implemented campaign CRUD foundation (`/api/campaigns`, `/api/campaigns/:campaignId`) and `/app/campaigns` list UI with create/rename flows.
- 2026-02-06: Implemented wizard Step 1 input route (`/app/campaigns/new`) and API validation endpoint (`/api/campaigns/wizard/step1`) enforcing website URL xor product description.
- 2026-02-06: Implemented `POST /api/icp/generate` with workspace-scoped `icp_profiles` persistence and integration coverage using mocked AI generation.
- 2026-02-06: Added Step 2 ICP editor UI on `/app/campaigns/new` and persisted editing API `PATCH /api/icp/profiles/:icpProfileId` with integration coverage.
- 2026-02-06: Closed Phase 4 documentation with consolidated phase summary, carry-forward decisions, and operational gotchas.
- 2026-02-06: Added campaign overview and campaign-level control surfaces (`messaging_rules`, `discovery_rules`, `wizard_state`, optional inbox linkage), plus wizard resume scaffolding and sources registry settings stub.
- 2026-02-07: Added additive ICP quality/versioning schema + migration (`20260207045941_add_icp_quality_tables`) for `icp_versions`, `icp_quality_scores`, `product_archetype_classifications`, `icp_templates`, and `icp_interview_sessions`.
- 2026-02-07: Added deterministic ICP quality rubric constants + tier thresholds and unit coverage for score/tier/missing-field behavior.
- 2026-02-07: Added campaign-linked ICP versioning behavior for generation/edit flows, including active-version update vs new-manual-version fallback rules and integration assertions.

## Known issues / limitations
- Vercel CLI/API did not expose a working non-interactive command in this repo session to change `link.productionBranch`; current guardrail is enforced through branch policy and workflow (`release` integration + protected `main`).
- Temporary auth bridge still uses NextAuth credentials flow; Neon Auth-backed session integration is planned in subsequent Phase 2/3 tasks.
