# Software Documentation (Living)

## Overview
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
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Architecture snapshot
- Next.js UI + API routes
- Postgres (Prisma)
- Cron endpoints for sending + inbox sync
- Gmail/M365 provider APIs
- OpenAI API for ICP/drafting

## Routes/endpoints summary
(Keep updated as built.)
- `/` (landing scaffold)
- `/app` (app shell scaffold route)
- `/app/onboarding`, `/app/campaigns`, `/app/replies`, `/app/settings/*`
- `/api/icp/generate`, `/api/messages/draft`
- `/api/campaigns/*`, `/api/campaigns/:id/launch`
- `/api/cron/tick`, `/api/cron/sync-inbox`
- `/api/replies`, `/api/conversations/*`

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
- Google OAuth + Gmail API
- Microsoft OAuth + Graph API
- OpenAI API

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
  - Deployment: `https://leadbitz-24pgp7tzi-5lackjaws-projects.vercel.app`
  - Status: `Ready`
- Verified Vercel production branch source is `main`:
  - Production alias includes `https://leadbitz-git-main-5lackjaws-projects.vercel.app`.

## Operational gotchas
- Prisma migrations require a reachable PostgreSQL server.
- If Docker Desktop is unavailable locally, use `npx prisma dev -d` to start Prisma's local Postgres and source the printed `DATABASE_URL`.
- If you run `vercel env pull`, prefer pulling into `.env.development.local` (or `.env.local`) and keep it uncommitted (secrets).
- `postinstall` script runs `prisma generate` automatically on `npm install` / `npm ci`. This is required for Vercel builds; do not remove it.
- Branch protection enforces admins; even the repo owner must open a PR to merge into `main`.
- In a single-maintainer setup, GitHub disallows self-approval. With required approvals set to `1` on `main`, production merges are intentionally blocked until go-live policy is lifted.
- The `gh` CLI was installed locally for GitHub automation. It is **not** a project dependency (do not add it to `package.json`).

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

## Known issues / limitations
- Vercel CLI/API did not expose a working non-interactive command in this repo session to change `link.productionBranch`; current guardrail is enforced through branch policy and workflow (`release` integration + protected `main`).
