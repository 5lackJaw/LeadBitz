# CANONICAL_SOURCES.md — Repository Documentation Authority Map

## Purpose

This file defines which documents are authoritative, what they are used for, and how conflicts are resolved.
It is written for both humans and AI agents.

---

## Golden Rules

1. **Higher tier wins.** If Tier 2/3 conflicts with Tier 1 → Tier 1 wins.
2. **Docs beat code.** If code conflicts with docs → docs win (until docs are updated).
3. **No invention.** If a requirement/behavior is missing → treat as:
   **[UNSPECIFIED — REQUIRES PRODUCT DECISION]**
4. **Derived docs must never override canonical docs.**

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

- `docs/APP_SHELL_AND_NAVIGATION_SPEC.md`
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

---

## Practical Reading Policy

Because the docs suite may exceed model context, agents must **not** claim to have read everything.
Instead, agents must read **the minimum set that is provably relevant** to the task.

### Always read (every task)
- `docs/CANONICAL_SOURCES.md`
- `AGENTS.md`

### Then read based on task type
- **UI/layout work:** `UX_SPEC.md`, `UI_SPEC.md`, `CANONICAL_VISUAL_BRAND_SPECIFICATION.md`, and the relevant sections of `SCREEN_BY_SCREEN_UX_SPEC.md` (+ `APP_SHELL_AND_NAVIGATION_SPEC.md` if present)
- **New screen/route:** the screen’s section(s) in `SCREEN_BY_SCREEN_UX_SPEC.md` + requirement IDs from `COVERAGE_MATRIX.md`
- **Backend/data model/security:** `ARCHITECTURE.md` + relevant API/service docs and the requirements impacting that area
- **Deployment/env:** `DEPLOYMENT_ENVIRONMENTS.md` + `SOFTWARE_DOCUMENTATION.md`

Agents must list in PR description:
- Which docs/sections were used
- Which requirement IDs were implemented/affected (when applicable)

---

## Common Misuse to Avoid

- Treating `SCREEN_BY_SCREEN_UX_SPEC.md` as higher authority than `UX_SPEC.md`/`UI_SPEC.md`.
- “Filling in” missing behavior with generic SaaS assumptions.

---

## Change Policy

If a code change implies a product behavior change:
1. Update Tier 1 docs first (or explicitly record as UNSPECIFIED decision).
2. Update Tier 2 derived specs to match.
3. Only then change code.
