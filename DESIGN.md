---
version: alpha
name: YM Tax CRM
description: Hebrew-first, RTL internal tax advisory CRM. Calm white work surfaces, a light top navigation bar, blue (#007aff) primary actions, indigo informational tone, and semantic status colors (positive=emerald, warning=amber, negative=red). Source of truth is the implemented component code (src/index.css @theme + src/components/ui/primitives), not this prose.
source-of-truth: code
derived-from:
  - src/index.css
  - src/components/ui/primitives/*
  - src/components/ui/layout/StatsCard.tsx
  - src/components/ui/overlays/*
  - src/components/ui/table/DataTable.tsx
  - src/utils/semanticColors.ts
colors:
  # primary = blue ramp (NOT indigo). primary-600 is the action color.
  primary: '#007aff'
  on-primary: '#FFFFFF'
  primary-hover: '#0062cc'
  primary-active: '#004A99'
  primary-50: '#EEF6FF'
  primary-100: '#E0EEFE'
  primary-200: '#BCDCFD'
  primary-300: '#84C2FC'
  primary-400: '#4AA6FA'
  primary-500: '#1C8DF5'
  primary-600: '#007AFF'
  primary-700: '#0062CC'
  primary-800: '#004A99'
  primary-900: '#00305C'
  # NOTE: there is no separate `accent` ramp in @theme. Amber lives only as the
  # `warning` semantic ramp below; it is not a standalone decorative brand color.
  # semantic: info (indigo)
  info-50: '#EEF2FF'
  info-100: '#E0E7FF'
  info-200: '#C7D2FE'
  info-400: '#818CF8'
  info-500: '#6366F1'
  info-700: '#4338CA'
  info-800: '#312E81'
  # semantic: positive (emerald)
  positive-50: '#ECFDF5'
  positive-100: '#D1FAE5'
  positive-200: '#A7F3D0'
  positive-400: '#34D399'
  positive-500: '#10B981'
  positive-700: '#047857'
  positive-800: '#065F46'
  # semantic: warning (amber)
  warning-50: '#FFFBEB'
  warning-100: '#FEF3C7'
  warning-200: '#FDE68A'
  warning-400: '#FBBF24'
  warning-500: '#F59E0B'
  warning-600: '#D97706'
  warning-700: '#B45309'
  warning-800: '#92400E'
  # semantic: negative (red)
  negative-50: '#FEF2F2'
  negative-100: '#FEE2E2'
  negative-200: '#FECACA'
  negative-400: '#F87171'
  negative-500: '#EF4444'
  negative-600: '#DC2626'
  negative-700: '#B91C1C'
  negative-800: '#991B1B'
  # surfaces
  background: '#F9FAFB'
  surface: '#FFFFFF'
  on-surface: '#0F172A'
  focus-ring: '#007AFF'
  # neutrals = Tailwind default `gray` ramp (used pervasively)
  gray-50: '#F9FAFB'
  gray-100: '#F3F4F6'
  gray-200: '#E5E7EB'
  gray-300: '#D1D5DB'
  gray-400: '#9CA3AF'
  gray-500: '#6B7280'
  gray-600: '#4B5563'
  gray-700: '#374151'
  gray-800: '#1F2937'
  gray-900: '#111827'
typography:
  # Single family. Root font-size is 100% (browser default) in html (src/index.css).
  # No bespoke type-scale tokens exist; sizes come from Tailwind text-* utilities.
  fontFamily: Heebo
  rootScale: 100%
  scale:
    text-3xs: 10px # dense metadata (pinned px, unaffected by root scale)
    text-2xs: 11px # uppercase table headers, eyebrows (pinned px)
    text-xs: 12px # badges, metadata, tooltips
    text-sm: 14px # body, buttons, inputs, table cells (the workhorse size)
    text-base: 16px
    text-lg: 18px # stat value (default), card titles
    text-xl: 20px # stat value (compact)
  weights:
    normal: 400
    medium: 500 # buttons, labels, badges
    semibold: 600 # table headers, section labels
    bold: 700 # stat values, emphasis
  numerics: tabular-nums # all amounts, counts, dates, days (.font-mono = Heebo tabular)
spacing:
  base: 4px # Tailwind 0.25rem scale; 8px rhythm for controls
  card-padding: 28px # p-7 default Card body
  card-padding-compact: 20px # p-5
  card-header-x: 28px # px-7
  card-header-y: 20px # py-5
  table-cell-x: 12px # px-3
  table-cell-y: 8px # py-2
  overlay-padding-x: 24px # px-6 modal/drawer
  overlay-padding-y: 16px # py-4
  navbar-height: 64px # h-16
rounded:
  sm: 4px # rounded-sm  (link button, skeleton)
  md: 6px # rounded-md  (small icon buttons, alert icon tile sm)
  lg: 8px # rounded-lg  (inputs, stat icon tile, alert icon tile, tooltip)
  nav: 10px # rounded-nav  (navbar/menu items) — off-scale, pinned px
  xl: 12px # rounded-xl  (stat card, modal, alert, group section)
  tile: 14px # rounded-tile (square icon tiles) — off-scale, pinned px
  2xl: 16px # rounded-2xl
  3xl: 24px # rounded-3xl (Card primitive container)
  full: 9999px # buttons, badges, pills, progress, avatar
radii:
  button: '{rounded.full}'
  button-link: '{rounded.sm}'
  input: '{rounded.lg}'
  card: '{rounded.3xl}'
  stats-card: '{rounded.xl}'
  modal: '{rounded.xl}'
  drawer: '{rounded.none}' # full-height right panel, no corner radius
  badge: '{rounded.full}'
  tooltip: '{rounded.lg}'
shadows:
  # Slate-tinted (rgba 15,23,42). NOT indigo-tinted.
  sm: '0 1px 2px rgba(15,23,42,0.05)'
  elevation-0: '0 1px 2px rgba(15,23,42,0.04)' # quiet inset/section box
  elevation-1: '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)'
  elevation-2: '0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)'
  elevation-3: '0 12px 28px rgba(15,23,42,0.1), 0 4px 8px rgba(15,23,42,0.05)'
  overlay: 'shadow-xl' # modal
  drawer: 'shadow-2xl'
elevation:
  card-default: '{shadows.elevation-1}'
  card-elevated: '{shadows.elevation-2}'
  card-interactive-hover: '{shadows.elevation-3}' # + -translate-y-0.5
  stats-card: '{shadows.sm}'
motion:
  fade-in: '300ms ease-out' # translateY(6px) -> 0
  fade-in-up: '350ms ease-out' # translateY(8px) -> 0, used by stagger-children
  scale-in: '250ms ease-out' # scale(0.96) -> 1
  slide-in: '300ms ease-out' # translateX(12px) -> 0, alerts
  shimmer: '2s linear infinite' # skeleton
  transition-default: '200ms' # buttons, cards
  reduced-motion: respected # @media prefers-reduced-motion disables all
components:
  navbar:
    height: 64px
    backgroundColor: '{colors.surface}'
    borderBottom: '1px solid {colors.gray-200}' # /80 opacity
    note: 'Primary navigation is a light TOP bar, not a dark sidebar. A separate collapsible ClientSidebar lists clients.'
  button-base:
    rounded: '{rounded.full}' # pill (default); text-like variants = rounded-sm; shape=square = rounded-xl
    typography: text-sm / medium
    focusRing: 'focus-ring (2px solid {colors.focus-ring}, offset 2px)'
    transition: all 200ms
  button-size-sm: { padding: 6px 12px } # px-3 py-1.5
  button-size-md: { padding: 8px 16px } # px-4 py-2
  button-size-lg: { padding: 10px 20px } # px-5 py-2.5
  button-shape-square: { sm: 32x32, md: 36x36, lg: 40x40, rounded: '{rounded.xl}' } # icon-only chrome, p-0
  button-primary:
    {
      backgroundColor: '{colors.primary-600}',
      textColor: '#FFFFFF',
      hover: '{colors.primary-700}',
      active: '{colors.primary-800}',
      shadow: '{shadows.sm}',
    }
  button-secondary: { backgroundColor: '{colors.gray-100}', textColor: '{colors.gray-900}', hover: '{colors.gray-200}' }
  button-outline:
    {
      backgroundColor: '{colors.surface}',
      textColor: '{colors.gray-700}',
      border: '1px solid {colors.gray-300}',
      hover: '{colors.gray-50}',
    }
  button-ghost: { backgroundColor: transparent, textColor: '{colors.gray-600}', hover: '{colors.gray-200}' }
  button-danger:
    {
      backgroundColor: '{colors.negative-600}',
      textColor: '#FFFFFF',
      hover: '{colors.negative-700}',
      active: '{colors.negative-800}',
    }
  button-link:
    { textColor: '{colors.gray-600}', decoration: underline, rounded: '{rounded.sm}', hover: '{colors.gray-900}' }
  button-link-family: # text-like variants (rounded-sm, underline-offset-2, no padding box)
    {
      linkPrimary: 'text {colors.primary-700} hover primary-800',
      linkPositive: 'text {colors.positive-600} hover positive-800',
      linkWarning: 'text {colors.warning-600} hover warning-800',
      text: 'text {colors.gray-950}, no underline, hover primary-700 (inline action)',
    }
  input:
    rounded: '{rounded.lg}'
    height: 36px # h-9 (md); sm h-8 / xs h-7
    padding: 8px 12px # px-3 py-2
    border: '1px solid {colors.gray-300}'
    backgroundColor: '{colors.surface}'
    shadow: '{shadows.sm}'
    focus: 'border {colors.primary-500} + ring-2 {colors.primary-500}'
    error: 'border {colors.negative-500}'
    disabled: 'bg {colors.gray-50}'
  checkbox:
    rounded: '{rounded.sm}'
    color: '{colors.primary-600}'
    focus: 'ring-2 {colors.primary-500} ring-offset-1'
  card:
    rounded: '{rounded.3xl}'
    backgroundColor: '{colors.surface}'
    overflow: hidden
    default: { shadow: '{shadows.elevation-1}' }
    elevated: { shadow: '{shadows.elevation-2}' }
    outlined: { border: '1px solid {colors.gray-200}' } # /70
    interactive: 'hover {shadows.elevation-3} + -translate-y-0.5'
    header: { padding: '20px 28px', borderBottom: '1px solid {colors.gray-100}' }
    body: { padding: '{spacing.card-padding}' }
    footer: { padding: '20px 28px', borderTop: '1px solid {colors.gray-100}', backgroundColor: '{colors.gray-50}' } # /60
  stats-card:
    rounded: '{rounded.xl}'
    backgroundColor: '{colors.surface}'
    border: '1px solid {colors.gray-100}'
    shadow: '{shadows.sm}'
    padding: '16px 20px' # px-5 py-4
    accentStrip: 'right edge w-0.5 + border-r-2 in tone-500 (RTL)'
    iconTile: '40x40 rounded-lg, bg tone-50 text tone-500'
    value: 'text-lg font-bold tabular-nums, color tone-700'
    selected: 'ring-2 {colors.primary-400}'
    variants: 'blue(info) | green(positive) | red(negative) | orange(warning) | purple(violet) | neutral(gray)'
  badge:
    rounded: '{rounded.full}'
    typography: text-xs / medium
    sizes: '3xs | 2xs | xs | sm(default) | md' # 3xs/2xs use text-3xs/2xs px-pinned sizes
    filled: 'bg {tone}-100 text {tone}-800' # neutral=gray-100/gray-800
    signal: 'leading dot + bg {tone}-50 text {tone}-700; ring=true adds ring-1 ring {tone}-200 (soft = no ring)'
    removable: 'bg {colors.primary-50} text {colors.primary-800} border {colors.primary-200} + X button'
    tones: 'neutral | info | positive | warning | negative'
    statusBadge: 'StatusBadge = Badge driven by (status, getLabel, variantMap, defaultVariant); no own styling'
  table:
    container: 'composed inside a Card (rounded-3xl), table itself border-collapse'
    header:
      {
        backgroundColor: '{colors.gray-50}',
        textColor: '{colors.gray-500}',
        font: 'text-[11px] font-semibold uppercase tracking-wider',
        padding: '8px 12px',
      }
    rowDivider: '1px {colors.gray-200}' # divide-y
    cell:
      { padding: '8px 12px', font: 'text-sm', textColor: '{colors.gray-700}', edgePadding: 'first ps-5 / last pe-5' }
    rowHoverClickable: 'bg {colors.primary-50} (/60) + inset -3px {colors.primary-400} bar'
    rowHoverStatic: 'bg {colors.gray-50} (/80)'
  modal:
    rounded: '{rounded.xl}'
    backgroundColor: '{colors.surface}'
    maxWidth: 'max-w-xl' # dialog variant: max-w-sm
    maxHeight: '92vh'
    shadow: '{shadows.overlay}'
    header: { padding: '16px 24px', borderBottom: '1px solid {colors.gray-100}' }
    footer: { padding: '16px 24px', borderTop: '1px solid {colors.gray-100}' }
    backdrop: 'black/30'
    dismiss: 'Escape closes; backdrop click does NOT (modal). Dialog variant: backdrop black/40.'
  drawer:
    backgroundColor: '{colors.surface}'
    position: 'fixed inset-y-0 right-0 (RTL inline-start)'
    width: 'w-full max-w-md'
    rounded: none
    shadow: '{shadows.drawer}'
    header: { padding: '16px 24px', borderBottom: '1px solid {colors.gray-100}' }
    footer: { padding: '16px 24px', borderTop: '1px solid {colors.gray-200}' }
  alert:
    rounded: '{rounded.xl}'
    padding: '16px' # p-4, gap-4; small: p-2.5 gap-2.5
    border: '1px solid'
    shadow: '{shadows.sm}'
    iconTile: 'rounded-lg p-2 (sm: rounded-md p-1), bg tone-100'
    variants:
      info: 'gradient from {colors.primary-50} to cyan-50, border {colors.primary-200}, text primary-900'
      success: 'gradient from {colors.positive-50} to emerald-50, border positive-200, text positive-800'
      warning: 'gradient from orange-50 to amber-50, border orange-200, text orange-900'
      error: 'gradient from {colors.negative-50} to rose-50, border negative-200, text negative-800'
      neutral: 'bg {colors.gray-50}, border {colors.gray-200}, no shadow'
  progress-bar:
    track: 'rounded-full {colors.gray-100}, h-1.5 (sm) / h-2 (md)'
    fill: 'rounded-full {colors.primary-500}, transition 700ms'
  spinner:
    style: 'rounded-full border-2 {colors.gray-200}, top border {colors.primary-600}, animate-spin'
    sizes: '16 / 24 / 32 px'
  skeleton:
    pulse: 'animate-pulse bg {colors.gray-100}'
    shimmer: 'gradient gray-200/100/200, animate-shimmer 2s'
  tooltip:
    backgroundColor: '{colors.gray-900}'
    textColor: '#FFFFFF'
    rounded: '{rounded.lg}'
    padding: '6px 10px' # px-2.5 py-1.5
    font: 'text-xs / medium'
    shadow: 'shadow-lg'
    placement: 'portal, prefers above trigger, 8px gap'
  divider:
    color: '{colors.gray-200}'
    thickness: 1px
  chip:
    rounded: '{rounded.full}'
    typography: text-xs / medium
    base: 'inline-flex border, transition; aria-pressed toggle'
    sizes: 'xs (px-2 py-0.5) | sm (px-3 py-1, default)'
    tones: 'neutral | primary | warning | orange | purple | rose'
    selectedExample: 'primary = border-primary-300 bg-primary-100 text-primary-800 + shadow-sm'
    idle: 'border-gray-200 bg-gray-50 text-gray-600 (hover gray-100); orange/purple/rose idle = borderless muted'
    count: 'optional trailing count pill (text-3xs); selected = bg-white/50'
  chip-label:
    note: 'NON-interactive sibling of Chip (<span>) — rounded (not full), font-semibold, same tone palette; labels/tags'
  segmented-control:
    note: 'SegmentedControl + SegmentedControlItem; aria-current (not role=tab) unless adopter drives aria-pressed'
    variants: 'underline (DetailTabPanel, primary underline bar) | tabBar (border-b-2 + count badge) | boxed (bordered rounded-xl strip) | choice (default, pill chips w/ ring) | vertical (stacked) | switch (toggle on gray-100, rounded-nav items, active=white+shadow)'
  action-surface:
    note: 'ActionSurfaceLink (Link, intent=navigate) vs ActionSurfaceButton (Button, intent=act) — pick by intent, not looks; enabled both = footgun'
    variants:
      tile: 'flex-col bg-slate-50 rounded-xl p-3.5 font-semibold; hover border-primary-200 + white + elevation-1'
      compact: 'rounded-md px-3 py-2 hover gray-50'
      row: 'justify-between rounded-lg bg-white/60; hover white/90'
      plainRow: 'justify-between, no bg; hover slate-50'
      card: 'rounded-xl border gray-200 bg-white p-5 shadow-sm; hover -translate-y-0.5 + shadow-md'
      timelineGroup: 'pill, border slate-200 bg-slate-100 text-xs font-semibold'
  inline-link:
    note: 'In-flow <a> text link: text-primary-600, hover underline, focus-ring; optional icon start/end (default end)'
  carousel-dots:
    note: 'state indicator; active = w-4 h-1.5 pill bg-primary-500, idle = h-1.5 w-1.5 dot bg-slate-200; aria-current on active'
  dismiss-backdrop:
    note: 'BEHAVIORAL, not visual — invisible bg-black/20 click-catcher button to dismiss mobile overlays (placement=mobileBelowHeader, md:hidden). No demo card.'
---

## Overview

YM Tax CRM is a focused internal operations system for a Hebrew-speaking tax advisory office: practical, structured, quiet, trustworthy. The dominant experience is a dense CRM workspace where staff scan client, binder, billing, VAT, tax-deadline, reminder, signature, and report data all day.

The visual identity is **light and white-first**. The application chrome is a light top navigation bar over pale slate backgrounds and white data surfaces — there is no dark sidebar rail in the main shell. **Blue (`#007aff`)** is the primary interaction color, **indigo** is the informational semantic tone, and status colors (positive=emerald, warning=amber, negative=red) are reserved for operational meaning. Amber appears only as the `warning` tone — there is no standalone decorative accent color.

The interface is **RTL-first**. Layout rhythm, alignment, icon placement, drawers, accent strips, and table reading order preserve Hebrew ergonomics. Product copy is Hebrew; occasional English brand snippets may appear in chrome.

> **Source of truth:** these are the values actually implemented in `src/index.css` (`@theme`) and the primitives under `src/components/ui`. Where prose and code disagree, the code wins. Regenerate this file from the code rather than hand-editing values.

## Colors

The palette is built from a **blue primary ramp**, the default Tailwind **gray** neutrals, and four semantic ramps (info=indigo, positive=emerald, warning=amber, negative=red). There is no separate `accent` ramp — amber is the `warning` tone.

- **Blue primary (`primary-600` `#007aff`):** main actions, focus rings (`#007aff`), selected rows/cards (`ring-primary-400`), clickable table-row hover (`primary-50`), active filter pills. Hover steps to `primary-700`, active to `primary-800`.
- **Amber = warning tone:** amber (`#f59e0b` and ramp) is the `warning` semantic color — cautionary states, attention badges, the warning Alert gradient. It is not a brand action color and has no decorative-accent role outside operational meaning.
- **Indigo = info tone:** informational badges, info stat cards, info alerts. Do not confuse it with the blue primary.
- **Semantic ramps:** positive = emerald (success), warning = amber (attention), negative = red (error/validation), info = indigo. Each ramp uses `-50/-100` for tinted containers, `-500` for solid marks, `-700/-800` for text.
- **Gray neutrals:** standard Tailwind `gray` ramp carries borders (`gray-100/200/300`), muted text (`gray-500/600`), and surfaces. Body background is `gray-50` (`#f9fafb`); base text is `#0f172a`.

Backgrounds stay light throughout the authenticated app. Subtle gradients appear only in alerts (two-tone tinted). The login/auth screens use a warm off-white brand surface (`--color-surface-warm` `#f7f6f2`). No dark cards inside the main content area.

**Neutrals are two-role:** `gray` carries surfaces, borders, and dividers; `slate` carries text (consistent with the slate-900 body text color `#0f172a`). Both are Tailwind defaults — neither is redefined in `@theme`.

**Data-viz:** charts reference the semantic ramps via `var(--color-*)` for status colors, plus two dedicated neutrals — `--color-chart-track` (`#eef0f3`, ring track) and `--color-chart-muted` (`#cbd5e1`, the "not started / none" segment). Never hardcode chart hex.

## Typography

Use **Heebo** everywhere — display, body, and "mono". `.font-mono` is Heebo with `tabular-nums`; there is no second font family. The root `html` font-size is **100%** (browser default); `text-2xs`/`text-3xs` are pinned in px so they stay fixed regardless.

There is no bespoke type-scale token set; sizing uses Tailwind utilities:

- `text-3xs` / `text-2xs` (10px / 11px): dense metadata, uppercase table headers, and eyebrows. Pinned in px so they stay fixed regardless of root scale.
- `text-xs` (12px): badges, metadata, tooltips.
- `text-sm` (14px): the workhorse — body, buttons, inputs, table cells.
- `text-base` (16px): occasional body.
- `text-lg` (18px): card titles, default stat value.
- `text-xl` (20px): compact stat value.

Weights: `medium` (500) for buttons/labels/badges, `semibold` (600) for table headers and section labels, `bold` (700) for stat values. Financial amounts, counts, dates, VAT totals, and day counters use `tabular-nums`. Avoid negative letter spacing; table headers use positive `tracking-wider`.

## Layout

Fixed operational shell: a **light top Navbar** (`h-16`, white, bottom border), an optional collapsible **ClientSidebar** for the client list, a scrollable content area, and a page inset. Content fills available width rather than sitting in marketing-style centered sections.

Use the 4px Tailwind spacing base with 8px rhythm for controls. Pages compose from cards, table cards, filter bars, stat rows, and right-side drawers. Card bodies use `p-7` (compact `p-5`); tables use tight `px-3 py-2` cells; overlays use `px-6 py-4` header/footer.

- Grids for KPI/stat cards and dashboard summaries.
- Tables for repeated operational entities.
- Drawers (right side, `max-w-md`) for detail/edit without leaving list context.
- Modals (`max-w-xl`, centered) for creation, confirmation, and bounded forms.
- Filters, bulk actions, and pagination stay visibly tied to their table.

Do not build landing-page hero compositions for internal screens. The first authenticated screen exposes useful work data immediately.

## Elevation & Depth

Depth is restrained and **slate-tinted** (`rgba(15,23,42,…)`), not colored. Most hierarchy comes from borders, pale backgrounds, spacing, and semantic accent strips rather than heavy shadows.

- `elevation-1` — default cards.
- `elevation-2` — elevated cards.
- `elevation-3` — interactive-card hover (paired with a `-translate-y-0.5` lift).
- `shadow-sm` — stat cards, inputs, primary/danger buttons.
- `shadow-xl` / `shadow-2xl` — modals / drawers, which sit above the shell.

Stat cards and clickable table rows express state with a **right-edge accent bar** (RTL inline-start visually on the right) rather than shadow.

## Shapes

- **Buttons & pills:** fully rounded (`rounded-full`). The `link` button is the exception (`rounded-sm`).
- **Inputs, tooltips, stat icon tiles, alert icon tiles:** `rounded-lg` (8px).
- **Stat cards, modals, alerts, group sections:** `rounded-xl` (12px).
- **The Card primitive container:** `rounded-3xl` (24px) — the softest shape in the system; tables and most panels live inside it.
- **Drawers:** square (full-height right panel).
- **Badges / progress / avatar:** fully rounded.

Keep precise, not playful. The large `rounded-3xl` card paired with small `rounded-lg` inputs is intentional.

## Components

**Buttons** are `rounded-full`, `text-sm`, `font-medium`, `px-4 py-2` (md) / `px-3 py-1.5` (sm), with a 2px `focus-ring` and 200ms transitions. Primary = `primary-600` (hover 700 / active 800) with `shadow-sm`; secondary = `gray-100`; outline = white + `gray-300` border; ghost = text-first with gray hover; danger = `negative-600`; link = underlined gray text. Loading shows a spinning ring and disables the button.

**Inputs** are white, `rounded-lg`, `h-9` (`px-3 py-2`), `gray-300` border with `shadow-sm`. Focus is blue (`border-primary-500` + `ring-2 ring-primary-500`). Errors use `border-negative-500`. Checkboxes use `primary-600` with a `primary-500` focus ring. Validation copy uses the negative ramp.

**Cards** are the main containers: `rounded-3xl`, white, `overflow-hidden`. Default = `elevation-1`, elevated = `elevation-2`, outlined = `gray-200/70` border. Headers (`px-7 py-5`) have a bottom `gray-100` border; bodies use `p-7` (compact `p-5`); footers add a `gray-50/60` tint. Interactive cards lift on hover.

**Stat cards** are `rounded-xl`, white, `gray-100` border, `shadow-sm`, with a right-edge accent strip and a `40×40 rounded-lg` icon tile tinted by tone. Values are `font-bold tabular-nums` and animate-count on mount. Variants: blue(info), green(positive), red(negative), orange(warning), purple(violet), neutral(gray). Selected state = `ring-2 ring-primary-400`. Optional progress bar and trend pill.

**Badges** are `rounded-full` `text-xs` pills in three modes: filled (`tone-100` / `tone-800`), signal (`tone-50` / `tone-700` + `ring-1` + leading dot, for urgency/timeline), and removable filter pills (`primary-50` / `primary-800` + X). Tones: neutral, info, positive, warning, negative.

**Tables** are high-density and live inside a Card. Headers are `gray-50`, `text-[11px]`, `font-semibold`, `uppercase`, `tracking-wider`, muted. Rows use `divide-y gray-200`; clickable rows hover `primary-50/60` with an inset `primary-400` edge bar; static rows hover `gray-50/80`. Cells are `px-3 py-2 text-sm text-gray-700` with `ps-5/pe-5` edge padding.

**Modals** are centered, `rounded-xl`, white, `max-w-xl`, capped at `92vh`, `shadow-xl`, with `px-6 py-4` header/footer bordered in `gray-100`. Escape closes; backdrop click does not (the bounded `dialog` variant is `max-w-sm`). **Drawers** slide from the right (`fixed inset-y-0 right-0`, `w-full max-w-md`), square corners, `shadow-2xl`, sticky bordered header/footer.

**Alerts** are `rounded-xl`, bordered, `p-4`, with a tone-tinted `rounded-lg` icon tile and a subtle two-tone gradient background (info = blue→cyan, success = positive→emerald, warning = orange→amber, error = negative→rose, neutral = flat gray).

**Feedback:** Spinner = `border-2 gray-200` ring with a `primary-600` top arc. Skeleton = `animate-pulse gray-100` or a shimmer gradient. Tooltip = portalled `gray-900` bubble, white `text-xs`, `rounded-lg`, prefers above the trigger. Divider = 1px `gray-200` rule.

**Interactive surfaces & links.** Beyond `Button`, the system has lighter-weight clickable primitives. **Chips** (`rounded-full`, `text-xs`, `aria-pressed`) are toggle filters across six tones; **ChipLabel** is their non-interactive `rounded` sibling for tags. **SegmentedControl** covers six layouts — `underline` (the `DetailTabPanel` tab bar with a `primary` underline), `tabBar`, `boxed`, `choice` (default pill chips), `vertical`, and `switch` (a `gray-100` toggle whose active item is white + `shadow-sm`); it exposes `aria-current` rather than claiming `role="tab"`. **ActionSurface** is a clickable container chosen by _intent_ — `ActionSurfaceLink` for navigation, `ActionSurfaceButton` for actions — in `tile`/`compact`/`row`/`plainRow`/`card`/`timelineGroup` variants. **InlineLink** is an in-flow `primary-600` text link (underline on hover, optional icon). **CarouselDots** indicate position (active = `primary-500` pill, idle = `slate-200` dot). **DismissBackdrop** is a behavioral, invisible `black/20` click-catcher that dismisses mobile overlays — it has no visual demo card.

## Do's and Don'ts

- Do treat the implemented code as the source of truth; regenerate this file from `@theme` + primitives when they change.
- Do use **blue `primary-600`** for actions, selection, and focus — not indigo.
- Do keep the app light and white-first; the main shell is a **top Navbar**, not a dark sidebar.
- Do use Hebrew-first RTL alignment and right-edge accent strips for stat cards and clickable rows.
- Do keep semantic ramps meaningful and consistent (info=indigo, positive=emerald, warning=amber, negative=red).
- Do use the big `rounded-3xl` only for the Card container; smaller widgets stay at `rounded-lg`/`rounded-xl`; buttons stay `rounded-full`.
- Do use borders, pale fills, and slate-tinted shadows before adding heavy elevation.
- Don't reintroduce indigo as "primary" — indigo is the info tone.
- Don't describe a dark navigation rail; the product navigation is a light top bar.
- Don't claim indigo-tinted shadows; elevation tints are slate (`rgba(15,23,42,…)`).
- Don't treat amber as a decorative brand accent; it is the `warning` semantic tone only, not an action color.
- Don't introduce a second font family or negative letter spacing.
