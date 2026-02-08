# SHELL_SOURCE_REGISTRY.md

## SHELL-001

**Requirement (verbatim):**

```
All authenticated `/app/*` routes must render inside the canonical App Shell.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1. App Shell — Global Layout Model`

---

## SHELL-002

**Requirement (verbatim):**

```
The App Shell is composed of **three required regions** and **one optional region**.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1. App Shell — Global Layout Model`

---

## SHELL-003

**Requirement (verbatim):**

```
### A. Primary Navigation Region (Left)

Persistent vertical navigation area used for global application movement.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `A. Primary Navigation Region (Left)`

---

## SHELL-004

**Requirement (verbatim):**

```
Two logical layers:

##### Layer 1 — Navigation Rail (Optional but Recommended)

Narrow vertical strip containing:

* Icon-only navigation shortcuts
* Module switching icons
* Collapse / expand control

Purpose:
Fast mode switching independent of full navigation state.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `A. Primary Navigation Region (Left)` → `Structure`

---

## SHELL-005

**Requirement (verbatim):**

```
##### Layer 2 — Navigation Sidebar (Required)

Full navigation surface containing:

Top Section:

* Product mark + product name
* Sidebar collapse control

Main Navigation:
Must include at minimum:

* Dashboard
* Campaigns
* Leads
* Replies
* Settings

Lower Section:

* Support / help entry
* Visually separated from primary navigation

Bottom Identity Tray:

* User avatar
* User display name
* Role / workspace indicator (if applicable)
* Account settings shortcut
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `A. Primary Navigation Region (Left)` → `Layer 2 — Navigation Sidebar (Required)`

---

## SHELL-006

**Requirement (verbatim):**

```
Sidebar must support:

* Expanded state (labels + icons)
* Collapsed state (icons only)

Collapse state must persist across navigation.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `A. Primary Navigation Region (Left)` → `Behavior Rules`

---

## SHELL-007

**Requirement (verbatim):**

```
### B. Global Utility Bar (Top)

Persistent horizontal bar above page content.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `B. Global Utility Bar (Top)`

---

## SHELL-008

**Requirement (verbatim):**

```
#### Must Contain

Left / Center:

* Global search input (full app search)

Right:

* User context menu
* Avatar
* Session actions (profile, logout, etc.)
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `B. Global Utility Bar (Top)` → `Must Contain`

---

## SHELL-009

**Requirement (verbatim):**

```
#### Behavior Rules

Must remain visible across route transitions.

Must not contain page-specific controls.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `B. Global Utility Bar (Top)` → `Behavior Rules`

---

## SHELL-010

**Requirement (verbatim):**

```
### C. Primary Content Region (Center)

Main workspace where route content renders.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `C. Primary Content Region (Center)`

---

## SHELL-011

**Requirement (verbatim):**

```
#### Rules

Must:

* Support full-height scroll
* Support dashboard grid layouts
* Support table-heavy operational screens
* Support wizard flows

Must be responsive.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.1 Required Regions` → `C. Primary Content Region (Center)` → `Rules`

---

## SHELL-012

**Requirement (verbatim):**

```
### Secondary Context Region (Right Rail)

Used only when screen benefits from fast contextual actions.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.2 Optional Region` → `Secondary Context Region (Right Rail)`

---

## SHELL-013

**Requirement (verbatim):**

```
#### Rules

Must never contain primary workflow steps.

Must collapse below primary content on smaller screens.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `1.2 Optional Region` → `Secondary Context Region (Right Rail)` → `Rules`

---

## SHELL-014

**Requirement (verbatim):**

```
Dashboard screens should follow **Operational Priority Layout**.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `2. Dashboard Layout Contract`

---

## SHELL-015

**Requirement (verbatim):**

```
Two-column layout:

### Left Column (Primary Operational Surface)

Used for:

* Tables
* Campaign lists
* Lead lists
* Workflow progress surfaces
* Operational health detail

Width Priority:
Primary (≈ 60–70%)

---

### Right Column (Context + Acceleration Surface)

Used for:

* KPI summary tiles
* Activity charts
* Quick action shortcuts
* Secondary configuration entry points

Width Priority:
Secondary (≈ 30–40%)
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `2.1 Default Dashboard Grid`

---

## SHELL-016

**Requirement (verbatim):**

```
## 3.1 Global Navigation (Primary)

Lives in Sidebar.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `3. Navigation Model` → `3.1 Global Navigation (Primary)`

---

## SHELL-017

**Requirement (verbatim):**

```
Represents:
Top-level product domains.

Example Pattern:

```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `3. Navigation Model` → `3.1 Global Navigation (Primary)`

---

## SHELL-018

**Requirement (verbatim):**

```
Dashboard
Campaigns
Leads
Replies
Settings
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `3. Navigation Model` → `3.1 Global Navigation (Primary)` → `Example Pattern`

---

## SHELL-019

**Requirement (verbatim):**

```
## 3.2 Contextual Navigation (Secondary)

Lives inside Primary Content Region.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `3. Navigation Model` → `3.2 Contextual Navigation (Secondary)`

---

## SHELL-020

**Requirement (verbatim):**

```
## 3.3 Navigation Priority Rules

Global Navigation changes domain context.

Contextual Navigation changes workflow stage.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `3. Navigation Model` → `3.3 Navigation Priority Rules`

---

## SHELL-021

**Requirement (verbatim):**

```
## Desktop

Full App Shell active:

* Rail
* Sidebar
* Top bar
* Optional right rail
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `5. Responsiveness Contract` → `Desktop`

---

## SHELL-022

**Requirement (verbatim):**

```
## Tablet

Sidebar collapses by default.
Right rail becomes collapsible panel.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `5. Responsiveness Contract` → `Tablet`

---

## SHELL-023

**Requirement (verbatim):**

```
## Mobile

Navigation becomes drawer.
Right rail content moves below primary content.
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `5. Responsiveness Contract` → `Mobile`

---

## SHELL-024

**Requirement (verbatim):**

```
# 6. Persistence Rules

The following must persist across sessions:

* Sidebar collapse state
* Last visited primary section
* User workspace context
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `6. Persistence Rules`

---

## SHELL-025

**Requirement (verbatim):**

```
New sections must:

* Fit into existing navigation hierarchy
* Not introduce new global layout regions
* Not change shell anatomy
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `Canonical App Shell & Navigation Specification` → `9. Extensibility Rules`

---

## SHELL-026

**Requirement (verbatim):**

```
- Global app shell must follow **Canonical App Shell & Navigation Specification** (Sections 1–6).
```

**Citations:**
- Source: `SCREEN_BY_SCREEN_UX_SPEC.md` → `2) NAVIGATION MAP` → `2.1 Global navigation structure`

---

## SHELL-027

**Requirement (verbatim):**

```
- Active indicator: single method only (recommended: left bar in `--ui-action-primary`)
```

**Citations:**
- Source: `UI_SPEC.md` → `11. Navigation`
- SOURCE_REGISTRY ID: `UI-R-388`

---

## SHELL-028

**Requirement (verbatim):**

```
- Hover: subtle background + text to primary
```

**Citations:**
- Source: `UI_SPEC.md` → `11. Navigation`
- SOURCE_REGISTRY ID: `UI-R-389`

---

## SHELL-029

**Requirement (verbatim):**

```
Mobile: hamburger drawer; no bottom tabs.
```

**Citations:**
- Source: `UI_SPEC.md` → `11. Navigation`

---

## SHELL-030

**Requirement (verbatim):**

```
App shell:
- md+: left nav 264px (collapsible to 80px) + top bar 56px
- xs: hamburger drawer nav
```

**Citations:**
- Source: `UI_SPEC.md` → `14. Responsive Layout System` → `App shell`
- SOURCE_REGISTRY IDs: `UI-R-404`, `UI-R-405`

---

## SHELL-031

**Requirement (verbatim):**

```
Main container:
- max width 1440px, except tables may go full width.
```

**Citations:**
- Source: `UI_SPEC.md` → `14. Responsive Layout System` → `Main container`
- SOURCE_REGISTRY ID: `DATA-046`

---

## SHELL-032

**Requirement (verbatim):**

```
- `/app` App shell (auth required)
```

**Citations:**
- Source: `UX_SPEC.md` → `Information architecture (routes/sections)`
- SOURCE_REGISTRY ID: `UX-R-417`

---

## SHELL-033

**Requirement (verbatim):**

```
- Mobile-first; tables become cards under ~768px; wizard stepper collapses.
```

**Citations:**
- Source: `UX_SPEC.md` → `Responsive`
- SOURCE_REGISTRY ID: `DATA-056`

---

## SHELL-034

**Requirement (verbatim):**

```
- Persistent, low-noise navigation with clear active state.
```

**Citations:**
- Source: `CANONICAL_VISUAL_BRAND_SPECIFICATION.md` → `6.5 Navigation`
- SOURCE_REGISTRY ID: `STATE-022`

---

## SHELL-035

**Requirement (verbatim):**

```
- Active item: accent indicator (left bar or underline) using `--color-accent-primary`.
```

**Citations:**
- Source: `CANONICAL_VISUAL_BRAND_SPECIFICATION.md` → `6.5 Navigation`
- SOURCE_REGISTRY ID: `UI-R-192`

---

## SHELL-036

**Requirement (verbatim):**

```
- Hover: text shifts to primary; background subtle.
```

**Citations:**
- Source: `CANONICAL_VISUAL_BRAND_SPECIFICATION.md` → `6.5 Navigation`
- SOURCE_REGISTRY ID: `UI-R-193`

---

## SHELL-037

**Requirement (verbatim):**

```
- Multiple simultaneous nav highlight methods (choose one: bar OR bg OR underline).
```

**Citations:**
- Source: `CANONICAL_VISUAL_BRAND_SPECIFICATION.md` → `6.5 Navigation` → `Forbidden`
- SOURCE_REGISTRY ID: `UI-R-195`

---

## SHELL-038

**Requirement (verbatim):**

```
- `--motion-medium: 180ms;` (panel expand/collapse)
```

**Citations:**
- Source: `CANONICAL_VISUAL_BRAND_SPECIFICATION.md` → `7.1 Duration ranges (tokens)`
- SOURCE_REGISTRY ID: `UI-R-214`

---

## SHELL-U-001

**[UNSPECIFIED — REQUIRES PRODUCT DECISION]**

Global search behavior details beyond placement (e.g., what entities are searched, whether search is typeahead vs results page, whether search is available/visible on Mobile drawer mode).

**Citations:**
- None found in: `UX_SPEC.md`, `UI_SPEC.md`, `CANONICAL_VISUAL_BRAND_SPECIFICATION.md`, `SCREEN_BY_SCREEN_UX_SPEC.md`, `SOURCE_REGISTRY.md`

---

## SHELL-U-002

**[UNSPECIFIED — REQUIRES PRODUCT DECISION]**

Top bar behavior on Tablet/Mobile (e.g., whether the Top bar remains visible on Mobile, and if so how it coexists with drawer navigation).

**Citations:**
- None found in: `UX_SPEC.md`, `UI_SPEC.md`, `CANONICAL_VISUAL_BRAND_SPECIFICATION.md`, `SCREEN_BY_SCREEN_UX_SPEC.md`, `SOURCE_REGISTRY.md`

---

## SHELL-U-003

**[UNSPECIFIED — REQUIRES PRODUCT DECISION]**

Right-rail “collapsible panel” interaction specifics on Tablet (e.g., default open/closed state, affordance placement, and whether it overlays or reflows content).

**Citations:**
- None found in: `UX_SPEC.md`, `UI_SPEC.md`, `CANONICAL_VISUAL_BRAND_SPECIFICATION.md`, `SCREEN_BY_SCREEN_UX_SPEC.md`, `SOURCE_REGISTRY.md`
