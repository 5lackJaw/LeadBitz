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

## Data model: tables/collections with key fields (additions for automated lead discovery)

### source_connectors
- id, workspace_id
- type (`licensed_provider`|`crm`)
- provider_key (e.g., `apollo`, `pdl`)
- enabled (bool)
- config_json (encrypted at rest where needed)
- allowed_usage_note
- last_healthcheck_at, last_error_code, last_error_message
- created_at, updated_at

### source_runs
- id, workspace_id, campaign_id, connector_id
- run_label
- icp_profile_id
- query_json (filters/limits)
- status (`queued`|`running`|`completed`|`failed`|`partial`)
- stats_json (counts: fetched, deduped, suppressed, candidates_created, verified)
- started_at, finished_at

### candidates
- id, workspace_id, campaign_id, source_run_id
- person_provider_id (nullable), company_provider_id (nullable)
- email, first_name, last_name, title, seniority, department
- company_name, company_domain, company_website
- location_json
- confidence_score (0–1)
- verification_status (`verified`|`risky`|`invalid`|`unknown`)
- status (`new`|`approved`|`rejected`|`suppressed`)
- created_at

### email_verifications
- id, workspace_id
- email
- provider_key
- status (`verified`|`risky`|`invalid`|`unknown`)
- details_json
- checked_at

(Keep existing leads/campaign_leads; “leads” should represent approved contacts.)

## API/contracts (main)

### Source connectors
- `GET /api/sources` → list connectors
- `POST /api/sources` → create connector
  - req: `{ type, providerKey, config }`
  - res: `{ connectorId }`
- `PATCH /api/sources/:id` → enable/disable/update config

### Discovery runs
- `POST /api/campaigns/:id/discovery/run`
  - req: `{ connectorId, icpProfileId, filters: {...}, limit: number, runLabel?: string }`
  - res: `{ sourceRunId, status }`
- `GET /api/campaigns/:id/discovery/runs` → list runs + status/stats
- `GET /api/discovery/runs/:runId` → run details

### Candidates
- `GET /api/campaigns/:id/candidates`
  - query: filters (verificationStatus, role, geo, confidenceMin, sourceRunId)
  - res: `{ items: Candidate[], pageInfo }`
- `POST /api/campaigns/:id/candidates/approve`
  - req: `{ candidateIds: string[], allowUnverified?: boolean }`
  - res: `{ approvedCount, rejected: [{candidateId, reason}] }`
- `POST /api/campaigns/:id/candidates/reject`
  - req: `{ candidateIds: string[], reason?: string }`

### Verification
- `POST /api/verification/batch`
  - req: `{ emails: string[] }`
  - res: `{ results: [{ email, status, checkedAt }] }`

### ICP + drafting
- `POST /api/icp/generate` → `{ icpProfileId, icp }`
- `POST /api/messages/draft` → `{ subject, body, rationaleBullets? }`

### Campaigns
- create/update/launch/pause/resume

### Leads
- import/add/list, suppressions

### Replies
- list/get/categorize/send

### Sending + sync
- Cron: `POST /api/cron/tick`, `POST /api/cron/sync-inbox`

### Auth
- `/login`, `/api/auth/*` (temporary bridge), Neon Auth endpoints for sign-in/sign-up/session validation

### Inbox connect
- `GET /app/settings/inboxes`, `GET /api/inboxes/google/connect`, `GET /api/inboxes/google/callback`

### Inbox settings
- `PATCH /api/inboxes/:inboxConnectionId/settings` (caps/windows/ramp)

### Billing (planned)
- checkout session creation + webhook handlers for trial/subscription state sync

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

## Background jobs/events (additions)
- **Discovery run worker**
  - Executes a source_run:
    1) fetch candidates from licensed provider API (paged, rate-limited)
    2) normalize + write provenance
    3) batch verify emails
    4) apply suppression + dedupe
    5) store remaining as candidates
  - Records run stats and terminal status.

- **Verification worker**
  - Batch verifies emails and upserts email_verifications; updates candidate verification_status.

- Tick: select due send_jobs, enforce caps/windows/ramp, send via provider, update status.
- Sync: poll inbox for new replies; thread match; stop sequence; create suppressions on unsubscribe/bounce signals when available.

## Security
- Session auth for app.
- Workspace-scoped authorization on every query.
- Validate identity tokens against Neon Auth JWKS when Neon-backed session flow is enabled.
- Encrypt OAuth tokens at rest.
  - Decision: symmetric authenticated encryption using AES-256-GCM.
  - Key source: `TOKEN_ENCRYPTION_KEY` environment variable (32-byte secret; unique per environment).
  - Storage format (versioned): `v1:<iv_b64>:<tag_b64>:<ciphertext_b64>`.
  - Scope: `inbox_connections.access_token_encrypted` and `inbox_connections.refresh_token_encrypted` store only encrypted values.
  - Decryption policy: decrypt only inside server-side provider calls; never log raw tokens or decrypted payloads.
- Least-privilege scopes for providers.
- OAuth callback hardening:
  - Short-lived OAuth state cookie.
  - State verification on callback before token exchange.
  - Workspace ownership check before persisting `inbox_connections`.
- Rate limits on AI endpoints.
- Audit logging for critical events.
- Enforced unsubscribe + suppression + caps.

## Security model (additions)
- Source connector configs may include API keys → store **encrypted at rest**; never log secrets.
- All discovery actions are workspace-scoped; runs and candidates must enforce workspace/campaign ownership.
- Rate limit discovery endpoints to prevent abuse and runaway cost.
- Add cost guardrails: per-workspace daily discovery limits and hard stop on provider quota errors.
- Provenance is mandatory for provider-derived fields; store allowed usage notes per connector.

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
