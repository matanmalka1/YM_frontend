# Design-System Reuse & Primitive-API Cleanup — Full Finding Catalog + Root-Fix Plan

## Context

A two-track audit ran on the YM Tax CRM frontend (`frontend/`): one track hunted **feature-level reinvention** (callers hand-rolling what a primitive already provides), the other audited **primitive prop/API completeness** (gaps that _force_ callers to reinvent). This document records **every** finding, its root cause, the root fix, and the **complete grepped caller list** for each, so execution can cover every call site with no drift left behind.

Source of truth for tokens/primitives: `src/index.css` `@theme` + `src/components/ui/**` (see memory `reference_design_system_source_of_truth`). The static demo (`design-system/`) hand-mirrors these and must be re-synced for any token/visual change.

Overall health: **good**. Selects, checkboxes, modals, spinners, buttons, date/money formatting already route through primitives in the vast majority of cases. Residue is concentrated and listed below.

Several findings are convergent: a missing primitive prop is the _root cause_ of a feature reinvention. Fixing the primitive once unlocks the caller conversions — those are the highest-value items (F1/Badge, F3/ProgressBar, F6/Modal).

---

## Finding catalog

Legend — Risk: 🟢 safe/mechanical · 🟡 additive API (no caller breaks) · 🔴 decision/visual/taste.
Batch: **1** safe now · **2** additive-prop + opportunistic reuse · **3** needs sign-off.

### F1 — Neutral chips reinvent Badge; Badge lacks `2xs` size · 🟡 Batch 2

- **Problem:** Hand-rolled `rounded-full bg-gray-100 px-2 py-1 text-2xs … text-gray-600` chips = a neutral Badge, but Badge's smallest size is `xs` (text-xs/12px); chips use `text-2xs` (11px).
- **Root cause:** `Badge` size scale = `xs|sm|md` only (`Badge.tsx:7,43-47`). No `2xs`.
- **Root fix:** Add `2xs` to `BadgeSize` + all size maps in `Badge.tsx` (`sizeClasses`, `signalSizeClasses`, `dotSizeClasses`, `removableSizeClasses`, `removeButtonSizeClasses`) → `px-2 py-0.5 text-2xs`. Then convert chip call sites to `<Badge variant="neutral" size="2xs">`.
- **Callers (convert):**
  - `features/tasks/components/list/TaskListColumns.tsx:45,49` (text-2xs)
  - `components/layout/ClientSidebar/ClientSidebarClientCard.tsx:32,38,42` (text-2xs)
  - `components/layout/ClientSidebar/ClientSidebar.tsx:213` (text-2xs, text-gray-500 → keep className tone override)
  - `features/vatReports/components/list/VatInvoiceTable.tsx:103` (text-xs, bg-gray-200 → `size="xs"` + className)
  - `components/ui/primitives/GroupSection.tsx:34` (primitive-internal count chip; convert to Badge for consistency)
- **Verify:** `tabular-nums`/`font-semibold` deltas preserved via `className` passthrough; visual diff on tasks list + sidebar.

### F2 — Inline `<select>`/checkbox/modal/spinner reinvention · ✅ none

- Confirmed clean by grep: no plain `<select>`, no raw labeled `type=checkbox`, no `fixed inset-0 bg-black` hand modals, both `animate-spin` hits are lucide `Loader2` (sanctioned). No action.

### F3 — Inline progress bars reinvent ProgressBar; ProgressBar uses raw class escape-hatch · 🟡 Batch 2

- **Problem:** Single-fill progress tracks hand-rolled instead of `<ProgressBar>`; and `ProgressBar` itself exposes raw `fillClassName`/`trackClassName` instead of a semantic `tone`.
- **Root cause:** `ProgressBar` (`ProgressBar.tsx:8-12`) has no `tone`. (Note: it _correctly_ documents that **stacked/segmented** bars compose plain divs — those are NOT drift.)
- **Root fix:** Add `tone?: 'primary'|'info'|'positive'|'warning'|'negative'|'neutral'` mapping to fill+track classes (keep `fillClassName`/`trackClassName` as override escape-hatch). Convert single-fill callers; reuse inside StatsCard.
- **Callers (convert single-fill):**
  - `features/reports/components/AgingReportCards.tsx:59` (single bar)
  - `components/ui/layout/StatsCard.tsx:195-202` (inline bar dup → use ProgressBar with `tone`)
