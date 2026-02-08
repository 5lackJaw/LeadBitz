# APP_SHELL_AND_NAVIGATION_SPEC.md

## Authority + scope

- This document is an image-independent, deterministic text contract for the authenticated application shell. (Refs: SHELL-001, SHELL-026)
- This document’s ONLY source of authority is `docs/SHELL_SOURCE_REGISTRY.md`; no other documents, screenshots, or wireframes are requirements for this contract. (Refs: SHELL-026, SHELL-025)
- All authenticated `/app/*` routes render inside the canonical App Shell. (Refs: SHELL-001)

---

## Shell anatomy (regions/zones)

- The App Shell is composed of three required regions and one optional region. (Refs: SHELL-002)
- Required regions are: Primary Navigation (Left), Global Utility Bar (Top), Primary Content (Center). (Refs: SHELL-002, SHELL-003, SHELL-007, SHELL-010)
- Optional region is: Secondary Context Region (Right Rail). (Refs: SHELL-002, SHELL-012)

---

## Zone A — Primary Navigation Region (Left)

### A1. Purpose

- The Primary Navigation Region (Left) is a persistent vertical navigation area used for global application movement. (Refs: SHELL-003)

### A2. Internal structure (two layers)

- The left navigation uses two logical layers: an optional Navigation Rail and a required Navigation Sidebar. (Refs: SHELL-004, SHELL-005)

#### Layer 1 — Navigation Rail (Optional but Recommended)

- The Navigation Rail is a narrow vertical strip containing icon-only navigation shortcuts, module switching icons, and a collapse/expand control. (Refs: SHELL-004)
- The Navigation Rail’s purpose is fast mode switching independent of full navigation state. (Refs: SHELL-004)

#### Layer 2 — Navigation Sidebar (Required)

- The Navigation Sidebar is the full navigation surface and is required. (Refs: SHELL-005)

**Top section components (must be present):**
- Product mark + product name. (Refs: SHELL-005)
- Sidebar collapse control. (Refs: SHELL-005)

**Main navigation items (must include at minimum):**
- Dashboard. (Refs: SHELL-005, SHELL-018)
- Campaigns. (Refs: SHELL-005, SHELL-018)
- Leads. (Refs: SHELL-005, SHELL-018)
- Replies. (Refs: SHELL-005, SHELL-018)
- Settings. (Refs: SHELL-005, SHELL-018)

**Lower section components (must be present):**
- Support/help entry. (Refs: SHELL-005)
- Lower section is visually separated from primary navigation. (Refs: SHELL-005)

### Support / Help Entry

- Location: Sidebar lower section. (Refs: SHELL-005)
- Destination: External support/docs URL (configurable).
- Behavior: Opens in a new browser tab/window.
- Must remain separate from primary navigation grouping.

**Bottom identity tray components (must be present):**
- User avatar. (Refs: SHELL-005)
- User display name. (Refs: SHELL-005)
- Role/workspace indicator (if applicable). (Refs: SHELL-005)
- Account settings shortcut. (Refs: SHELL-005)

### A3. Sidebar collapse states + persistence

- The Sidebar supports an expanded state (labels + icons). (Refs: SHELL-006)
- The Sidebar supports a collapsed state (icons only). (Refs: SHELL-006)
- Sidebar collapse state persists across navigation. (Refs: SHELL-006)
- Sidebar collapse state persists across sessions. (Refs: SHELL-024)

---

## Zone B — Global Utility Bar (Top)

### B1. Purpose + location

- The Global Utility Bar (Top) is a persistent horizontal bar above page content. (Refs: SHELL-007)

### B2. Required components

- Left/center must contain a global search input (full app search). (Refs: SHELL-008)
- Right must contain a user context menu, avatar, and session actions (profile, logout, etc.). (Refs: SHELL-008)

### B3. Behavior constraints

- The Top bar remains visible across route transitions. (Refs: SHELL-009)
- The Top bar must not contain page-specific controls. (Refs: SHELL-009)

### B4. Dimensions (responsive)

- On `md+`, the shell uses a top bar height of 56px. (Refs: SHELL-030)

### B5. Top Utility Bar — Responsive behavior (SHELL-U-002)

- The Top Utility Bar remains visible on all breakpoints.
- On Mobile, the navigation drawer opens beneath the fixed Top Utility Bar.
- Top Utility Bar controls must collapse responsively to prevent overlap while keeping all actions accessible.

---

## Zone C — Primary Content Region (Center)

### C1. Purpose

- The Primary Content Region (Center) is the main workspace where route content renders. (Refs: SHELL-010)

### C2. Required capabilities

- The Primary Content Region supports full-height scroll. (Refs: SHELL-011)
- The Primary Content Region supports dashboard grid layouts. (Refs: SHELL-011)
- The Primary Content Region supports table-heavy operational screens. (Refs: SHELL-011)
- The Primary Content Region supports wizard flows. (Refs: SHELL-011)
- The Primary Content Region must be responsive. (Refs: SHELL-011)

### C3. Container width constraint

- Main container max width is 1440px, except tables may go full width. (Refs: SHELL-031)

---

## Zone D — Secondary Context Region (Right Rail) (Optional)

