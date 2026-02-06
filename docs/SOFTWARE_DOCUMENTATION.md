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
- Connected the Neon database to Vercel **Development** and **Preview** environments (kept **Production** separate per `docs/DEPLOYMENT_ENVIRONMENTS.md`).
- Neon/Vercel integration created environment variables with a `DATABASE_` prefix, including `DATABASE_URL` for Prisma.

### Vercel CLI linking (2026-02-06)
- Linked the local workspace to the Vercel project using `vercel link`.
- Pulled Vercel Development environment variables into `.env.local` (created by Vercel CLI).
  - `.env.local` contains secrets and must not be committed.
  - `.vercel/` is created by the CLI and is ignored.

## Operational gotchas
- Prisma migrations require a reachable PostgreSQL server.
- If Docker Desktop is unavailable locally, use `npx prisma dev -d` to start Prisma's local Postgres and source the printed `DATABASE_URL`.
- If you run `vercel env pull`, prefer pulling into `.env.development.local` (or `.env.local`) and keep it uncommitted (secrets).

## Changelog
- YYYY-MM-DD: Initial scaffold created.
- 2026-02-05: Confirmed and documented Phase 1 scope boundaries and acceptance mapping.
- 2026-02-05: Initialized Next.js App Router scaffold with TypeScript and ESLint; added `/app` shell route.
- 2026-02-05: Added Prisma + PostgreSQL connection setup, migration scripts, and a shared Prisma client helper.
- 2026-02-06: Set up Vercel project and provisioned a Neon Postgres database for Development/Preview; linked local workspace via Vercel CLI and pulled env vars into a local-only env file.
- 2026-02-06: Deployment workflow hardening: ensured `main` exists on origin for production-branch policy; added a deployment fix to generate Prisma client on install (tracked via PR branch).

## Known issues / limitations
- (empty)
