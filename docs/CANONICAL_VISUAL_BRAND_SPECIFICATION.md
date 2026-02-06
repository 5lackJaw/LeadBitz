CANONICAL_VISUAL_BRAND_SPECIFICATION.md
---
# Canonical Visual & Brand Specification (CVBS)
Brand: LeadBitz

Website: https://www.leadbitz.com

Cold Outreach Automation Platform (Deliverability-first Outbound Ops)

## Scope and intent
This document is the **single source of truth** for visual/brand system rules across product UI, marketing surfaces, emails, docs, and generated assets. It defines **tokens, constraints, and behavioral styling rules**. It does **not** define layouts, mockups, or visual compositions.

Primary drivers:
- High-trust, compliance-sensitive outbound email operations
- Operator control, safety, auditability, and clarity
- Long-term consistency across human designers and multiple AI systems

---

## 1. Brand Visual DNA

### 1.1 Brand traits (immutable; max 6)
1) **Trust-forward** (serious, precise, non-salesy)
2) **Operator-grade** (control panels, clarity, predictable states)
3) **Calm** (low visual noise; stable hierarchy)
4) **Accountable** (auditability cues; explicit confirmations)
5) **Efficient** (dense but readable; “work gets done”)
6) **Safety-first** (guardrails are visible; risk is surfaced early)

### 1.2 Anti-traits (must avoid)
- Playful/gamified
- Trend-chasing “Dribbble” aesthetics that reduce legibility
- Overly aggressive “growth-hacker” vibe
- High-chroma neon palettes, rainbow gradients, heavy blur/glow
- Decorative complexity that competes with operational signals
- Ambiguous states (unclear whether action succeeded, is pending, or failed)

### 1.3 Emotional tone
- “Calm control room”
- Neutral confidence; minimal persuasion
- Errors are factual; warnings are actionable; success is understated

### 1.4 Visual philosophy
- **System-first**: tokens + components, not one-off art decisions.
- **Information clarity over decoration**: functional contrast and hierarchy.
- **Safety is visible**: risk indicators and confirmations are standard.
- **Consistency beats novelty**: reuse patterns; avoid custom styling per screen.

### 1.5 Brand Do / Don’t rules (enforceable)
**Do**
- Use semantic colors only for semantic meaning (success/warn/danger/info).
- Preserve a strict text hierarchy (primary/secondary/muted) and spacing scale.
- Use “quiet” surfaces + one primary accent for actions.
- Show state changes explicitly (pending → success/fail).

**Don’t**
- Use red/amber/green for anything other than state.
- Use more than **one** accent color on a single interactive control.
- Use gradients on interactive components by default (exceptions only in marketing hero, governed below).
- Use light-mode variants unless explicitly added by governance (this system is dark-first).

---

## 2. Color System (Tokenized)

### 2.1 Color principles
- Dark-first, low glare, high legibility.
- Accent color signals *intentional action*, not decoration.
- Semantic colors must be reserved for state and alerts only.

### 2.2 Core tokens (CSS variable format)
All tokens below are **authoritative**. Hex values are canonical.

#### Background & surfaces (layering)
- `--color-bg-primary: #0B0F14;`
  - Purpose: app/page base background.
  - Usage: full-bleed backgrounds; behind all surfaces.
  - Accessibility: must keep sufficient contrast with surface boundaries.
  - Forbidden: do not place body text directly on this without a surface unless contrast is verified.

- `--color-bg-surface: #111827;`
  - Purpose: default content surface (cards, panels).
  - Usage: primary containers; tables; form panels.
  - Accessibility: body text on this surface must meet WCAG AA contrast.
  - Forbidden: do not use as global page background.

- `--color-bg-elevated: #151F2B;`
  - Purpose: elevated surfaces (modals, popovers, sticky nav).
  - Usage: overlays and “active focus” containers.
  - Accessibility: must be visually distinguishable from `--color-bg-surface` by at least one of: border, shadow, or delta in luminance.
  - Forbidden: do not use as the only distinction for hover/active; still require state styling.

#### Borders & dividers
- `--color-border-subtle: rgba(255,255,255,0.08);`
  - Purpose: hairline dividers, card borders.
  - Usage: 1px borders; table row separators; input borders.
  - Accessibility: must not be the sole indicator of focus; pair with focus ring.
  - Forbidden: do not increase opacity beyond 0.14 without governance (prevents “boxed-in” look).

