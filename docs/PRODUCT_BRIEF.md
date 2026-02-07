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

2) **ICP generation + editing (quality-gated)**
- Ingest website URL or pasted product description.
- AI produces a structured ICP draft:
  - target industries, company size bands, geos
  - buyer roles/titles + seniority + departments
  - pains + triggers ("why now")
  - exclusions / anti-ICP
  - value props + proof points
- User can edit and save ICP versions.

2.1) **ICP Quality Gate (required)**
- After initial ICP generation, the system computes an **ICP Quality Score (0–100)** using a deterministic rubric and returns:
  - score, tier, missing fields, and top questions to improve
  - “why” bullets (explainable scoring)
- Quality tiers:
  - **≥ 75**: “High-quality ICP” → proceed normally
  - **50–74**: “Usable ICP” → warn + recommend improvement
  - **< 50**: “Insufficient ICP” → trigger Scenario A/B flow

2.2) **Scenario A — insufficient ICP but product archetype identified**
- If the system identifies a **product archetype** (e.g., “Outbound Automation SaaS”, “Dev Tools”, “Vertical SaaS”) above confidence threshold:
  - Show a gating message:
    - “We couldn’t create a high-quality ICP from your website alone.”
    - “We think you fit the **{archetype}** model.”
- If an ICP template exists for the archetype:
  - Offer: “Apply our {archetype} ICP template” (guided, structured)
- If no template exists:
  - Offer: “Request a template” (logs an internal event)
  - Offer: “Improve ICP with Specialist AI” (structured interview)
- Always include: “No, continue anyway” (saves website ICP as-is)

2.3) **Scenario B — insufficient ICP and archetype not identified**
- Ask a short set of disambiguation questions to identify archetype:
  - e.g., target user type, pricing model, sales motion, implementation type, buyer role
- If archetype becomes identified → Scenario A.
- If still not identified → offer “Specialist AI interview” to create a high-quality ICP.
- Always include: “No, continue anyway” (saves website ICP as-is)

2.4) **ICP Templates (archetype library)**
- The product includes a small archetype template library (start with 5–10 archetypes).
- Each template defines:
  - required questions
  - default ICP skeleton
  - rubric weighting adjustments
  - constraints/exclusions common to that archetype

2.5) **Specialist ICP Interview (structured, not open chat)**
- A guided wizard that asks only the questions needed to raise the ICP score.
- Output must conform to the same structured ICP schema.
- Produces:
  - “Improved ICP” version saved alongside the website ICP
  - a concise diff summary: what changed + why (for operator trust)

3) **Leads: Automated discovery + enrichment + verification (compliance-first)**
- ICP-driven lead discovery pipeline that produces **candidate companies + contacts** automatically.
- Lead sources are **licensed/authorized** connectors (no unauthorized scraping as a product feature).
- The system maintains **field-level provenance** (source + timestamp + confidence) for every lead attribute.
- Email sending requires either **verified** email status or an explicit campaign-level override.
- Dedupe rules: by email (case-insensitive) + optional domain + optional provider person/company IDs.

3.1) **Source connectors (MVP: implement 1 data provider end-to-end)**
- One licensed B2B data provider connector as the default lead engine (see Open Decisions).
- Optional: CRM import/sync connector (Phase 2 unless required).
- Optional: company discovery via compliant search API (Phase 2; contacts still from licensed provider).

3.2) **Candidate review + approval gate**
- Discovery results land in a **Candidates** stage (not immediately sendable).
- Users can filter, sample, and approve candidates into campaign leads.
- Approval gate is mandatory to prevent unintended outreach and to support compliance posture.

3.3) **Email verification + suppression safety**
- Integrated email verification provider; store result + timestamp.
- Auto-suppress: unsubscribes, hard bounces, complaints.
- Enforced: global do-not-contact list and per-workspace anti-abuse sending caps.

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
- ICP Quality Gate works end-to-end: score + missing-field checklist + improvement path; users can reach “High-quality ICP” tier for typical SaaS websites (via templates or Specialist interview).

