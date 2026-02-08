# AGENTS.md --- Canonical Development Agent Contract

## Purpose

This document defines the behavioral, architectural, and documentation
rules that all development agents must follow when working in this
repository.

Agents must prioritize: 1. Product correctness 2. Requirement
traceability 3. Implementation safety 4. Long-term maintainability 5.
Minimal ambiguity

------------------------------------------------------------------------

# 1. Canonical Documentation Authority (MANDATORY)

Agents MUST treat documentation using the following authority hierarchy.

---

## Tier 0 — Governance Index

- `docs/CANONICAL_SOURCES.md` — the authority map itself
- `AGENTS.md` — agent operating rules for this repo

These do not define product behavior; they define **how work is done**.

---

## Tier 1 — Canonical Product Truth

Defines **WHAT the product is** and the invariants it must satisfy.

- `docs/PRODUCT_BRIEF.md`
  - High-level product definition, positioning, and scope boundaries.

- `docs/UX_SPEC.md`
  - Canonical UX rules, user journeys, non-negotiable behavior, and product mental model.

- `docs/UI_SPEC.md`
  - Canonical UI component rules, layout conventions, and interaction patterns (as text).

- `docs/CANONICAL_VISUAL_BRAND_SPECIFICATION.md`
  - Visual tokens, theming, typography, spacing, and brand constraints.

- `docs/ARCHITECTURE.md`
  - Canonical domain model, data invariants, security boundaries, and system-level constraints that UI/UX must respect.

- `docs/SOURCE_REGISTRY.md`
  - Lossless extracted requirements with IDs + traceability. (Prevents silent omission.)

- `docs/COVERAGE_MATRIX.md`
  - Requirement → screen mapping proof. (Prevents drift / missing coverage.)

**Conflict rule:** If any Tier 2/3 document contradicts Tier 1, Tier 1 wins.

---

## Tier 2 — Derived Implementation Specs

Defines **HOW Tier 1 is expressed in the UI**, as an implementation-friendly compilation.

- `docs/SCREEN_BY_SCREEN_UX_SPEC.md`
  - Screen contracts (structure/states/actions), IA route mapping, navigation rules — compiled from Tier 1.

- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md` *(if present)*
  - Canonical app shell zoning and navigation chrome contract (image-independent).

**Conflict rule:** If Tier 2 conflicts with Tier 1, update Tier 2 (do not “patch around” it in code).

---

## Tier 3 — Execution & Operations Docs

Defines **HOW work is executed** and deployed; not product requirements.

- `docs/IMPLEMENTATION_CHECKLIST.md`
  - Work plan / sequencing. Agents implement exactly one unchecked item per PR.

- `docs/SOFTWARE_DOCUMENTATION.md`
  - Living operational notes: setup, env vars, runbooks, gotchas, testing commands, decisions.

- `docs/DEPLOYMENT_ENVIRONMENTS.md`
  - Environment setup, branch → environment mapping, deployment policies.

------------------------------------------------------------------------

# 2. Core Development Rule

Before implementing ANY feature:

1.  Read ALL Tier 1 documents
2.  Read relevant Tier 2 documents
3.  Confirm no conflicts exist
4.  If conflict exists → STOP → Update documentation first

------------------------------------------------------------------------

# 3. Requirement Traceability Rules

Agents MUST:

-   Never invent requirements
-   Never infer behavior not present in documentation
-   Never implement UI or logic based on assumptions

If behavior is missing, mark exactly:

\[UNSPECIFIED --- REQUIRES PRODUCT DECISION\]

If implementing UI: - Must map implementation to Requirement IDs when
present

------------------------------------------------------------------------

# 4. Frontend Implementation Contract

For ALL frontend work:

Behavior → SOURCE_REGISTRY + SCREEN_BY_SCREEN_UX_SPEC\
Layout → APP_SHELL_AND_NAVIGATION_SPEC (if present)\
Visuals → UI_SPEC + CANONICAL_VISUAL_BRAND_SPECIFICATION

Agents MUST NOT: - Implement layout from screenshots or images - Infer
layout from generic SaaS patterns - Implement styling outside token
system

Wireframes are never authoritative implementation sources.

------------------------------------------------------------------------

# 5. Rules of Engagement

### Documentation Reading Requirements

Before starting implementation work, agents MUST:

1. Always read:

   * `docs/CANONICAL_SOURCES.md`
   * `AGENTS.md`

2. Then read the **minimum set of documentation required for the selected task**, based on the canonical documentation hierarchy.

Agents MUST NOT claim to have read the entire `/docs` directory when the task only requires a subset.

Agents MUST list in PR description:

* Which documents were used
* Which sections were used (when applicable)
* Which requirement IDs were implemented or affected (if applicable)

---

### Canonical Authority Compliance

* Follow the canonical documentation hierarchy defined in `CANONICAL_SOURCES.md`.
* Tier 1 documentation defines product truth and must never be overridden.
* Tier 2 documentation defines compiled implementation structure and must match Tier 1.
* Tier 3 documentation defines execution and operational process.

If documentation conflicts are detected:

* STOP implementation
* Propose documentation update first

---

### Frontend Implementation Discipline

Agents MUST:

* Implement design, layout, and behavior together using:

  * `UX_SPEC.md`
  * `UI_SPEC.md`
  * `CANONICAL_VISUAL_BRAND_SPECIFICATION.md`
  * `SCREEN_BY_SCREEN_UX_SPEC.md`
  * `APP_SHELL_AND_NAVIGATION_SPEC.md` (if present)

Agents MUST NOT:

* Implement functionality first and “style later”
* Implement layout from screenshots or images
* Infer UX from generic SaaS conventions
* Implement styling outside token system

---

### Execution Discipline

Agents MUST:

* Implement the next logical unchecked task from `IMPLEMENTATION_CHECKLIST.md` per PR
* Keep changes minimal and scoped to the selected task
* Avoid drive-by refactors
* Prefer proven, stable patterns over clever or experimental approaches
* Follow stack idioms and framework best practices

---

### Requirement Integrity

Agents MUST:

* Never invent requirements
* Never infer undocumented behavior
* Never silently fill specification gaps

If behavior is missing, mark exactly:

```
[UNSPECIFIED — REQUIRES PRODUCT DECISION]
```

Then:

* Update canonical documentation, OR
* Document clarification in `SOFTWARE_DOCUMENTATION.md`

---

### Change Scope Control

If implementation reveals additional required work:

* Do NOT expand scope silently
* Add a new unchecked checklist item
* Document rationale

---

### Implementation Safety Principles

Agents SHOULD:

* Minimize blast radius of changes
* Prefer deterministic implementations over heuristic ones
* Preserve requirement traceability
* Preserve spec → implementation mapping integrity

------------------------------------------------------------------------

# 6. Software Documentation Maintenance

SOFTWARE_DOCUMENTATION.md is the operational living reference.

Update SOFTWARE_DOCUMENTATION.md when: - A checklist phase completes -
Routes change - Data models change - Environment variables change -
Background jobs change - Permissions change - External integrations
change - Core UX behavior changes

Document: - Testing procedures - Rollback procedures - Known operational
edge cases - Reproduction steps for issues

Agents may create helper files if required (e.g., .env, .gitignore,
config files).

------------------------------------------------------------------------

# 7. Task Completion Protocol

For the selected task:

1.  Confirm exact checklist item being implemented
2.  Implement minimum code required for acceptance criteria
3.  Add or update tests
4.  Run relevant checks locally:
    -   Typecheck
    -   Lint
    -   Tests
    -   Build (if applicable)
5.  Update SOFTWARE_DOCUMENTATION.md if required
6.  Mark checklist item complete
7.  Add implementation note including:
    -   Date
    -   What changed
    -   Where changed
    -   Follow-up items
8.  Provide concise change summary
9.  Document risks and assumptions

------------------------------------------------------------------------

# 8. Coordination & Communication

Agents must communicate:

-   What changed
-   Where it changed
-   Why it changed

If scope creep is detected: - Stop - Propose new checklist item

When choosing between implementation options, prioritize: 1. Reduced
ambiguity 2. Improved safety 3. Alignment with canonical docs 4.
Requirement traceability preservation

Record meaningful technical decisions in SOFTWARE_DOCUMENTATION.md.

------------------------------------------------------------------------

# 9. Security & Safety Defaults

Always:

-   Validate all inputs
-   Sanitize external input
-   Enforce least privilege access
-   Prevent data leakage between workspaces
-   Never log secrets or PII
-   Treat external input as hostile

------------------------------------------------------------------------

# 10. Deployment Guardrails

Default PR base branch → release

Never target main unless explicitly instructed in same session.

Before opening or merging PR: - Verify current branch: git branch
--show-current

-   Verify PR target: gh pr view --json baseRefName,headRefName,state

For fork workflows: - PR from fork → upstream release only - Never PR
fork → upstream main

------------------------------------------------------------------------

### 10.1 Mandatory Git + PR + Vercel Runbook

Agents MUST follow this execution flow unless the user explicitly overrides it in the same session.

1. Branch to environment mapping
- `feature/*` -> Vercel Preview only
- `release` -> Vercel Preview integration branch
- `main` -> Vercel Production only
- During MVP, never target `main` unless the user explicitly asks for production promotion.

2. Start each task with Git checks
- Run `git branch --show-current`
- Run `git status --short`
- Use a feature branch for implementation:
  - `git checkout -b feature/<short-task-slug>`

3. Commit discipline
- Keep each PR scoped to one checklist item.
- Use clear commit messages:
  - `feat(phaseX): ...`
  - `fix(<area>): ...`
  - `docs(phaseX): ...`
- Do not include unrelated files in the same commit.

4. PR discipline (upstream repo)
- Open PRs to `release` for MVP work:
  - `gh pr create --base release --head feature/<branch> ...`
- Verify PR target before merge:
  - `gh pr view <PR_NUMBER> --json baseRefName,headRefName,state,url`

5. PR discipline (fork workflow)
- Head must be `fork:feature/*`, base must be `upstream/release`.
- Never open fork PRs into `upstream/main` during MVP.

6. Required checks before merge
- Local checks for implementation tasks:
  - `npm run lint`
  - `npm run test:integration` (or task-relevant subset)
  - `npm run build`
- Remote checks:
  - `gh pr checks <PR_NUMBER>`
  - Required: `verify` pass + Vercel Preview deployment complete.

7. Merge and sync workflow
- Merge with squash after checks pass:
  - `gh pr merge <PR_NUMBER> --squash --delete-branch`
- Sync local integration branch:
  - `git checkout release`
  - `git pull --ff-only origin release`

8. Production promotion workflow
- Production promotions are dedicated PR events from `release` to `main`.
- Do not use direct pushes or ad-hoc production deploy commands as a substitute.
- Treat any `main` merge as a production event requiring explicit user instruction.

9. Vercel safety rules
- Validate new work on Preview URLs, not production domain.
- Keep production gating controls (for example `LIVE_APP_ENABLED`) in effect until explicit go-live approval.
- A successful Preview deploy is not approval to promote to production.

10. Failure handling
- If branch protection blocks pushes/merges (for example GH006), continue through PR workflow; do not bypass protections.
- If base/head is wrong, fix PR targeting before merge.
- If checks fail, push fixes to the same feature branch and re-run checks.

------------------------------------------------------------------------

# 11. Scope Change Protocol

If scope must expand: - Do NOT expand current task - Add new unchecked
checklist item

------------------------------------------------------------------------

# 12. Absolute Prohibitions

Agents MUST NOT:

-   Invent UX flows
-   Add UI elements without requirements
-   Skip documentation updates when behavior changes
-   Replace canonical docs with generated docs
-   Implement features outside checklist workflow
-   Introduce unapproved architecture patterns

------------------------------------------------------------------------

# 13. Persistence Rules

Agents must preserve:

-   Requirement traceability
-   Documentation authority hierarchy
-   Spec → Implementation mapping integrity

------------------------------------------------------------------------

# End of AGENTS.md
