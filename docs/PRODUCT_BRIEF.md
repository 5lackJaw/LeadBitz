# LeadBitz — Product Brief

Website: https://www.leadbitz.com

## One-line summary
A deliverability-first outbound operations app that turns a company website/product description into an operator-controlled outreach campaign: ICP → bring/import leads → AI-assisted messaging → safe sending → reply workflow.

## Target users + primary JTBD
- **Users:** Small B2B teams and agencies running outbound campaigns.
- **JTBD:** “Create and run a controlled outbound campaign without juggling tools or damaging domain reputation; keep messaging human-quality; handle replies reliably.”

## Problem statement
Outbound operators struggle with (1) defining ICP consistently, (2) managing lead lists across tools, (3) producing personalization at scale without sounding robotic, (4) deliverability setup + ongoing safeguards, and (5) keeping reply handling organized.

## In-scope features (MVP)
1) **Workspace + Campaigns**
- Create workspace (single-tenant per user by default) and campaigns.
- Campaign wizard: Website/product input → ICP draft → lead import → sequence → review → launch.

2) **ICP generation + editing**
- Ingest website URL or pasted product description.
- AI produces: target industries, company size bands, buyer roles, pains, exclusions, value prop angles.
- User can edit and save as ICP profile(s).

3) **Leads: BYO + Integrations (no scraping promise)**
- CSV upload, copy/paste, manual add; dedupe on email + domain.
- Optional integrations (MVP: one integration path stubbed behind interface; implement later): CRM import (HubSpot/Salesforce) and/or licensed data provider API.
- Lead enrichment is limited to fields the user provides or licensed integrations.

4) **Source governance layer**
- “Source Registry” that records which source produced which fields for a lead: source name, constraints note, timestamps, confidence/freshness.
- Ability to disable a source globally (affects enrichment/import pipelines).

5) **Sequences + AI drafting (operator-first)**
- Sequence builder for **email** steps (MVP): step timing, stop-on-reply, per-step templates.
- AI drafts: subject/body, optional first-line “icebreaker” generated from allowed inputs (lead fields + company website if provided by user).
- Human review/approval required before launch; AI is a co-pilot, not autopilot.

6) **Deliverability “safe primitives” (enforced defaults)**
- Domain/inbox setup checklist: SPF/DKIM/DMARC guidance + validation checks where feasible.
- Throttling, send windows, ramp schedules, per-inbox daily caps.
- Bounce/complaint suppression list; global do-not-contact list.
- Copy linting (spammy phrasing checks) and link/image warnings.
- Warm-up is optional and implemented as “integration or guidance-only,” not a core dependency.

7) **Sending (connected inbox)**
- Connect Gmail and Microsoft 365 via OAuth; send via provider API.
- Queue-based sending; idempotent send jobs; pause/resume campaign.

8) **Replies + pipeline**
- Unified “Replies” view: categorize (Interested / Objection / Not now / Unsubscribe / Wrong person / Bounce).
- AI suggested replies (draft-only) for human approval.
- Basic pipeline stages for replied leads (Needs response → In conversation → Meeting requested → Closed).

9) **Compliance + anti-abuse**
- Unsubscribe handling (link + one-click suppression).
- Per-workspace sending caps; blocklist for abusive content; mandatory identification/footer fields.
- Audit logs for critical events (connect inbox, launch campaign, sends, suppressions).

## Out-of-scope / non-goals (MVP)
- “Universal lead scraping” or claims of scraping any site/platform (explicit non-goal).
- Browser-extension-based LinkedIn automation as a core pillar.
- Full CRM replacement (opportunity forecasting, quotas, complex deal stages).
- Automated AI replies without human approval.
- Multi-tenant agency client portals (can be added later).
- Warm-up network built in-house (integration later).

## Success criteria (measurable; MVP)
- A user can launch a campaign end-to-end (ICP → import leads → sequence → send) in **≤ 20 minutes**.
- System enforces: unsubscribe link + suppression + throttling/ramp on every campaign.
- Campaign sending is reliable: **≥ 99%** scheduled send jobs either sent or fail with actionable error + retry state.
- Replies are captured and visible in app for connected inboxes; user can categorize and respond.

## Key entities (plain English)
- **User**: authenticated operator.
- **Workspace**: container for data, settings, connected inboxes.
- **Campaign**: outreach effort tied to an ICP, lead set, and sequence.
- **ICP Profile**: targeting rules + positioning notes used for AI drafting and filters.
- **Lead**: person/contact record (email required for email channel).
- **Company**: optional associated org record (domain, name, site).
- **Sequence Step**: scheduled action (email step in MVP).
- **Message Template**: editable subject/body with variables.
- **Send Job**: queued unit of work to send a specific message to a lead.
- **Conversation**: thread of inbound/outbound messages for a lead.
- **Suppression**: do-not-contact entry (unsubscribed, bounced, complained).
- **Source Registry Entry**: provenance metadata for lead fields.

## Key workflows (step-by-step)
### 1) Create campaign (wizard)
1. Create campaign → input website URL or paste product description.
2. AI generates ICP draft → user edits + confirms.
3. Import leads (CSV / paste / manual) → map fields → dedupe → validation.
4. Configure sequence (steps + timing) → AI draft templates → user edits.
5. Deliverability checks run (required) → user resolves blockers.
6. Review screen: sample renders, daily volume plan, compliance footer, unsubscribe.
7. Launch → campaign schedules jobs into send queue.

### 2) Safe sending loop
1. Scheduler selects due send jobs (respecting caps, ramp, quiet hours).
2. Send via Gmail/M365 API.
3. Record outcome; update lead status; log event.
4. On bounce/complaint → suppress lead and optionally pause campaign.

### 3) Reply handling
1. Inbound message detected (provider sync).
2. Thread matched to lead/campaign.
3. User sees reply in “Replies” inbox.
4. User categorizes; AI suggests response (optional); user sends or marks done.
5. Lead stage updates and stops future steps as configured.

## Open decisions (only truly blocking) + recommended default
1) **Connected inbox scope (MVP)**
- Options: Gmail only vs Gmail+M365.
- **Default:** Gmail + M365 (OAuth) since both are common; implement Gmail first, M365 next.

2) **Reply capture method**
- Options: provider webhooks/push vs polling.
- **Default:** Polling for MVP; add push later for scale.

3) **Tracking (opens/clicks)**
- Options: none vs opens only vs opens+clicks.
- **Default:** Click tracking only optional; **no open pixel by default**.

## Constraints
- **Hosting:** Vercel-first (Next.js).
- **Costs:** Minimize third-party paid dependencies; no built-in lead database.
- **Compliance:** enforce unsubscribe + suppression; user attests lawful basis; store minimal PII; delete/export support.
- **Outbound email safety:** conservative caps, throttling, ramp schedules; no “growth-hack” exploits.

## Assumptions/defaults made
- MVP does **not** promise scraping; lead sourcing is BYO + licensed integrations only.
- Email is the only automated channel in MVP.
- Operator-first: AI drafts; human approves; safety controls enforced.
- Warm-up is optional and externalized as integration/guidance.