- `--color-border-strong: rgba(255,255,255,0.14);`
  - Purpose: emphasis borders (focused cards, active panels).
  - Usage: selected states; active nav indicator container borders.
  - Forbidden: do not use for every container; reserve for selection/focus.

#### Text hierarchy
- `--color-text-primary: rgba(255,255,255,0.92);`
  - Purpose: primary reading text.
  - Usage: headings, body, primary labels.
  - Forbidden: do not use at 100% white; avoid glare.

- `--color-text-secondary: rgba(255,255,255,0.72);`
  - Purpose: secondary text.
  - Usage: descriptions, helper text, timestamps.
  - Forbidden: do not use for critical instructions or error messages.

- `--color-text-muted: #9CA3AF;`
  - Purpose: muted/tertiary text, placeholder text.
  - Usage: placeholders, subtle metadata, disabled labels.
  - Accessibility: must not be used for required field labels or core instructions.

- `--color-text-inverse: #0B0F14;`
  - Purpose: text on light/bright semantic fills (e.g., success badge).
  - Usage: used sparingly for contrast on bright fills.
  - Forbidden: do not use on dark surfaces.

#### Brand accents (action + trust)
- `--color-accent-primary: #10B981;`
  - Purpose: primary action / trust signal.
  - Usage: primary buttons, active nav indicator, key toggles, progress confirmations.
  - Accessibility: text on accent fill must pass WCAG AA; default is `--color-text-inverse`.
  - Forbidden: do not use for success state *unless the UI element is also an action* (success uses semantic token).

- `--color-accent-hover: #059669;`
  - Purpose: hover/active accent variant.
  - Usage: hover state for primary buttons, active item hover.
  - Forbidden: do not use as standalone accent (must be tied to interaction state).

- `--color-accent-soft: rgba(16,185,129,0.16);`
  - Purpose: low-intensity accent background.
  - Usage: selected rows, subtle highlights, active pill backgrounds.
  - Forbidden: do not use behind long text blocks; use for short labels/selection only.

#### Semantic states (must be strictly semantic)
- `--color-success: #22C55E;`
  - Purpose: successful completion state.
  - Usage: success badges, “sent”, “connected”, “passed checks”.
  - Forbidden: never use for primary CTAs.

- `--color-warning: #F59E0B;`
  - Purpose: warning/risk state.
  - Usage: deliverability warnings, “needs attention”.
  - Forbidden: never use for decorative highlights.

- `--color-danger: #EF4444;`
  - Purpose: error/blocking state.
  - Usage: failures, bounces/complaints, destructive actions.
  - Forbidden: never use in neutral contexts; never use for emphasis text.

- `--color-info: #38BDF8;`
  - Purpose: informational guidance state.
  - Usage: tips, neutral notices, “learn more”, non-blocking system notes.
  - Forbidden: do not use as secondary accent; reserve for info-only.

#### Focus & interaction outlines
- `--color-focus-ring: rgba(56,189,248,0.55);`
  - Purpose: accessible focus ring.
  - Usage: keyboard focus outlines for all interactive components.
  - Forbidden: do not replace with subtle border-only focus.

#### Data visualization palette (restricted; for charts only)
Rules:
- Charts must remain legible on dark surfaces.
- Use **max 5 categorical series** in a single chart without user-driven legend filtering.
- Never reuse semantic colors for non-semantic series unless meaning is explicit.

Tokens:
- `--color-data-1: #38BDF8;` (default series)
- `--color-data-2: #A78BFA;`
- `--color-data-3: #F59E0B;`
- `--color-data-4: #10B981;`
- `--color-data-5: #F472B6;`
- `--color-data-grid: rgba(255,255,255,0.08);`
- `--color-data-axis: rgba(255,255,255,0.72);`

Forbidden:
- Do not use red (`--color-danger`) as a normal series color (reserve for alerts/thresholds).
- No gradients in charts except heatmaps with explicit scale labeling.

### 2.3 Accessibility constraints (color)
- Minimum contrast targets:
  - Body text vs surface: WCAG AA (4.5:1).
  - Large text (≥ 18pt regular or 14pt bold): WCAG AA (3:1).
  - Interactive focus ring must be visible on both `--color-bg-surface` and `--color-bg-elevated`.
- Color must never be the only indicator of:
  - selection
  - focus
  - error state
  - campaign status
  Provide shape/icon/text reinforcement.