- **Leave (sanctioned segmented):** `features/annualReports/components/season/SeasonProgressBar.tsx:16` (multi-segment flex bar — ProgressBar explicitly defers these to plain divs).
- **Verify:** `tsc`; visual diff aging report + any StatsCard with `progress`.

### F4 — Card primitive drift (inline container styling) · 🟢 Batch 1

- **Problem:** Inline `rounded-{xl,2xl,3xl} border border-gray-200 bg-white …` container instead of `<Card>`. Card primitive itself is GOOD (`title/variant/size/footer/disablePadding`).
- **Root cause:** Feature-side drift; two files even import Card AND hand-roll one.
- **Root fix:** Replace inline container with `<Card size="compact" className="shadow-sm">` (preserve existing shadow/padding per file).
- **Callers (in-app, convert):**
  - `features/reports/components/AgingReportCards.tsx` _(imports Card already)_
  - `features/annualReports/components/panel/AnnualReportOverviewSection.tsx` _(imports Card already)_
  - `features/annualReports/components/tax/TaxCalculationPanel.tsx`
  - `features/annualReports/components/financials/AnnualReportFinancialSection.tsx`
  - `features/annualReports/components/panel/AnnualReportFullPanel.tsx`
  - `features/vatReports/components/list/VatWorkItemSummaryBar.tsx`
  - `features/signatureRequests/components/shared/SignatureRequestsDashboardPanel.tsx`
  - `features/signatureRequests/components/list/SignatureRequestRow.tsx`
- **LEAVE (decided D1):** `features/signing/pages/SigningPage.tsx` — standalone **public** signing page outside the app shell; intentionally not converted.
- **Not drift (primitives/chrome using the style legitimately, leave):** `components/ui/overlays/ConfirmDialog.tsx`, `components/ui/primitives/GroupSection.tsx`, `components/ui/inputs/DatePickerCalendar.tsx`, `components/layout/Navbar/NavbarMoreMenu.tsx`, `components/layout/Navbar/Navbar.tsx`, `components/layout/ClientSidebar/ClientSidebar.tsx`.

### F5 — Raw money/number display instead of formatters · 🟢 Batch 1 (+verify)

- **Problem:** Hardcoded/`toFixed` money strings instead of `formatShekelAmount`/`formatCurrencyILS` (`utils/utils.ts`, see memory `reference_display_formatting_canonical`).
- **Root fix:** Route display through the canonical formatter.
- **Callers:**
  - `features/dashboard/components/panels/OpenChargesCard.tsx:28` — fallback `'₪ 0'` → `formatShekelAmount(0)`.
  - `features/vatReports/components/detail/VatClientSummaryStatsSection.tsx:11` — `.toFixed(2)` avg net VAT; verify rendered value → wrap in money formatter.
  - `features/vatReports/utils/vatHelpers.ts:74` — `(net+vat).toFixed(2)`; verify consumer formats it.
- **Exempt (leave):** `MultiYearPLChart.tsx:59` (chart K-tick), `advancePaymentUtils.ts:15`/`advancePaymentComponentUtils.ts:36` (calc/form-value strings), `taxHelpers.ts:79` (`₪12,060` is fixed legal-copy text).

### F6 — `Modal.footer` required (sibling Drawer's is optional) · 🟡 Batch 2

