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
1. Install dependencies
2. Set env vars (names below)
3. Run DB migrations
4. Start dev server

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
- Unit:
- Integration:
- E2E (Playwright):

## Deployment notes
- Vercel-first deployment.
- Refer to `DEPLOYMENT_ENVIRONMENTS.md`.

## Changelog
- YYYY-MM-DD: Initial scaffold created.
- 2026-02-05: Confirmed and documented Phase 1 scope boundaries and acceptance mapping.

## Known issues / limitations
- (empty)
