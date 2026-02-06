# Architecture (Buildable)

## Stack
- Next.js (App Router) + TypeScript
- Neon Auth (Google OAuth primary + email/password secondary)
- NextAuth (temporary session bridge in current codebase; planned migration to Neon Auth-backed session model)
- Postgres + Prisma
- Upstash Redis (rate limit counters / optional queue helpers)
- Vercel Cron hitting internal endpoints
- Gmail API + Microsoft Graph
- OpenAI API (server-side)
- Stripe Billing (trial + subscription lifecycle)

## System overview
- Next.js UI + API routes
- Postgres as system of record
- Cron-driven job runner for sending + inbox sync
- Provider APIs for send + polling replies
- Neon Auth as identity provider and JWT issuer
- Stripe as billing source of truth for trial/paid access state

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
- `POST /api/icp/generate` -> `{ icpProfileId, icp }`
- `POST /api/messages/draft` -> `{ subject, body, rationaleBullets? }`
- Campaigns: create/update/launch/pause/resume
- Leads: import/add/list, suppressions
- Replies: list/get/categorize/send
- Cron: `POST /api/cron/tick`, `POST /api/cron/sync-inbox`
- Auth: `/login`, `/api/auth/*` (temporary bridge), Neon Auth endpoints for sign-in/sign-up/session validation
- Billing (planned): checkout session creation + webhook handlers for trial/subscription state sync

## Auth and identity
- Identity provider decision: Neon Auth.
- Login methods:
  - Primary: Google OAuth.
  - Secondary: email/password.
- Trusted redirect domains (allowlist) are configured in Neon Auth and must include:
  - `https://leadbitz.com`
  - `https://www.leadbitz.com`
  - `https://leadbitz-git-release-5lackjaws-projects.vercel.app`
  - localhost origins for development only.
- MVP app route structure remains `/app/*` under the primary web domain (no `app.` subdomain split yet).
- JWT verification source: Neon Auth JWKS endpoint.
- Current code note: NextAuth credentials flow is still present as an interim bridge and should be replaced as Neon Auth integration tasks are implemented.

## Billing and trial architecture
- Pricing model decision: paid tiers with trial period and automatic renewal.
- Trial entry decision: card-collected trial through Stripe subscription checkout (do not implement synthetic `$0` one-off purchase flow).
- Access model:
  - Auth establishes identity.
  - Billing state (trialing/active/past_due/canceled) gates workspace access and limits.
- Required integration surfaces:
  - Server-side checkout session creation endpoint.
  - Stripe webhooks for subscription lifecycle updates.
  - Workspace-level billing status persistence and enforcement hooks.

## Background jobs
- Tick: select due send_jobs, enforce caps/windows/ramp, send via provider, update status.
- Sync: poll inbox for new replies; thread match; stop sequence; create suppressions on unsubscribe/bounce signals when available.

## Security
- Session auth for app.
- Workspace-scoped authorization on every query.
- Validate identity tokens against Neon Auth JWKS when Neon-backed session flow is enabled.
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