- **Problem:** `Modal` requires `footer`; one caller passes `footer={null}` just to satisfy the type. `DetailDrawer.footer` is already optional.
- **Root cause:** `Modal.tsx:11` `footer: React.ReactNode` (no `?`).
- **Root fix:** `footer?: React.ReactNode`; render footer region only when provided. Remove the boilerplate.
- **Callers:** `features/annualReports/components/shared/ClientYearComparisonModal.tsx:23` (drop `footer={null}`). All 25 other `<Modal>` callers pass real footers — unaffected (backward-compatible).

### F7 — `OverlayContainer` close button uses literal `✕` glyph · 🟢 Batch 1

- **Problem:** Core overlay renders a text `✕` instead of the lucide `X` used everywhere else (Badge, Alert, ClientSearchInput) — visual + a11y drift.
- **Root fix:** Replace `✕` with `<X className="h-4 w-4" />` (lucide), ensure `aria-label` on the button.
- **Callers:** `components/ui/layout/OverlayContainer.tsx:103,156` (2 sites, 1 file). Affects every Modal/Drawer close button.

### F8 — `FormField` doesn't set `aria-invalid` / `aria-describedby` · 🟡 Batch 2

- **Problem:** Error `<p>` not linked to the control; control gets no `aria-invalid`. Affects every input built on FormField (Input, Textarea, Select, PasswordInput).
- **Root cause:** `FormField.tsx:14-25` clones child with `id` only.
- **Root fix:** Generate `errorId`; when `error`, clone child with `aria-invalid: true` + `aria-describedby: errorId`, and give the error `<p>` `id={errorId}`. One fix, zero caller changes.
- **Callers:** none (internal). Benefits all FormField consumers transitively.

### F9 — `SelectDropdown` lacks `error`/`aria-invalid`/`placeholder` · 🟡 Batch 2

- **Problem:** Custom dropdown has no error styling parity with native branch; placeholder hardcoded `'בחר...'`.
- **Root cause:** `SelectDropdown.tsx` (border smuggled via `className` from `Select.tsx:65`); placeholder hardcoded `SelectDropdown.tsx:83`.
- **Root fix:** Add `error?: boolean` (apply negative border + `aria-invalid`) and `placeholder?: string` (default `'בחר...'`). Wire `Select` to pass `error`/`placeholder` to both branches.
- **Callers:** `<SelectDropdown>` direct: `features/vatReports/components/list/VatInvoiceEditRow.tsx:111`. Via `<Select>`: 40 files (additive — no breaks). `<Select error=>` today: e.g. `features/annualReports/components/shared/CreateReportModalParts.tsx:89`.

### F10 — `Button` size scale too narrow; no icon-only mode · 🔴 Batch 3

- **Problem:** Sizes `sm|md` both `text-sm`; callers fake small with `className="text-xs"`. No square/icon-only mode (icon buttons use `size="sm"` + `aria-label`).
- **Root cause:** `Button.tsx:23-24`.
- **Root fix:** Add `xs` size (`text-xs`, tighter padding); optionally `iconOnly?: boolean` (square padding, requires `aria-label`).
- **Callers (text-xs fakers → `size="xs"`):** `features/search/components/SearchFiltersBar.tsx:109`, `features/annualReports/components/financials/FinancialLineFormParts.tsx:20`, `features/annualReports/components/panel/ReportAlertBanners.tsx:47`.
- **icon-only (broad; optional):** e.g. `features/binders/components/sections/BinderDocumentsSection.tsx:73` and most RowActions icon buttons.

### F11 — StatsCard variant uses color-names, not semantic tones · 🔴 Batch 3

