# DEPLOYMENT_ENVIRONMENTS.md
Purpose: Standardize a safe preview-vs-production workflow (Vercel-first; adapt when hosting constraints differ).

## A) Git + Vercel workflow (Option A) – adapt if another host is specified in ARCHITECTURE.md
- Production branch is `main` (or `master`).
- Production domain (real domain): https://www.leadbitz.com
- Non-production branches auto-deploy to Preview URLs.
- RULE: never develop directly on the production branch. Use `feature/*` branches + PRs.
- RULE: only merges to the production branch deploy to the real domain (Production).

## B) Environment variable policy
- Maintain separate values for Production, Preview, and local.
- Preview MUST NOT use production DB, live credentials, or real services.
- Typical env vars to duplicate (with staging/test values in Preview):
  - DATABASE_URL (and any direct/read-replica URLs)
  - Auth callback/base URLs (e.g., NEXTAUTH_URL), OAuth client IDs/secrets
  - Webhook secrets (test)
  - Email/SMTP provider keys (test), from-domain/from-address (staging)
  - Payments (test keys), webhook secrets, price IDs (test)
  - Storage buckets (staging), signing keys
  - Observability DSNs (staging)
  - Rate limit thresholds (often lower in Preview)

### B1) Finding and classifying database URLs (Supabase/Postgres)
- **Where to look**:
  - Supabase: Project → Settings → Database → Connection string.
  - Vercel: Project → Settings → Environment Variables (Preview vs Production).
  - Local: `.env.local` (or `.env`) in the repo.
- **How to classify**:
  - If a URL is used by Vercel **Production**, treat it as **live**.
  - If a URL is used by Vercel **Preview** or local `.env.local`, treat it as **staging/dev**.
- **Recommended setup**:
  - Keep **separate Supabase projects** for Preview/Dev and Production.
  - If only one project exists today, use it for **Dev/Preview only** until you’re ready to launch.
  - Create the **Production** project when you’re close to go-live, then copy its URL into **Production** env vars only.


## C) Testing policy for previews
- Use staging DB + test credentials only.
- Prefer protection on sensitive previews (team-only, auth gate, or password protection).
- Data hygiene:
  - test users only
  - resettable/ephemeral staging DB where feasible
  - deterministic seed script for fixtures

## D) “Worded commands” for Codex (operational)
Start feature safely (create branch from production branch):
- `git checkout main && git pull`
- `git checkout -b feature/<short-task-slug>`

Push branch to trigger Preview deployment:
- `git add -A`
- `git commit -m "feat: <short description>"`
- `git push -u origin feature/<short-task-slug>`

Open PR and locate Preview URL:
- Open PR in GitHub from `feature/<...>` → `main`
- In Vercel/GitHub checks, locate the Preview deployment URL and validate the task there.

Merge PR to deploy to Production:
- Ensure checks pass
- Merge PR into `main`
- Confirm Production deployment completed and smoke test the real domain

Discard branch (delete local + remote):
- `git checkout main`
- `git branch -d feature/<short-task-slug>`
- `git push origin --delete feature/<short-task-slug>`

Emergency rollback (revert last bad deploy):
- Identify the bad merge commit on `main`
- `git checkout main && git pull`
- `git revert <merge-commit-sha>`
- `git push`
- Confirm Production is restored

## E) Minimal project setup steps
- Connect GitHub repo to Vercel.
- Confirm Production branch setting in Vercel (main/master).
- Add environment variables for Preview and Production (distinct values).
- Optional: GitHub branch protection rules
  - require PRs
  - require status checks (lint/typecheck/tests/build)
  - restrict direct pushes to production branch

Note: When ARCHITECTURE.md specifies non-Vercel hosting (Railway, AWS, Fly.io, etc.), adapt preview/production separation, env var strategy, and deployment commands accordingly while preserving the same safety principles.