---

## 3. Typography System

### 3.1 Typeface roles (implementation-ready)
- **UI Sans (primary):** Inter (preferred) or system-ui fallback.
  - Purpose: UI labels, body, navigation, tables.
- **UI Mono (secondary):** ui-monospace / SF Mono / Menlo / Consolas.
  - Purpose: IDs, tokens, email headers, logs, code-like artifacts.

### 3.2 Scale system (roles, not random sizes)
Define sizes as tokens. Use consistent line-height for readability on dark UI.

- `--font-size-xs: 12px;` (line-height 16)
- `--font-size-sm: 14px;` (line-height 20)
- `--font-size-md: 16px;` (line-height 24) **default body**
- `--font-size-lg: 18px;` (line-height 28)
- `--font-size-xl: 20px;` (line-height 28)
- `--font-size-2xl: 24px;` (line-height 32)
- `--font-size-3xl: 30px;` (line-height 36)

### 3.3 Weight usage mapping
- Headings: 600 (semibold)
- Body: 400
- Emphasis: 500
- UI labels: 500
- Numbers in KPIs: 600
- Mono labels: 500

Forbidden:
- Using 700+ weights broadly in dark UI (creates glare and noise).
- Using multiple weights within a single small control label.

### 3.4 Density + readability philosophy
- Default UI density: **compact-professional** (tables and inboxes must be scannable).
- Minimum hit area for interactive elements: 40px height or equivalent padding.
- Long-form text (docs/help): increase line-height and keep measure 60–80 characters.

---

## 4. Logo System Rules (constraints only; no logo design)

### 4.1 Allowed construction styles
- Geometric mark (monoline or solid) + wordmark
- Abstract “system/flow” motif (pipeline, nodes, routing) **only if** it remains simple at 16px
- Optional container shape: rounded square or hex-like, but must remain minimal

### 4.2 Geometry philosophy
- Prefer **simple primitives**: circle, rounded rect, straight lines, 45° angles.
- Stroke count low; avoid intricate negative space patterns.

### 4.3 Scalability rules
- Must be legible at:
  - 16px favicon
  - 24px app icon
  - 128px marketing
- Provide a 1-color version that works on `--color-bg-primary`.

### 4.4 Color usage rules
- Primary logo color: `--color-accent-primary` on dark backgrounds.
- Alternate: `--color-text-primary` (monochrome).
- Forbidden: multi-color logos; gradients; neon glows.

### 4.5 Forbidden logo patterns
- Mascots/characters
- Overly literal email envelope iconography
- “Growth hacker” motifs (rockets, flames)
- Overly thin strokes that vanish on dark mode

---

## 5. Shape & Geometry Language

### 5.1 Radius scale (tokens)
- `--radius-sm: 8px;`
- `--radius-md: 12px;` (default cards/inputs)
- `--radius-lg: 16px;` (modals, large containers)
- `--radius-pill: 999px;` (chips/badges only)

Rules:
- Buttons: `md` by default; pill only for chips/tags.
- Tables: radius applies to container only, not each row.

### 5.2 Stroke philosophy
- Default border: 1px using `--color-border-subtle`.
- Emphasis border: 1px using `--color-border-strong`.
- Dividers: 1px, never thicker unless for chart axes.

### 5.3 Elevation philosophy
- Elevation is subtle: differentiate primarily through surface token + border + minimal shadow.
- Shadows must be low-opacity and large-blur (no sharp drop shadows).

Tokens (conceptual; implement per framework):
- `--shadow-elev-1`: subtle, for cards
- `--shadow-elev-2`: for modals/popovers only

Forbidden:
- Strong shadows on every element.
- Glow shadows on buttons.

### 5.4 Layering philosophy
- Base: bg-primary
- Content: bg-surface
- Focus/overlays: bg-elevated
- Modal backdrop: dark translucent overlay, no blur requirement (blur optional, must be subtle)

---

## 6. UI Styling Rules (Behavioral, Not Layout)

### Global UI rules
- Interactions must have **4 states**: default, hover, active/pressed, disabled.
- Focus state must be keyboard-visible using `--color-focus-ring`.
- Disabled state reduces contrast and removes shadows; must remain readable.

### 6.1 Buttons
**Base philosophy**
- Primary = action (accent fill)
- Secondary = neutral action (surface + border)
- Tertiary = text button (no border; used sparingly)

