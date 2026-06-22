# Design System Dashboard

Static, dependency-free showcase of the YM Tax CRM design language.
Hebrew-first, RTL, Heebo. Values mirror the **implemented code** —
`../src/index.css` (`@theme`) and `../src/components/ui` primitives — which is
the source of truth (see `../DESIGN.md`). If a value drifts, regenerate from the code.

Reflects the real app: blue `#007aff` primary, a **light top navbar** (not a dark
sidebar), `rounded-full` buttons, `rounded-3xl` cards, slate-tinted shadows,
and indigo as the `info` tone.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
npx serve frontend/design-system
```

## File architecture

```
design-system/
├── index.html          # markup only — structure + content, no inline CSS rules
├── README.md           # this file
├── css/
│   ├── tokens.css      # :root design tokens (colors, radius, shadow, motion) — single source
│   ├── base.css        # reset, body, typography scale helpers (.t-*)
│   ├── layout.css      # app shell: sidebar, topbar, content, section scaffold
│   └── components.css   # reusable widgets, one block per primitive
└── js/
    └── nav.js          # scroll-spy: active sidebar item
```

Load order matters: `tokens → base → layout → components`.
Each component block in `components.css` maps to a primitive in
`src/components/ui/primitives` (Button, Badge, Card, ProgressBar, …).

## Sections (full UI library coverage)

- **Foundations** — colors (full ramps + chart/warm) · typography (incl. text-2xs/3xs) · shapes/radius (incl. nav/tile).
- **Primitives** — Button · Badge / StatusBadge · MonoValue · Divider · ProgressBar · Tooltip.
- **Forms** — Input · Textarea · Select · DatePicker · PasswordInput · Checkbox · FormField (label+error).
- **Pickers** — DatePickerCalendar (popover) · SelectDropdown (multi-select) · DatePickerInlineSelect.
- **Filters & search** — FilterPanel · ClientSearchInput / ClientPickerField · SearchFilter.
- **Data & structure** — StatsCard · Card · SectionHeader · DefinitionList · GroupSection · Tabs (DetailTabPanel) · DataTable.
- **Table chrome** — ToolbarContainer · ActiveFilterBadges · PaginationCard · BulkSelectionToolbar · RowActions.
- **Grouping** — MonthlyAccordionGroup · GroupedPeriodRow.
- **App chrome** — Breadcrumbs (PageHeader) · NavbarPrimaryNav + NavbarMoreMenu · NotificationBell · Avatar · ClientSidebarClientCard.
- **Overlays** — Modal · ConfirmDialog · UnsavedChangesGuard · DetailDrawer (DrawerSection/DrawerField) · ModalFormActions.
- **Feedback & states** — Alert · StateCard · InlineState · TableSkeleton · Spinner · PageLoading · AppErrorBoundary · Timeline.

Every **visual** component under `src/components/` (ui · layout · shared · errors) is represented.
Not shown — purely behavioral/composition with no distinct visual surface: OverlayContainer/Portal,
PageStateGuard, PageLayout/PageContent, PaginatedDataTable (DataTable+PaginationCard), columnRenderers,
commonColumns, tableSelection.

## Editing

- Change a value once in `tokens.css`; everything downstream updates.
- Add a component: new block in `components.css` + new `<section>` + nav link in `index.html`.
