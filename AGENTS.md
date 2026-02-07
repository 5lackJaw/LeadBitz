# Agents.md

## Rules of Engagement
- Read all of the files inside /docs before you start building.
- For all design-related work — including UI components, layouts, styling, theming, visual changes, screens, user flows, interactions, copy, and information architecture — you must follow: docs/UX_SPEC.md, docs/UI_SPEC.md

- For all visual and brand-related work — including design tokens, styling systems, theming rules, and component visual appearance — you must follow: docs/CANONICAL_VISUAL_BRAND_SPECIFICATION.md

- Any new frontend feature or UI implementation that requires styling or design must be built in full compliance with the specifications above.
- Do not implement frontend functionality first and apply design or styling later.
- Implement the next logical unchecked task from IMPLEMENTATION_CHECKLIST.md per PR.
- Do not invent requirements. If a task is ambiguous, resolve it by updating docs first (as part of that single task) or add a small clarification note to SOFTWARE_DOCUMENTATION.md.
- Keep changes minimal and scoped to the selected task. No drive-by refactors.
- Prefer boring, proven patterns over cleverness. Follow the chosen stack's idiomatic conventions.
- Security defaults: never log secrets/PII; validate inputs; least privilege; treat external input as hostile.
- If you need to change scope, add a new unchecked checkbox to IMPLEMENTATION_CHECKLIST.md instead of expanding the current task.
- After implementing something, run the appropriate tests.
- If user testing is prudent, explicitly instruct the user to perform it.
- Deployment guardrail: default all feature work to PR base `release`; never target `main` unless the user explicitly requests production promotion in that same session.
- Deployment guardrail: before opening/merging any PR, verify branch/base with `git branch --show-current`, `gh pr view --json baseRefName,headRefName,state`, and ensure base is `release` for MVP work.
- Fork guardrail: if work is done from a fork, open PR from `fork:feature/*` into upstream `release` only; never from fork directly into upstream `main`.

## Software Documentation Maintenance
- SOFTWARE_DOCUMENTATION.md is the living source of truth.
- Update SOFTWARE_DOCUMENTATION.md when:
  - A phase completes (required by checklist).
  - You introduce or change: routes, data model, env vars, background jobs, permissions, external integrations, or key UX behavior.
- Document operational “gotchas” (how to test, how to rollback, how to reproduce).
- Create and maintain appropriate implicit helper files if they are not explicitly requested in the development documentation. (examples are files like .env, .env.local, .gitignore etc.)

## Task Completion Protocol
For the single task you selected:
1) Confirm the exact checkbox item you are implementing (copy its text into PR description).
2) Implement the minimum code to satisfy acceptance criteria.
3) Add/adjust tests appropriate to the change.
4) Run relevant checks locally (typecheck/lint/tests/build where applicable).
5) Update SOFTWARE_DOCUMENTATION.md if the task or phase requires it.
6) Check off the checkbox and add a brief implementation note beneath it: Date (YYYY-MM-DD), what changed, where, and any follow-ups.
7) Provide a concise change summary and list any risks/assumptions.

## Coordination & Communication
- Communicate in concrete terms: what you changed, where, and why.
- If you detect scope creep, stop and suggest a new checklist item instead of expanding scope.
- If you must choose between options, pick the one that:
  1) reduces future ambiguity,
  2) improves safety,
  3) matches existing patterns.
- Keep a running record of meaningful decisions in SOFTWARE_DOCUMENTATION.md.