**State behavior**
- Primary default: fill `--color-accent-primary`, text `--color-text-inverse`
- Primary hover: fill `--color-accent-hover`
- Disabled: opacity reduction + no hover

**Accessibility**
- Minimum 40px height.
- Focus ring always visible.

**Forbidden**
- Gradient buttons by default.
- Red primary buttons except destructive confirmations.

### 6.2 Inputs (text fields, selects)
**Base philosophy**
- Inputs are calm, high-contrast, with clear focus and error states.

**State behavior**
- Default: bg `--color-bg-surface`, border `--color-border-subtle`
- Focus: border `--color-border-strong` + focus ring
- Error: border `--color-danger` + inline error text (secondary size)

**Forbidden**
- Placeholder-only labels (labels must exist for accessibility).
- Using muted text color for actual input value.

### 6.3 Cards / Panels
**Base philosophy**
- Cards are operational containers; avoid heavy decoration.

**State behavior**
- Default: bg-surface + subtle border
- Selected: border-strong + optional accent-soft background strip
- Hover (if clickable): subtle border strengthen, not large movement

**Forbidden**
- Massive shadows or animated lifts on hover.

### 6.4 Tables / Lists (leads, replies)
**Base philosophy**
- Scannability and density; clear row states.

**State behavior**
- Zebra striping is optional; if used, extremely subtle.
- Hover row: background delta using `--color-bg-elevated` or slight overlay.
- Selected row: `--color-accent-soft` + strong border indicator or left bar.

**Accessibility**
- Row selection must have non-color indicator (icon/checkbox + text).

**Forbidden**
- Overly thin fonts; insufficient line height; hidden controls without focus access.

### 6.5 Navigation
**Base philosophy**
- Persistent, low-noise navigation with clear active state.

**State behavior**
- Active item: accent indicator (left bar or underline) using `--color-accent-primary`.
- Hover: text shifts to primary; background subtle.

**Forbidden**
- Multiple simultaneous nav highlight methods (choose one: bar OR bg OR underline).

### 6.6 Status indicators (chips, badges)
**Base philosophy**
- Always semantic; quick scan.

**Rules**
- Success uses `--color-success`, Warning uses `--color-warning`, Error uses `--color-danger`, Info uses `--color-info`.
- Use consistent chip shape (pill), consistent padding.

**Forbidden**
- Using brand accent for “success” labels unless representing an action CTA.

### 6.7 Modals / Dialogs
**Base philosophy**
- Confirmations are explicit; risk actions require acknowledgement.

**Rules**
- Destructive actions: show `--color-danger` icon + explicit label “Delete”, never default-focus destructive button.
- Modal surface uses `--color-bg-elevated`.

**Forbidden**
- Stacking multiple modals.
- Auto-dismissing critical dialogs.

### 6.8 Data visualization surfaces
**Base philosophy**
- Charts are analytical; avoid decoration.

**Rules**
- Chart background: `--color-bg-surface`
- Grid lines: `--color-data-grid`
- Axis labels: `--color-data-axis`
- Use data palette tokens only.

**Forbidden**
- Pattern fills, heavy gradients, 3D charts.

---

## 7. Motion & Interaction Philosophy

### 7.1 Duration ranges (tokens)
- `--motion-fast: 120ms;` (hover, focus transitions)
- `--motion-medium: 180ms;` (panel expand/collapse)
- `--motion-slow: 240ms;` (modals, route-level emphasis only)

### 7.2 Easing philosophy
- Use standard ease-out for entrances; ease-in for exits; avoid “bouncy” curves.
- Motion must communicate state change, not personality.

### 7.3 Motion density rules
- Only one motion event should occur per user action (e.g., click → state change).
- Use skeleton loading for tables; avoid spinners that block reading.

### 7.4 When motion is forbidden
- During error states requiring attention (no distracting animation).
- On repeated list items (no staggered animations in dense ops views).
- For accessibility: respect reduced motion preferences; provide zero-motion path.

---

## 8. Illustration & Iconography Contract

### 8.1 Icon style (preferred)
- Outline icons with consistent stroke weight (2px at 24px grid).
- Rounded caps and joins (aligns with calm system feel).

### 8.2 Fill usage
- Filled icons allowed only for:
  - status severity
  - selected state
  - primary brand mark usage in small spaces