## Key entities (plain English)
- **User**: authenticated operator.
- **Workspace**: container for data, settings, connected inboxes, sources.
- **Campaign**: outreach effort tied to an ICP, lead pipeline config, and sequence.
- **ICP Profile**: targeting rules + positioning notes used for discovery and drafting.
- **Source Connector**: a configured integration that can discover/enrich leads (licensed provider, CRM, etc.).
- **Source Run**: an execution of discovery/enrichment against an ICP with parameters (limits, filters).
- **Candidate**: a discovered company/contact **not yet approved for outreach**.
- **Lead**: an approved contact record eligible for sequencing (email required for email channel).
- **Company**: associated organization record (domain, name, site, enrichment fields).
- **Email Verification**: verification result record (status, provider, checked_at).
- **Sequence Step**: scheduled action (email step in MVP).
- **Message Template**: editable subject/body with variables.
- **Send Job**: queued unit of work to send a specific message to a lead.
- **Conversation**: thread of inbound/outbound messages for a lead.
- **Suppression**: do-not-contact entry (unsubscribed, bounced, complained, manual).
- **Provenance**: field-level source metadata (source, timestamp, confidence, allowed usage note).
- **ICP Version**: a saved version of an ICP for a campaign (website draft, improved, template-applied).
- **ICP Quality Score**: rubric score + tier + missing fields + explanations for a specific ICP version.
- **Product Archetype**: classified model/category used to select an ICP template.
- **ICP Template**: archetype-specific guided framework that produces a structured ICP.
- **ICP Interview Session**: a structured Q&A session used to improve an ICP to meet the quality bar.

## Key workflows (step-by-step)

### 1) Create campaign (wizard) — ICP → discovery → approve → sequence → launch
1. Create campaign → input website URL or paste product description.
2. AI generates ICP draft → user edits + confirms.
3. Configure **Lead Discovery**:
   - choose source connector(s)
   - define required fields (email required)
   - set filters (geo/industry/size/title) and max results
4. Run discovery → system produces **Candidates** with provenance + confidence.
5. Review candidates:
   - filter/sort, inspect samples, exclude risky segments
   - require email verification status (or set override)
6. Approve candidates into campaign leads.
7. Configure sequence (steps + timing) → AI drafts templates → user edits.
8. Deliverability checks run (required) → user resolves blockers.
9. Review screen: sample renders, daily volume plan, compliance footer, unsubscribe.
10. Launch → campaign schedules jobs into send queue.

### 2) Automated lead discovery pipeline (behind the scenes)
1. Create a Source Run from ICP + filters + limits.
2. Connector fetches company/contact candidates from licensed provider API.
3. Normalize and upsert Company/Contact records; write field provenance.
4. Verify emails (batch) → attach verification status + checked_at.
5. Apply suppressions and dedupe → mark remaining as Candidates (ready for review).

### 3) Safe sending loop
1. Scheduler selects due send jobs (respecting caps, ramp, quiet hours).
2. Send via Gmail/M365 API.
3. Record outcome; update lead status; log event.
4. On bounce/complaint → suppress lead and optionally pause campaign.

### 4) Reply handling
1. Inbound message detected (provider sync).
2. Thread matched to lead/campaign.
3. User sees reply in “Replies” inbox.
4. User categorizes; AI suggests response (optional); user sends or marks done.
5. Lead stage updates and stops future steps as configured.

## Open decisions (only truly blocking) + recommended default
1) **Default licensed lead data provider (MVP)**
- Options: Apollo / People Data Labs / Clearbit / others.
- **Default:** Choose ONE and implement fully end-to-end (search → enrich → rate limits → retries → pagination).
- Consequence: determines API shapes, cost model, and which fields are reliably available.

2) **Email verification provider**
- Options: NeverBounce / ZeroBounce / Kickbox / others.
- **Default:** Pick one; enforce “verified-only” sending by default with campaign override.

3) **Candidate approval strictness**
- Options: mandatory approval vs allow auto-approve.
- **Default:** Mandatory approval in MVP; consider “auto-approve with rules” later.

4) **Company discovery beyond the data provider**
- Options: provider-only vs add compliant web search API.
- **Default:** Provider-only for MVP to avoid ToS risk and reduce scope.

## Constraints
- **Hosting:** Vercel-first (Next.js).
- **Costs:** Minimize third-party paid dependencies; no built-in lead database.
- **Compliance:** enforce unsubscribe + suppression; user attests lawful basis; store minimal PII; delete/export support.
- **Outbound email safety:** conservative caps, throttling, ramp schedules; no “growth-hack” exploits.

## Assumptions/defaults made
- Lead discovery is implemented via **licensed/authorized** data sources (no unauthorized scraping as a core feature).
- MVP includes exactly **one** licensed provider connector implemented end-to-end.
- Contacts are not auto-contacted without a **human approval gate** (Candidates → Leads).
- Email sending defaults to **verified emails only**; users can override per campaign with explicit warnings.
- Email is the only automated channel in MVP; other channels can be “tasks” later.
