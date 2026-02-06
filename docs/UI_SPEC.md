# UI_spec.md — Visual System, Tokens, Components, Layout Rules & Styling (CVBS-aligned)

## LeadBitz — UI Specification v1.2 (Aligned to CVBS)

### 0. Product Intent & Non-negotiables (UI)

Positioning: deliverability-first outbound operations platform (not growth hacking/spam).

Non-negotiable UI principles:
- Safety > speed: any send/launch action must surface risk checks and require explicit confirmation.
- AI is assistive, never autonomous: all AI output is attributable, editable, and must be explicitly confirmed before it affects sending.
- Tables are first-class: dense, scannable, keyboard-friendly; bulk actions must have confirmation.
- Low-noise, high-signal: calm dark “control panel” SaaS; **semantic colors only for semantics** and never as the only signal.

---

### 1. Design System Foundation

#### 1.1 Token-only rule (prevents inconsistent styling)
- Use tokens only (CSS variables / Tailwind tokens). No ad-hoc spacing, radii, or colors.
- Components must never hardcode hex values (except in token definitions).
- All interactive elements must define: default, hover, pressed, focus-visible, disabled, loading.
- Dark-first system; no light mode unless introduced via governance.

#### 1.2 Canonical CVBS tokens (authoritative)
**All UI must map to these token names** (no parallel “primary-*” systems). Values below are canonical.

```css
/* Backgrounds & Surfaces */
--color-bg-primary: #0B0F14;          /* app/page base */
--color-bg-surface: #111827;          /* default containers */
--color-bg-elevated: #151F2B;         /* overlays, modals, popovers */

/* Text */
--color-text-primary: rgba(255,255,255,0.92);
--color-text-secondary: rgba(255,255,255,0.72);
--color-text-muted: #9CA3AF;
--color-text-inverse: #0B0F14;

/* Borders */
--color-border-subtle: rgba(255,255,255,0.08);
--color-border-strong: rgba(255,255,255,0.14);

/* Brand Accent (actions only) */
--color-accent-primary: #10B981;
--color-accent-hover: #059669;
--color-accent-soft: rgba(16,185,129,0.16);

/* Semantics (strictly semantic) */
--color-success: #22C55E;
--color-warning: #F59E0B;
--color-danger: #EF4444;
--color-info: #38BDF8;

/* Focus */
--color-focus-ring: rgba(56,189,248,0.55);

/* Overlay */
--color-overlay-backdrop: rgba(0,0,0,0.60);
```

**Hard rules**
- Do not introduce glow tokens for brand or state (no neon/glow). Shadow is allowed only as subtle elevation (see §5).
- Do not use `--color-accent-primary` as a “success” indicator. Use `--color-success` for success states; accent is for *actions*.

#### 1.3 Semantic alias tokens (component-facing)
Components must consume semantic aliases so future palette updates do not require component rewrites.

```css
/* Surfaces */
--ui-bg-app: var(--color-bg-primary);
--ui-bg-surface: var(--color-bg-surface);
--ui-bg-elevated: var(--color-bg-elevated);

/* Text */
--ui-fg-primary: var(--color-text-primary);
--ui-fg-secondary: var(--color-text-secondary);
--ui-fg-muted: var(--color-text-muted);
--ui-fg-inverse: var(--color-text-inverse);

/* Borders */
--ui-border-default: var(--color-border-subtle);
--ui-border-strong: var(--color-border-strong);

/* Actions */
--ui-action-primary: var(--color-accent-primary);
--ui-action-primary-hover: var(--color-accent-hover);
--ui-action-primary-soft: var(--color-accent-soft);

/* Semantics */
--ui-sem-success: var(--color-success);
--ui-sem-warning: var(--color-warning);
--ui-sem-danger: var(--color-danger);
--ui-sem-info: var(--color-info);

/* Focus */
--ui-focus-ring: var(--color-focus-ring);
```

#### 1.4 Accessibility constraints (color)
- Text < 18px: contrast ≥ 4.5:1
- Text ≥ 18px or ≥ 14px semibold: contrast ≥ 3:1
- Non-text UI required for understanding: contrast ≥ 3:1
- Focus indicator must be visible with **2px minimum** thickness; must not rely on border-only changes.

---

### 2. Typography (Roles + Scale)

Font stacks:
- Sans (primary UI): Inter (variable), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
- Mono (IDs/logs/headers): ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace

Type scale (canonical; 16px base):
- text-xs: 12/16
- text-sm: 14/20
- text-md: 16/24 (default body)
- text-lg: 18/28
- text-xl: 20/28
- text-2xl: 24/32
- text-3xl: 30/36

Weight usage mapping:
- Page titles: 600
- Section titles: 600
- Body: 400
- Labels: 500
- Emphasis: 500
- KPIs: 600
- Avoid 700+ broadly in dark UI (glare/noise).

Table typography:
- Default: text-sm, 400 for cells
- Headers: text-xs, 600 (uppercase optional; if used, keep tracking subtle and consistent)

---

### 3. Spacing System (Tokenized)

4px base scale (token-only):

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
--space-11: 80px;
--space-12: 96px;
```

Defaults:
- Page section gap: `--space-6`
- Dense operational views: `--space-4`
- Panel padding: `--space-4` to `--space-6` depending on density
- Table row heights: 36 (compact), 44 (default), 56 (comfortable)

---

### 4. Radius & Geometry (CVBS-aligned)

Use CVBS radius scale (replace legacy radius-1/2/3 with these).

```css
--radius-sm: 8px;     /* small controls where needed */
--radius-md: 12px;    /* default inputs/cards/buttons */
--radius-lg: 16px;    /* modals, large containers */
--radius-pill: 999px; /* chips/badges only */
```

Rules:
- Buttons: radius-md by default (no “pill buttons”).
- Cards: radius-md.
- Modals: radius-lg.
- Tables: radius applies to container only.

---

### 5. Elevation & Shadows (No glow; subtle only)

Elevation is communicated primarily via **surface tokens + border**; shadows are minimal.

Allowed shadows (conceptual tokens; implement in Tailwind/CSS as variables):
```css
--shadow-elev-1: 0 8px 24px rgba(0,0,0,0.25);  /* cards only if needed */
--shadow-elev-2: 0 16px 48px rgba(0,0,0,0.35); /* modals/popovers only */
```

Forbidden:
- Any “glow” shadows tied to accent or semantics.
- Strong drop shadows on every element.
- Glassmorphism/backdrop blur as a default style (see §19).

---

### 6. Buttons (Behavior + Styling Rules)

Global rules:
- One primary button per view for the main commit action (e.g., “Lock Copy”, “Launch Campaign”).
- Destructive actions require explicit confirmation (modal or two-step inline confirm).
- Sizes:
  - sm: 32px height (dense toolbars only)
  - md: 40px height (default)
  - lg: 48px height (wizard primary CTAs)

#### 6.1 Primary button (action)
- Background: `--ui-action-primary`
- Text: `--ui-fg-inverse`
- Hover: background `--ui-action-primary-hover`
- Active: same as hover + slight opacity or inset border (no glow)
- Focus-visible: focus ring (see §21)
- Disabled: reduced opacity + no hover + not-allowed

#### 6.2 Secondary button (neutral action)
- Background: transparent or `--ui-bg-surface`
- Border: 1px solid `--ui-border-default`
- Text: `--ui-fg-primary`
- Hover: background `--ui-bg-elevated`, border `--ui-border-strong`

#### 6.3 Tertiary (text) button
- Background: none
- Border: none
- Text: `--ui-fg-secondary`
- Hover: text `--ui-fg-primary` + subtle underline (optional)

#### 6.4 Destructive button (semantic)
- Background: `--ui-sem-danger`
- Text: `--ui-fg-inverse`
- Must be paired with confirm pattern; never default-focused.

Forbidden:
- Accent glow on hover.
- Using semantic colors for non-semantic actions.
- Gradient buttons.

---

### 7. Inputs (Text fields, selects, search)

Rules:
- Labels are always visible (no placeholder-only labels).
- Default: bg `--ui-bg-surface`, border `--ui-border-default`, radius `--radius-md`
- Padding: 10px 14px (tokenize in Tailwind spacing; do not ad-hoc)
- Focus: border `--ui-border-strong` + focus ring `--ui-focus-ring`
- Error: border `--ui-sem-danger` + inline error text and icon (not color-only)
- Disabled: text `--ui-fg-muted`, reduced contrast background, no pointer events

---

### 8. Cards / Panels

Standard card:
- Background: `--ui-bg-surface`
- Border: 1px solid `--ui-border-default`
- Radius: `--radius-md`
- Padding: `--space-4` to `--space-6`
- Shadow: optional `--shadow-elev-1` only if needed

Selected/active card:
- Border: `--ui-border-strong`
- Optional: small left indicator bar using `--ui-action-primary`

Forbidden:
- Glass cards / backdrop blur as default.
- Decorative gradients on operational cards.

---

### 9. Tables (Lead lists, campaign lists, replies)

Container:
- Background: `--ui-bg-surface`
- Border: `--ui-border-default`
- Radius: `--radius-md`
- Overflow: hidden; horizontal scroll on small screens

Header:
- Sticky by default
- Text: `--ui-fg-secondary`
- Background: `--ui-bg-surface` or `--ui-bg-elevated` (choose globally)

Rows:
- Height: 44px default; compact 36px allowed
- Hover: subtle background delta using `--ui-bg-elevated`
- Selected: checkbox + left indicator bar + optional `--ui-action-primary-soft` background
- Risk indicators: icon + label; tooltips allowed; never color-only

Keyboard support:
- Arrow keys move row focus
- Space toggles selection
- Enter opens detail

Performance:
- If >2,000 rows: virtualization required; reduce effects.

---

### 10. Badges / Status Chips (Strict semantics)

- Success: `--ui-sem-success`
- Warning: `--ui-sem-warning`
- Danger: `--ui-sem-danger`
- Info: `--ui-sem-info`
- Neutral: border `--ui-border-default`, text `--ui-fg-secondary`

Shape: pill only for chips/badges.

---

### 11. Navigation

- Active indicator: single method only (recommended: left bar in `--ui-action-primary`)
- Hover: subtle background + text to primary

Mobile: hamburger drawer; no bottom tabs.

---

### 12. “Safety Strip” (Persistent operational health)

Visible on key screens:
- Sender health (Good/Degraded/Critical)
- Bounce risk (Low/Medium/High)
- Daily cap (used/total)
- Compliance (suppression active, unsubscribe present)

Rules:
- Use semantic color on chip/icon only
- Always include label text
- Click opens remediation drawer

---

### 13. Modals / Dialogs

- Surface: `--ui-bg-elevated`, border `--ui-border-default`, radius `--radius-lg`
- Backdrop: `--color-overlay-backdrop`

Destructive actions:
- danger icon + explicit verb
- never default-focus destructive CTA

---

### 14. Responsive Layout System

Breakpoints:
- xs: 0–639
- sm: 640–1023
- md: 1024–1279
- lg: 1280–1535
- xl: 1536+

App shell:
- md+: left nav 264px (collapsible to 80px) + top bar 56px
- xs: hamburger drawer nav

Main container:
- max width 1440px, except tables may go full width.

---

### 15. Motion Standards (CVBS-aligned)

Durations:
- hover/focus: 120ms
- panels: 180ms
- modals: 240ms

Easing: ease-out in, ease-in out; no bounce.

Reduced motion: respect prefers-reduced-motion.

Forbidden:
- glows, heavy shimmer, stagger animations in dense lists.

---

### 16. Iconography (Contract)

- Outline icons, 2px stroke @ 24px grid, rounded caps/joins.
- Fill only for selected/severity emphasis (rare).
- No multi-color icons in operational views.

---

### 17. Data Visualization (Charts)

Use CVBS data palette tokens only; no semantic red as normal series.

---

### 18. Copy + Microcopy (Behavioral constraints)
- Factual, action-oriented.
- AI outputs labeled as draft; require explicit confirmation before launch/send.
- Compliance prompts at launch are mandatory.

---

### 19. Performance + Forbidden patterns
Forbidden unless governed:
- Glassmorphism/backdrop blur defaults
- accent/semantic glows
- heavy blur transitions
- decorative gradients in core UI

Allowed:
- subtle shadows for modals/popovers
- skeleton loading (subtle)

---

### 20. Recommended Implementation Stack (CVBS-safe)
- Tailwind CSS mapped to CSS variables (source of truth)
- Headless UI / Radix UI primitives
- Avoid UI kits that impose non-compliant glass/glow defaults unless overridden.

---

### 21. Global Interaction State Styling (Standard)

All interactive components must implement:
- Default, Hover, Active, Focus-visible, Disabled, Loading, Selected, Semantic states (where applicable)

Focus ring:
```css
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ui-focus-ring);
}
```

---

### 22. Accessibility Visual Requirements
- Focus visible everywhere (2px ring minimum).
- Touch targets: ≥ 44x44 on mobile/tablet; ≥ 32px in dense tables on desktop only.
- Errors include text + icon + association; never color-only.
- Status includes label text; never color-only.