- **Problem:** `StatVariant = 'blue'|'green'|'red'|'orange'|'purple'|'neutral'` (`StatsCard.tsx:6`) while Badge/Alert/StateCard use semantic tones. Three vocabularies for one concept.
- **Root cause:** Historical naming; `purple`→violet has **no** semantic equivalent (sanctioned StatsCard accent per memory).
- **DECIDED: FULL RENAME** (see Batch 3 follow-up for exact mapping + grep).
- **Callers (~16 helpers passing `variant: 'blue' as const` etc.):** every `*StatsSection.tsx` / stats helper, e.g. `features/clients/components/list/ClientsStatsSection.tsx`, `charges/.../ChargesStatsSection.tsx`, `workQueue/.../WorkQueueStatsSection.tsx`, `annualReports/.../*StatsSection.tsx`, `taxDashboard/helpers.ts`, `binders/.../BindersStatsSection.tsx`, `advancedPayments/.../*StatsSection.tsx`, `reports/components/AgingReportHeader.tsx`, etc. (full set: 16 files via `<StatsCard>`).

### F12 — `PaginatedDataTable` page-size props are dead · 🔴 Batch 3

- **Problem:** Callers wire `onPageSizeChange`/`pageSizeOptions`, but `PaginationCard` renders **no** page-size selector, and the props aren't forwarded → handler never fires. `maxHeight` also dropped from the DataTable Pick.
- **Root cause:** `PaginatedDataTable.tsx:7-18,27,30` declares props; `PaginationCard.tsx` has no selector.
- **DECIDED: REMOVE dead props** (see Batch 3 follow-up).
- **Callers wiring the dead handler:** `features/clients/hooks/useClientsPage.ts:188` + `clients/pages/ClientsPage.tsx:75`; `charges/components/list/ChargesTableBlock.tsx:24,43,69` + `charges/hooks/useChargesPage.ts:146` + `charges/pages/ChargesPage.tsx:68`; `users/pages/UsersPage.tsx:67` + `users/hooks/useUsersPage.ts:162`.

### F13 — `StatusBadge` drops Badge's `dot`/`ring`/`onClick` · 🟡 Batch 3

- **Problem:** Thin generic over Badge (`StatusBadge.tsx:23-27`) can't render signal-dot/clickable status badges without falling back to raw Badge.
- **Root fix:** Forward `dot?`/`ring?`/`onClick?` (or accept `badgeProps`).
- **Callers (~13, additive — no breaks):** `clients/constants.ts`, `clients/.../ClientBusinessesCard.tsx`, `clients/pages/ClientDetailsPage.tsx`, `tasks/utils/taskDisplay.ts`, `tasks/.../ClientTasksTab.tsx`, `tasks/.../TaskListColumns.tsx`, `charges/.../ChargeDetailDrawer.tsx`, `vatReports/.../VatWorkItemHeaderActions.tsx`, `binders/.../BinderDetailsPanel.tsx`, `binders/.../BinderIntakesSection.tsx`, `signatureRequests/.../SignatureRequestsDashboardPanel.tsx`, `signatureRequests/.../SignatureRequestRow.tsx`, `signatureRequests/.../SignatureRequestAuditDrawer.tsx`, `advancedPayments/.../ClientAdvancePaymentsCards.tsx`.

### F14 — `Tooltip.text` / `Alert.message` are `string`-only · 🟡 Batch 3

- **Root fix:** Widen `Tooltip.text` (`Tooltip.tsx:16`) and `Alert.message` (`Alert.tsx:5`) to `React.ReactNode`; add `Tooltip` `placement?`. Decouple `Alert.onRetry` styling from the negative/red palette (`Alert.tsx:83-91`) so a warning-alert retry isn't red.
- **Callers:** Tooltip (5 refs total), Alert `onRetry` (5 files: `tasks/.../ClientTasksTab.tsx`, `tasks/.../TasksListPanel.tsx`, `tasks/pages/TasksPage.tsx`, `authorityContacts/.../AuthorityContactsCard.tsx`, `authorityContacts/.../AuthorityContactsListCard.tsx`). Additive — no breaks.

### F15 — `DatePicker`: no `minDate`; `compact` boolean vs `size` convention · 🟡/🔴 Batch 3

- **Root fix:** Add `minDate?: Date` (mirror `maxDate`). Optionally rename `compact` → `size?: 'sm'|'md'` for cross-primitive consistency.
- **Callers (compact):** `features/users/components/detail/AuditLogsDrawer.tsx:76,77` (only). `minDate` additive.

