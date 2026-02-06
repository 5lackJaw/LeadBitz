# Software Documentation (Living)

## Overview
Product: LeadBitz

Website: https://www.leadbitz.com

Deliverability-first cold outreach operations app:
- ICP generation (URL/text) + editor
- Lead import + provenance
- AI-assisted email drafting (human approval)
- Safe sending via connected inbox
- Replies inbox + categorization

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
- `/` (landing scaffold)
- `/login` (NextAuth credentials sign-in page)
- `/app` (app shell scaffold route)
- `/app/onboarding`, `/app/campaigns`, `/app/replies`, `/app/settings/*`
- `/api/auth/[...nextauth]` (NextAuth auth handler)
- `/api/icp/generate`, `/api/messages/draft`
- `/api/campaigns/*`, `/api/campaigns/:id/launch`
- `/api/cron/tick`, `/api/cron/sync-inbox`
- `/api/replies`, `/api/conversations/*`
- `/api/billing/*` (planned checkout + subscription status/webhook handlers)

## Data model summary
(Keep updated after migrations.)
- users, workspaces
- inbox_connections
- campaigns, icp_profiles
- leads, campaign_leads
- sequences, sequence_steps, message_templates
- send_jobs
- conversations, messages
- suppressions
- lead_sources, lead_field_provenance
- audit_events

## Integrations + webhooks
- Neon Auth (Google OAuth + email/password)
- Google OAuth + Gmail API
- Microsoft OAuth + Graph API
- OpenAI API
- Stripe Billing + webhooks

## Testing commands
- Lint: `npm run lint`
- Build/type check: `npm run build`
- Unit:
- Integration: `npm run db:migrate:status` (with a reachable Postgres `DATABASE_URL`)
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
- Preview and local auth credentials can differ. Vercel Preview uses environment variables stored in Vercel, not `.env.preview.local` on your machine.
- Neon Auth trusted domains accept origins only (scheme + host [+ port]); do not enter path segments such as `/app` or `/dashboard`.
- If Docker Desktop is unavailable locally, use `npx prisma dev -d` to start Prisma's local Postgres and source the printed `DATABASE_URL`.
- If you run `vercel env pull`, prefer pulling into `.env.development.local` (or `.env.local`) and keep it uncommitted (secrets).
- `postinstall` script runs `prisma generate` automatically on `npm install` / `npm ci`. This is required for Vercel builds; do not remove it.
- Branch protection enforces admins; even the repo owner must open a PR to merge into `main`.
- In a single-maintainer setup, GitHub disallows self-approval. With required approvals set to `1` on `main`, production merges are intentionally blocked until go-live policy is lifted.
- The `gh` CLI was installed locally for GitHub automation. It is **not** a project dependency (do not add it to `package.json`).
- Current UI design guidance source of truth is `docs/UI_SPEC.md` alongside `docs/CANONICAL_VISUAL_BRAND_SPECIFICATION.md`.

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

## Known issues / limitations
- Vercel CLI/API did not expose a working non-interactive command in this repo session to change `link.productionBranch`; current guardrail is enforced through branch policy and workflow (`release` integration + protected `main`).
- Temporary auth bridge still uses NextAuth credentials flow; Neon Auth-backed session integration is planned in subsequent Phase 2/3 tasks.
