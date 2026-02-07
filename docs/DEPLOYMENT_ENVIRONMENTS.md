# DEPLOYMENT_ENVIRONMENTS.md
Purpose: enforce safe branch-to-environment deployment behavior (Vercel + GitHub), including fork workflows, preview validation, and production go-live/rollback.

## A) Authoritative branch -> environment mapping
- `feature/*`:
  - Deploys to Vercel Preview only.
  - Pull request base must be `release`.
  - Must never target production.
- `release`:
  - Deploys to Vercel Preview only (integration/staging preview).
  - Integration branch for MVP work.
- `main`:
  - Vercel Production branch.
  - Any merge to `main` is a live production deployment.

## B) Non-negotiable guardrails
- Never develop directly on `main`.
- Never open feature PRs to `main`.
- Treat PR base `main` as production promotion only.
- Do not merge to `main` unless explicit production sign-off is given in the current session.
- Keep production credentials and database isolated from preview/development.

## C) Required PR validation commands (run before every merge)
1. Confirm local branch:
   - `git branch --show-current`
2. Confirm PR routing:
   - `gh pr view <PR_NUMBER> --json baseRefName,headRefName,state,url`
3. Confirm checks:
   - `gh pr checks <PR_NUMBER>`
4. Confirm local verification:
   - `npm run verify`
5. Decision rule:
   - For normal development, PR base must be `release`.
   - If PR base is `main`, stop unless explicitly running a production promotion.

## D) Standard workflow (same-repo)
### D1) Start new feature safely
- `git checkout release`
- `git pull origin release`
- `git checkout -b feature/<short-task-slug>`

### D2) Push for preview deployment
- `git add -A`
- `git commit -m "feat: <short description>"`
- `git push -u origin feature/<short-task-slug>`
- Open PR: `feature/<short-task-slug>` -> `release`
- Validate the Vercel Preview URL from PR checks before merging.

### D3) Merge preview-tested work
- Merge PR into `release` after checks pass.
- Confirm `release` preview deployment succeeds.
- Perform smoke tests on preview URL.

### D4) Production promotion (post-MVP)
- Open PR: `release` -> `main`.
- Treat this PR as a release candidate, not a normal feature PR.
- Merge only after go-live checklist passes (section H).

## E) Fork workflow contract (required when using forks)
### E1) One-time setup
- `git remote add upstream https://github.com/<ORG_OR_USER>/<REPO>.git`
- `git fetch upstream`

### E2) Sync fork before feature work
- `git checkout release`
- `git merge --ff-only upstream/release`
- `git push origin release`

### E3) Feature branch from fork
- `git checkout -b feature/<short-task-slug>`
- `git push -u origin feature/<short-task-slug>`
- Open PR: `fork:feature/<short-task-slug>` -> `upstream:release`

### E4) Prohibited fork action
- Never open `fork:*` -> `upstream:main` for MVP work.

## F) Environment variable separation policy
- Keep local, Preview, and Production values separate.
- Preview must never use production DB credentials, OAuth apps, billing keys, or webhook secrets.
- Recommended environment classes:
  - Local: `.env.local` (developer machine only)
  - Preview: Vercel Preview env vars
  - Production: Vercel Production env vars

### F1) Database URL classification
- If used by Vercel Production: classify as live production.
- If used by Vercel Preview or local `.env.local`: classify as non-production.
- Recommended: separate Neon project or branch for production database.

## G) Preview validation policy
- Use test credentials and non-production data only.
- Validate only from deployed preview URL (not only localhost).
- Minimum smoke checks for each merged PR:
  - `/` loads
  - auth flow succeeds
  - `/app` loads for test operator
  - changed feature path works
  - no server errors in Vercel logs

## H) Production go-live runbook
### H1) One-time production readiness
1. Provision production database separate from preview/dev.
2. Configure Vercel Production env vars:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - OAuth client IDs/secrets for production apps
   - provider keys (mail, billing, ai, storage, etc.)
3. Configure auth trusted domains/callback URLs for production domain.
4. Confirm Vercel Production Branch is `main`.

### H2) Per-release promotion checklist
1. Freeze `release` for QA.
2. Run:
   - `npm ci`
   - `npm run verify`
3. Validate `release` preview smoke tests.
4. Open PR `release` -> `main`.
5. Verify PR scope is release-only and expected.
6. Merge after explicit sign-off.
7. Confirm Vercel production deployment reaches `Ready`.
8. Run production smoke tests:
   - landing page
   - login callback
   - `/app` for known test user
   - critical API checks
   - no server errors in logs

### H3) Production migration policy
- Preferred: run migration deploy in release/pipeline:
  - `npm run db:migrate:deploy`
- If run manually:
  - use production `DATABASE_URL` only
  - record migration id and timestamp in release notes

## I) Emergency rollback
1. Identify bad merge commit on `main`.
2. `git checkout main`
3. `git pull origin main`
4. `git revert <merge_commit_sha>`
5. `git push origin main`
6. Confirm production redeploy and smoke-test again.

## J) Prompt contract for AI/codex sessions
- Preview-only prompt:
  - "Work on a feature branch, open PR into `release`, and do not target `main`."
- Production-promotion prompt:
  - "Promote `release` to `main` only after go-live checklist; report PASS/FAIL for each checklist item."

## K) Minimal host setup checks
- GitHub repo connected to Vercel.
- Vercel Production Branch set to `main`.
- Branch protections enabled on `release` and `main`.
- Preview/Production environment variables are distinct.

Note: if hosting changes from Vercel, keep the same safety model: non-production integration branch, explicit production promotion branch, strict env separation, and rollback path.