### F16 — `DrawerField` duplicates `DefinitionList` (stacked) · 🔴 Batch 3 (undecided)

- **Problem:** `DrawerPrimitives.tsx:8-13` ≈ `DefinitionList.tsx:47-54` — two APIs for one layout.
- **Root fix:** Consolidate `DrawerField` onto `DefinitionList layout="stacked"` (or make DrawerField a thin re-export). **Confirm appetite before doing — migrates 7 callers.**
- **Callers (7, would need migration):** `invoices/.../ChargeInvoiceSection.tsx`, `charges/.../ChargeDetailDrawer.tsx`, `binders/.../BinderDetailsPanel.tsx`, `signatureRequests/.../SignatureRequestAuditDrawer.tsx`, `advancedPayments/.../AdvancePaymentDrawer.tsx`, `advancedPayments/.../AdvancePaymentReadonlySections.tsx`, `notifications/.../NotificationDetailDrawer.tsx`.

### F17 — `TimelineEntry` dot color hardcoded (no `tone`) · 🟡 Batch 3

- **Root fix:** Add `tone?: 'default'|'success'|'warning'|'error'` on `TimelineEntry` (`Timeline.tsx:32`).
- **Callers (timeline + audit/status timelines):** `features/timeline/components/*`, `binders/.../BinderAuditSection.tsx`, `binders/.../BinderIntakesSection.tsx`, `users/.../AuditLogsDrawer.tsx`, `signatureRequests/.../SignatureRequestAuditDrawer.tsx`, `annualReports/.../{FilingTimelineTab,TimelineEvent,StatusAuditTimeline,UpcomingDeadlinesList}.tsx`. Additive.

### F18 — `Checkbox` `className` and `inputClassName` both target the input · 🟢 Batch 1 (tiny)