### 8.3 Perspective & detail density
- Flat, orthographic icons.
- No isometric scenes.
- No excessive detail; icons must be legible at 16px.

### 8.4 Lighting rules (if any 3D is ever used)
- Avoid 3D in core UI.
- If used in marketing only: single soft key light from top-left; minimal reflections; no chrome.

---

## 9. Asset Generation Rules (AI + Designer Safe)

### 9.1 Background philosophy
- Default backgrounds: solid `--color-bg-primary` or subtle surface gradients within 3–5% luminance delta.
- Avoid busy textures behind text.

### 9.2 Texture usage rules
- Grain/noise: off by default.
- If used (marketing only): extremely subtle, consistent, and never behind small text.

### 9.3 Noise / grain policy
- UI: forbidden.
- Marketing: allowed only under governance, must not reduce compression/clarity.

### 9.4 Export format rules
- UI icons: SVG (stroke preserved), 1x source, scaled via CSS.
- Raster marketing assets: PNG for transparency, JPG only for photos.
- Decks: SVG where possible; otherwise 2x PNG.

### 9.5 Resolution guidance
- UI screenshots for docs: 2x device pixel ratio.
- Social previews: 1200×630 baseline.
- Pitch slides: 1920×1080 canvas.

---

## 10. Cross-Asset Consistency Rules

### 10.1 Marketing site
- Uses same color tokens and typography roles.
- May use **one** controlled gradient area (hero only), but must still read as the same system:
  - gradient must stay within bg-primary ↔ bg-elevated range plus a subtle accent tint (≤ 12% opacity).

### 10.2 Product UI
- No marketing gradients.
- Strict semantic color discipline.
- Density optimized for operations (tables, inbox views).

### 10.3 Emails (product-generated)
- Functional, plain, deliverability-safe.
- Avoid heavy branding; minimal accent usage.
- No large images by default.
- Buttons: use simple HTML with safe accent; always include text fallback.

### 10.4 Docs
- Use the same typographic scale roles.
- Prefer monochrome diagrams if any are embedded (not in this spec).
- Code blocks in mono, high contrast.

### 10.5 Social previews & pitch decks
- Must reuse tokens and typography roles.
- Limit decorative elements; focus on clarity and trust.
- One accent per slide max (except charts).

### 10.6 Generated graphics (AI outputs)
- Must reference token names (not ad-hoc hex) and follow semantic rules.
- Must not invent new colors; new tokens require governance.

---

## 11. Evolution & Governance Rules

### 11.1 What may change
- Secondary data palette tokens (if chart needs expand) with governance.
- Typography font family (if licensing/availability changes) **only** within “UI Sans” role.
- Spacing scale extensions (rare) if validated across product.

### 11.2 What must never change (without a versioned CVBS release)
- Dark-first surface layering system (`bg-primary/surface/elevated`)
- Primary accent identity (`--color-accent-primary` family)
- Semantic color discipline (success/warn/danger/info usage constraints)
- Typography roles (UI Sans + UI Mono) and scale philosophy

### 11.3 How to extend system safely
Process:
1) Propose new token/component rule with purpose and constraints.
2) Demonstrate it cannot be expressed with existing tokens.
3) Add token with:
   - name
   - purpose
   - allowed usage
   - forbidden usage
   - accessibility notes
4) Update Tailwind/CSS mapping and document in changelog.

### 11.4 Token introduction rules
- New tokens must be **orthogonal** (no duplicates).
- Every new color token must specify:
  - where it is allowed
  - where it is forbidden
  - what it replaces (if anything)

---

## Implementation mapping (tokens → CSS/Tailwind)
- Use CSS variables as the source of truth (`:root` or `[data-theme="dark"]`).
- Tailwind should reference variables (e.g., `bg-[color:var(--color-bg-surface)]`) or via theme config mapping.
- Semantic tokens must be mapped to component variants, not used ad-hoc.

---

## Final validation (mandatory)
This specification:
- Enables independent asset generation by multiple designers/AI systems via **token names + enforceable constraints**.
- Avoids trend dependence (no reliance on glassmorphism, heavy blur, neon gradients, decorative motion).
- Defines rules as **must/must-not** and reserves semantics for meaning.
- Is implementable directly in code through CSS variables and Tailwind mappings.

If any future output violates semantic color discipline, introduces new colors, or changes layering/typography roles without governance, it is non-compliant with CVBS.
