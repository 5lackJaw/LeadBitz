# Architecture (Buildable)

## Stack
- Next.js (App Router) + TypeScript
- NextAuth (app auth + OAuth inbox connect)
- Postgres + Prisma
- Upstash Redis (rate limit counters / optional queue helpers)
- Vercel Cron hitting internal endpoints
- Gmail API + Microsoft Graph
- OpenAI API (server-side)

## System overview
- Next.js UI + API routes
- Postgres as system of record
- Cron-driven job runner for sending + inbox sync
- Provider APIs for send + polling replies

## Data model (key tables)
- users, workspaces
- inbox_connections
- campaigns, icp_profiles
- leads, campaign_leads
- sequences, sequence_steps, message_templates
- send_jobs (unique idempotency_key)
- conversations, messages
- suppressions
- lead_sources, lead_field_provenance
- audit_events

## API/contracts (main)
- `POST /api/icp/generate` → `{ icpProfileId, icp }`
- `POST /api/messages/draft` → `{ subject, body, rationaleBullets? }`
- Campaigns: create/update/launch/pause/resume
- Leads: import/add/list, suppressions
- Replies: list/get/categorize/send
- Cron: `POST /api/cron/tick`, `POST /api/cron/sync-inbox`

## Background jobs
- Tick: select due send_jobs, enforce caps/windows/ramp, send via provider, update status.
- Sync: poll inbox for new replies; thread match; stop sequence; create suppressions on unsubscribe/bounce signals when available.

## Security
- Session auth for app.
- Workspace-scoped authorization on every query.
- Encrypt OAuth tokens at rest.
- Least-privilege scopes for providers.
- Rate limits on AI endpoints.
- Audit logging for critical events.
- Enforced unsubscribe + suppression + caps.

## Observability
- JSON structured logs with request_id/workspace_id/campaign_id/job_id.
- Error reporting: none by default (Vercel logs).

## Testing
- Unit: lint + scheduling/ramp logic.
- Integration: API routes + DB transitions.
- E2E: Playwright wizard + replies inbox (provider APIs mocked).

## Deployment
- Vercel-first; env vars per environment; cron configured in Vercel.
- Intended production domain: https://www.leadbitz.com