- **Problem:** For the labeled variant, bare `className` lands on the `<input>` instead of the container — confusing precedence (`Checkbox.tsx:37-38`).
- **Root fix:** In labeled mode route `className` to the container; keep `inputClassName` for the input (it's used). Minimal, verify the 2 callers.
- **Callers of `inputClassName`:** `features/binders/.../BinderReceivePanel.tsx:243`, `features/binders/.../BinderHandoverPanel.tsx:101` (`mt-0.5`). No caller relies on bare `className` hitting the input.

### F19 — Minor API smells (note only, no callers to change) · 🔴 Batch 3 / accept

- `Badge.removable` ignores `variant` (always primary palette) — can't have a removable error/warning badge (`Badge.tsx:86-108`).
- `Badge.dot` takes a raw class string (leaky) (`Badge.tsx:13`).
- `MonoValue` uses `tone` (naming drift vs `variant`) and bakes domain day-thresholds 60/90 into a generic primitive (`MonoValue.tsx:22-27`) — consider a feature wrapper / `thresholds` prop. Callers: `vatReports/.../VatPeriodCard.tsx`, `binders/.../BinderDetailsPanel.tsx`, `binders/.../BindersColumns.tsx`, `annualReports/.../AnnualReportVatAutoPopulateResultPanel.tsx`.
- `GroupSection.collapsible` uncontrolled-only (1 caller: `annualReports/.../AnnualReportOverviewSection.tsx`).
- Cross-cutting size-scale divergence (`xs|sm|md` vs `sm|md` vs `sm|md|lg`): a shared `Size` type would surface gaps but is a broad refactor — accept/track, do not force now.

---

## Cross-cutting root themes

1. **Size scales unaligned** across Button/Input/Textarea/Badge/Spinner/Checkbox → drives F1, F10. Adopt a documented `xs|sm|md` minimum where each applies; add missing `xs`/`2xs` per finding (not a global forced rename).
2. **`variant` vs `tone` vs color-name** vocabulary → F3, F11, F17, MonoValue. Converge new/changed props on **semantic tone names**; keep sanctioned exceptions (StatsCard purple, Alert orange).
3. **`className` escape-hatch doing real work** → F3 (ProgressBar), F9 (SelectDropdown error border). Promote to real props.

---

## Execution scope (decided) — **execute Batch 1 + Batch 2 now**

**Batch 1 — safe, no API change (🟢):** F4 (**8 in-app** Card conversions; **leave `SigningPage` as-is** per D1), F5 (money formatters), F7 (lucide `X`), F18 (Checkbox className routing). Each independently verifiable.

**Batch 2 — additive primitive props + opportunistic reuse (🟡, backward-compatible):** F1 (Badge `2xs` + chip conversions), F3 (ProgressBar `tone` + 2 conversions; leave segmented SeasonProgressBar), F6 (Modal `footer?`), F8 (FormField a11y), F9 (SelectDropdown `error`/`placeholder`).

### Resolved decisions baked into the above

- **D1 — SigningPage (F4): LEAVE AS-IS.** Convert only the 8 in-app files.

---

## Batch 3 — FOLLOW-UP (start a NEW separate plan later; do NOT execute in this pass)

These are API-surface / taste changes. When ready, open a fresh plan covering the items below. Decisions already made by the user are locked in — carry them into that plan verbatim:

- **F11 — StatsCard variant → semantic tones: FULL RENAME (locked).** Change `StatVariant` to `info|positive|negative|warning|purple|neutral` (map blue→info, green→positive, red→negative, orange→warning; keep `purple` = sanctioned violet accent, `neutral`). Then migrate **all ~16** stat-section helpers' `variant: '<color>' as const` literals to the tone names. Grep entry point: `grep -rn "variant: '" features/**/+*StatsSection*` and every `<StatsCard>` caller listed in F11. Update memory `reference_design_system_source_of_truth` if naming convention is documented.
- **F12 — PaginatedDataTable dead props: REMOVE (locked).** Delete `onPageSizeChange`/`pageSizeOptions` from `PaginatedDataTable` props; unwire the 3 features (clients/charges/users — exact lines in F12). Add `maxHeight` to the DataTable `Pick` while there. No behavior change (selector never rendered).
- **F10 — Button:** add `xs` size; consider `iconOnly` (3 text-xs faker call sites in F10; icon-only is broad).
- **F13 — StatusBadge:** forward `dot`/`ring`/`onClick` (~13 callers, additive).
- **F14 — Tooltip/Alert:** widen `text`/`message` to `ReactNode`; add Tooltip `placement`; decouple `Alert.onRetry` styling from red.
- **F15 — DatePicker:** add `minDate`; optionally rename `compact`→`size` (1 caller: AuditLogsDrawer:76,77).
- **F16 — DrawerField (undecided):** consolidate onto `DefinitionList layout="stacked"` (migrate 7 callers in F16) — confirm appetite first.
- **F17 — TimelineEntry:** add `tone` for dot color (callers in F17).
- **F19 — notes/accept:** Badge.removable-respects-variant, Badge.dot tokenization, MonoValue tone/threshold, GroupSection controlled mode, global size-scale type. Mostly accept or low-value.

Follow-up verification mirrors this plan's Verification section (typecheck/lint/arch:check/test + RTL visual diff + demo sync).

---

## Verification (per batch)

- After each batch: `npm run typecheck`, `npm run lint`, `npm run arch:check`, `npm run test`.
- Visual diff (Hebrew RTL) on touched surfaces: tasks list + client sidebar (F1), aging report / StatsCard progress (F3), the 8 Card-converted panels (F4), any Modal close button (F7), a form with an error (F8/F9).
- `npm run build` to confirm CSS/util utilities resolve (e.g. new Badge `2xs`, ProgressBar `tone` classes emit).
- Keep the static demo (`design-system/`) in sync if any new visual token/size class is introduced (Badge `2xs`, ProgressBar `tone`).
- No business logic, routes, or RTL behavior changes anywhere.