### D1. Purpose + allowed use

- The Right Rail is used only when a screen benefits from fast contextual actions. (Refs: SHELL-012)

### D2. Forbidden content

- The Right Rail must never contain primary workflow steps. (Refs: SHELL-013)

### D3. Responsive behavior

- The Right Rail must collapse below primary content on smaller screens. (Refs: SHELL-013, SHELL-023)

### D4. Right Rail — Tablet interaction (SHELL-U-003)

- Tablet default: CLOSED.
- Open/close control MAY be provided at the screen level (for example, primary content header area) but MUST NOT be added to the global Top Utility Bar.
- When open on Tablet, the Right Rail renders as an OVERLAY panel (does not reflow primary content).
- Dismissal: close button + Esc. Outside click closes when it is non-destructive.
- Right Rail remains non-primary and must not be required for primary task completion. (Refs: SHELL-013)

---

## Navigation model (global vs contextual)

### Global navigation

- Global Navigation (Primary) lives in the Sidebar. (Refs: SHELL-016)
- Global Navigation represents top-level product domains. (Refs: SHELL-017)

### Contextual navigation

- Contextual Navigation (Secondary) lives inside the Primary Content Region. (Refs: SHELL-019)

### Priority rules

- Global Navigation changes domain context. (Refs: SHELL-020)
- Contextual Navigation changes workflow stage. (Refs: SHELL-020)

---

## Responsiveness contract

### Desktop

- On Desktop, the full App Shell is active (Rail, Sidebar, Top bar, optional Right Rail). (Refs: SHELL-021)
- On `md+`, the left nav is 264px and is collapsible to 80px, with a top bar of 56px. (Refs: SHELL-030)

### Tablet

- On Tablet, the Sidebar collapses by default. (Refs: SHELL-022)
- On Tablet, the Right Rail becomes a collapsible panel. (Refs: SHELL-022)

### Mobile

- On Mobile, navigation becomes a drawer. (Refs: SHELL-023)
- On `xs`, navigation uses a hamburger drawer. (Refs: SHELL-030)
- On Mobile, right rail content moves below primary content. (Refs: SHELL-023)
- On Mobile, use a hamburger drawer and do not use bottom tabs. (Refs: SHELL-029)
- Mobile-first: tables become cards under ~768px; wizard stepper collapses. (Refs: SHELL-033)

---

## Persistence rules

- The following must persist across sessions: Sidebar collapse state, last visited primary section, and user workspace context. (Refs: SHELL-024)

---

## Extensibility rules

- New sections must fit into the existing navigation hierarchy. (Refs: SHELL-025)
- New sections must not introduce new global layout regions. (Refs: SHELL-025)
- New sections must not change shell anatomy. (Refs: SHELL-025)

---

## Navigation interaction + state styling (global)

- Navigation should be persistent, low-noise, with clear active state. (Refs: SHELL-034)

### Active state

- Active indicator uses a single method only (recommended: left bar). (Refs: SHELL-027)
- Do not use multiple simultaneous nav highlight methods; choose one (bar OR bg OR underline). (Refs: SHELL-037)
- Active item uses an accent indicator (left bar or underline) using the accent-primary token. (Refs: SHELL-035)

### Hover state

- Hover uses subtle background + text to primary. (Refs: SHELL-028)
- Hover: text shifts to primary; background subtle. (Refs: SHELL-036)

---

## Motion constraint (shell panels)

- Panel expand/collapse uses `--motion-medium: 180ms;`. (Refs: SHELL-038)

---

## Do / Don’t (implementation discipline)

### Do

- Do render all authenticated `/app/*` routes inside the canonical App Shell. (Refs: SHELL-001)
- Do keep the Top bar visible across route transitions. (Refs: SHELL-009)
- Do keep page-specific controls out of the Top bar. (Refs: SHELL-009)
- Do preserve the Shell anatomy: left navigation, top bar, content, optional right rail. (Refs: SHELL-002, SHELL-025)

### Don’t

- Don’t place primary workflow steps in the Right Rail. (Refs: SHELL-013)
- Don’t introduce new global layout regions or change shell anatomy when adding sections. (Refs: SHELL-025)
- Don’t use bottom tabs for Mobile navigation. (Refs: SHELL-029)
- Don’t treat screenshots/wireframes as requirements for the shell/nav contract; follow the canonical shell/navigation specification rules as the governing contract. (Refs: SHELL-026, SHELL-025)

---

## Resolved Decision References

- Global search behavior beyond placement (SHELL-U-001) is defined in `docs/UX_SPEC.md` under "Global Search — Behavior" and in `docs/SCREEN_BY_SCREEN_UX_SPEC.md` under "Global Search — Interaction Contract".
- Top bar Tablet/Mobile behavior (SHELL-U-002) is defined in this document and mirrored in `docs/UI_SPEC.md` and `docs/SCREEN_BY_SCREEN_UX_SPEC.md`.
- Right-rail Tablet interaction specifics (SHELL-U-003) are defined in this document and mirrored in `docs/UI_SPEC.md` and `docs/SCREEN_BY_SCREEN_UX_SPEC.md`.
