# Frontend Component Drift Audit

## Existing Worktree Changes

`git -C frontend status --short` before writing this report:

This audit is read-only for application code. The only file added by this task is `frontend/component-drift-audit.md`.

The applicable instructions read were:

- `docs/AGENTS.md`
- `docs/agent/entry-point.md`
- `docs/agent/behavior.md`
- `docs/agent/decision-making.md`
- `docs/agent/source-of-truth.md`
- `docs/project/documentation-map.md`
- `docs/frontend/architecture.md`
- `docs/frontend/page-structure.md`
- `docs/frontend/ui-guidelines.md`
- `docs/frontend/testing.md`
- `frontend/eslint.config.js`

## Executive Summary

The filters-toolbar issue is real, but it is not isolated. The same drift pattern appears in row actions, overlays/drawers, empty states, KPI/stat cards, and client/entity picker usage.

Highest-confidence drift:

- Filters/toolbars: shared `FilterPanel` exists, but several feature bars still own layout, reset, active-state, client-picker, and URL-key mapping differently.
- Row actions: `RowActionsMenu` exists, but some rows use inline icon buttons, some mix inline buttons with menus, and some row-action components own confirmation/mutation concerns.
- Drawer/overlay behavior: `DetailDrawer`/`OverlayContainer` exists, but at least one drawer recreates portal, escape close, body lock, backdrop, and panel structure.
- Empty states: `StateCard` and `InlineEmptyState` exist, but feature components duplicate dashed-card, icon, copy, and CTA layout.

Candidate drift needing product/design decision:

- Dashboard metric cards vs `StatsCard`: both solve KPI cards, but dashboard may intentionally use a distinct visual system.
- Status badges: several wrappers and inline pills exist; some are domain-specific and valid, others bypass `StatusBadge`/`Badge`.
- Bulk action bars: current duplication is limited, with `ChargeBulkToolbar` correctly using `BulkSelectionToolbar`; no broad refactor yet.

## Audit Method

Searched under:

- `frontend/src/components`
- `frontend/src/features`
- `frontend/src/pages` was requested but does not exist in this checkout.

Discovery used `rg` for:

- component filenames ending in `Toolbar`, `CommandBar`, `FiltersBar`, `FiltersCard`, `Header`, `Drawer`, `Modal`, `Card`, `EmptyState`, `BulkToolbar`, `RowActions`, `StatsCard`, `KPI`, `Tabs`, `Picker`, `Pagination`, `Table`
- imports and usages of `ClientSearchInput`, `ClientPickerFilter`, `ToolbarContainer`, `FilterPanel`, `SearchFilter`, `StatsCard`, `DetailDrawer`, `PageHeader`, `BulkSelectionToolbar`, `RowActions`, `EmptyState`, `ModalFormActions`, `useSearchParamFilters`, `PaginatedDataTable`, `DataTable`, `StatusBadge`
- repeated class-heavy patterns for cards, filters, badges, drawers, and table actions

Exact evidence files audited for clusters:

- `src/components/ui/filters/FilterPanel.tsx`
- `src/components/ui/layout/ToolbarContainer.tsx`
- `src/components/ui/filters/SearchFilter.tsx`
- `src/components/ui/filters/ClientPickerFilter.tsx`
- `src/components/shared/client/ClientSearchInput.tsx`
- `src/components/shared/client/ClientPickerField.tsx`
- `src/components/shared/client/useClientPickerState.ts`
- `src/features/clients/components/list/ClientsFiltersBar.tsx`
- `src/features/binders/components/table/BindersFiltersBar.tsx`
- `src/features/charges/components/ChargesFiltersCard.tsx`
- `src/features/users/components/UsersFiltersBar.tsx`
- `src/features/search/components/SearchFiltersBar.tsx`
- `src/features/taxCalendar/components/TaxCalendarFiltersBar.tsx`
- `src/features/workQueue/components/WorkQueueFiltersBar.tsx`
- `src/features/annualReports/components/shared/AnnualReportsFiltersBar.tsx`
- `src/components/ui/table/RowActions.tsx`
- `src/features/clients/components/list/ClientRowActions.tsx`
- `src/features/users/components/UserRowActions.tsx`
- `src/features/binders/components/table/BinderRowActions.tsx`
- `src/features/charges/components/ChargeRowActions.tsx`
- `src/features/signatureRequests/components/SignatureRequestRowActions.tsx`
- `src/features/search/components/SearchRowActions.tsx`
- `src/features/vatReports/components/VatWorkItemRowActions.tsx`
- `src/components/ui/overlays/DetailDrawer.tsx`
- `src/components/ui/layout/OverlayContainer.tsx`
- `src/features/notifications/components/NotificationDrawer.tsx`
- `src/features/users/components/AuditLogsDrawer.tsx`
- `src/features/charges/components/ChargeDetailDrawer.tsx`
- `src/features/signatureRequests/components/SignatureRequestAuditDrawer.tsx`
- `src/features/binders/components/drawer/BinderDetailDrawer.tsx`
- `src/components/ui/feedback/StateCard.tsx`
- `src/components/ui/feedback/InlineEmptyState.tsx`
- `src/features/documents/components/DocumentsEmptyState.tsx`
- `src/features/dashboard/components/DashboardOnboardingEmptyState.tsx`
- `src/components/ui/layout/StatsCard.tsx`
- `src/features/dashboard/components/DashboardStatsGrid.tsx`
- `src/features/dashboard/components/DashboardPrimitives.tsx`
- `src/features/workQueue/components/WorkQueueSummaryCards.tsx`
- `src/features/advancedPayments/components/OverviewKPICards.tsx`
- `src/features/advancedPayments/components/ClientAdvancePaymentCards.tsx`
- `src/features/annualReports/components/panel/ReportSummaryCards.tsx`
- `src/features/vatReports/components/VatBreakdownCards.tsx`
- `src/components/ui/table/BulkSelectionToolbar.tsx`
- `src/features/charges/components/ChargeBulkToolbar.tsx`
- `src/components/ui/primitives/StatusBadge.tsx`
- `src/features/advancedPayments/components/AdvancePaymentStatusBadge.tsx`
- `src/features/advancedPayments/components/AdvancePaymentTimingBadge.tsx`
- `src/features/binders/components/sections/BinderIntakesSection.tsx`
- `src/components/ui/table/DataTable.tsx`
- `src/components/ui/table/PaginatedDataTable.tsx`

## Drift Clusters

### Cluster: Filters And Toolbars

Responsibility shared:

- Render list/search filters.
- Own filter layout and reset behavior.
- Highlight active values.
- Map URL/query filter keys into UI field values.
- In several cases, resolve or preserve selected client names around URL ids.

Files involved:

- `src/components/ui/filters/FilterPanel.tsx`
- `src/components/ui/layout/ToolbarContainer.tsx`
- `src/components/ui/filters/SearchFilter.tsx`
- `src/components/ui/filters/ClientPickerFilter.tsx`
- `src/features/clients/components/list/ClientsFiltersBar.tsx`
- `src/features/binders/components/table/BindersFiltersBar.tsx`
- `src/features/charges/components/ChargesFiltersCard.tsx`
- `src/features/users/components/UsersFiltersBar.tsx`
- `src/features/annualReports/components/shared/AnnualReportsFiltersBar.tsx`
- `src/features/search/components/SearchFiltersBar.tsx`
- `src/features/taxCalendar/components/TaxCalendarFiltersBar.tsx`
- `src/features/workQueue/components/WorkQueueFiltersBar.tsx`

Why this looks like drift:

- `FilterPanel` already centralizes search/select/date/client-picker layout plus badges/reset, but `TaxCalendarFiltersBar` and `WorkQueueFiltersBar` still hand-own the grid/flex layout.
- `SearchFiltersBar` owns an advanced-filter disclosure and uses `ClientPickerField`/`useClientPickerState` directly instead of the `FilterPanel` `client-picker` field model.
- `ChargesFiltersCard` uses `FilterPanel` but adds feature-local client-name resolution via React Query because the generic `ClientPickerFilter` cannot hydrate a URL-only client id.
- Naming varies between `FiltersBar`, `FiltersCard`, `CommandBar`, and inline toolbar sections for comparable responsibilities.

Confidence:

- Definitely drift.

Risk if left as-is:

- Filter URL keys and reset semantics will keep diverging.
- Client filter behavior will remain inconsistent when pages load from shared URLs with only ids.
- Visual layout and active-filter styling will continue to be page-specific.
- Future filter changes will require touching many feature bars.

Suggested target abstraction or ownership boundary:

- Keep a shared filter composition owner in `src/components/ui/filters`, but split it into smaller primitives:
  - field definition renderer
  - active badge/reset controller
  - client-picker URL hydration support
  - toolbar layout shell
- Keep feature-specific field lists and enum options inside each feature.
- Avoid a mega `BaseFiltersBar`; the shared boundary should own mechanics, not domain filter definitions.

Suggested migration order:

1. Stabilize `FilterPanel` naming and field contract, including client id/name hydration.
2. Move the existing `ChargesFiltersCard` URL-client-name workaround into the shared client-picker filter path.
3. Convert `TaxCalendarFiltersBar` and `WorkQueueFiltersBar` only if their behavior can be represented without losing feature-specific combined filters.
4. Rename `FiltersCard`/`FiltersBar` only as part of a real migration, not as a cosmetic pass.

Fix type:

- Shared component cleanup plus feature-local cleanup.

### Cluster: Row Actions

Responsibility shared:

- Render per-row operations in operational tables.
- Stop row-click propagation.
- Group secondary/destructive actions.
- Provide accessible labels and icon/action affordances.

Files involved:

- `src/components/ui/table/RowActions.tsx`
- `src/features/clients/components/list/ClientRowActions.tsx`
- `src/features/users/components/UserRowActions.tsx`
- `src/features/binders/components/table/BinderRowActions.tsx`
- `src/features/charges/components/ChargeRowActions.tsx`
- `src/features/signatureRequests/components/SignatureRequestRowActions.tsx`
- `src/features/search/components/SearchRowActions.tsx`
- `src/features/vatReports/components/VatWorkItemRowActions.tsx`

Why this looks like drift:

- `BinderRowActions`, `ChargeRowActions`, `SearchRowActions`, `SignatureRequestRowActions`, and `VatWorkItemRowActions` use `RowActionsMenu`.
- `ClientRowActions` uses three inline ghost icon buttons.
- `UserRowActions` mixes inline ghost buttons with a `RowActionsMenu` for only one conditional action.
- Some row-action components only render actions, while `SignatureRequestRowActions` and `VatWorkItemRowActions` also own confirmation dialog state and mutation/hook behavior.
- `VatWorkItemRowActions` imports `useRole` and `useDeleteWorkItem` directly, which makes the row component less presentational than the page-structure standard recommends.

Confidence:

- Definitely drift.

Risk if left as-is:

- Keyboard/a11y behavior, tooltips, and row-click propagation will remain inconsistent.
- Row action cells will look different across tables.
- Action authorization, confirmation, and mutation logic will stay scattered inside leaf components.

Suggested target abstraction or ownership boundary:

- Shared row-action primitives stay in `src/components/ui/table`.
- Feature `XRowActions` should be presentational and receive already-authorized action descriptors/callbacks from feature hooks or column factories.
- Confirmation state should usually live in the page/action hook, except for narrowly scoped self-contained action widgets with documented ownership.

Suggested migration order:

1. Convert `ClientRowActions` and `UserRowActions` to the same menu/inline policy. Choose one rule: menu for two or more row actions, or inline only for one primary action plus menu for overflow.
2. Move `VatWorkItemRowActions` role/delete mutation logic into VAT page/action hooks.
3. Move `SignatureRequestRowActions` cancel-confirm state out if the same cancel action appears outside row contexts.
4. Standardize destructive separators and aria labels.

Fix type:

- Shared row-action policy plus feature-local cleanup.

### Cluster: Drawer And Overlay Behavior

Responsibility shared:

- Render right-side detail/utility drawers.
- Lock body scroll.
- Close on escape/backdrop.
- Restore focus and trap focus.
- Provide drawer header, close affordance, content scroll, and optional footer.

Files involved:

- `src/components/ui/overlays/DetailDrawer.tsx`
- `src/components/ui/layout/OverlayContainer.tsx`
- `src/features/notifications/components/NotificationDrawer.tsx`
- `src/features/users/components/AuditLogsDrawer.tsx`
- `src/features/charges/components/ChargeDetailDrawer.tsx`
- `src/features/signatureRequests/components/SignatureRequestAuditDrawer.tsx`
- `src/features/binders/components/drawer/BinderDetailDrawer.tsx`
- `src/features/advancedPayments/components/AdvancePaymentDrawer.tsx`

Why this looks like drift:

- Most domain detail drawers compose `DetailDrawer`, which delegates drawer mechanics to `OverlayContainer`.
- `NotificationDrawer` recreates a drawer from scratch with `createPortal`, own backdrop, own body-scroll lock, own escape handling, own header layout, own close button, and own panel width.
- `AuditLogsDrawer` uses `DetailDrawer` but fetches and paginates internally. That is acceptable for a feature-level widget, but it differs from purely presentational drawer components.
- Some domain drawers are very large, especially `AdvancePaymentDrawer` at 433 lines, mixing formatting, warning blocks, edit form state, and details. That is more component-size drift than shared-overlay drift.

Confidence:

- Definitely drift for `NotificationDrawer`.
- Candidate drift for large feature drawers that still use `DetailDrawer`.

Risk if left as-is:

- Overlay accessibility fixes must be duplicated or may miss the notification drawer.
- Mobile width, focus restoration, escape behavior, and body scroll behavior can diverge.
- Feature drawers can become mutation/form/detail containers rather than presentational slots.

Suggested target abstraction or ownership boundary:

- All right-side panels should compose `DetailDrawer` or `OverlayContainer variant="drawer"`.
- Notification-specific list/content can stay feature-local.
- Feature drawers may fetch only if they are documented feature-level widgets; otherwise page hooks should fetch and pass data down.

Suggested migration order:

1. Convert `NotificationDrawer` to `DetailDrawer`/`OverlayContainer`.
2. Keep `AuditLogsDrawer`, `SignatureRequestAuditDrawer`, `ChargeDetailDrawer`, and `BinderDetailDrawer` on `DetailDrawer`.
3. Split large drawer internals into feature-local sections where size obscures ownership.

Fix type:

- Shared component adoption plus feature-local cleanup.

### Cluster: Empty States

Responsibility shared:

- Render empty/no-results/error states with icon, copy, optional action, dashed or compact layout.

Files involved:

- `src/components/ui/feedback/StateCard.tsx`
- `src/components/ui/feedback/InlineEmptyState.tsx`
- `src/components/ui/table/DataTable.tsx`
- `src/features/documents/components/DocumentsEmptyState.tsx`
- `src/features/dashboard/components/DashboardOnboardingEmptyState.tsx`
- `src/features/charges/helpers.ts`
- `src/features/vatReports/filterUtils.ts`
- `src/features/clients/pages/ClientsPage.tsx`

Why this looks like drift:

- `DataTable` already renders empty state through `StateCard`.
- `InlineEmptyState` exists for section-level empty states.
- `DocumentsEmptyState` recreates a dashed icon/action layout that maps cleanly to `StateCard` or `InlineEmptyState` with an action.
- `DashboardOnboardingEmptyState` is likely intentionally bespoke, but it still implements the same no-data CTA pattern with custom card, icon, copy, and link styling.
- Empty-state copy helpers exist in feature helpers (`charges`, `vatReports`) while visual state is split between shared components and feature markup.

Confidence:

- Definitely drift for documents empty state.
- Candidate/no-action decision for dashboard onboarding.

Risk if left as-is:

- No-records vs no-results copy and CTA placement will vary by feature.
- Empty states will be harder to make responsive and accessible consistently.

Suggested target abstraction or ownership boundary:

- Keep feature-specific copy in feature helpers.
- Use `StateCard` for table/page empty states and `InlineEmptyState` for compact sections.
- If onboarding needs a distinct horizontal CTA layout, make that an explicit shared variant only after at least two usages.

Suggested migration order:

1. Convert `DocumentsEmptyState` to shared empty-state primitives.
2. Audit all table empty states to pass `emptyState` into `DataTable`/`PaginatedDataTable` rather than rendering nearby custom empty blocks.
3. Leave dashboard onboarding alone unless another onboarding surface appears.

Fix type:

- Shared component adoption; some no-action.

### Cluster: KPI / Stat Cards

Responsibility shared:

- Render numeric summary cards with title, value, icon, semantic tone, optional progress/trend/action, and optional click filter behavior.

Files involved:

- `src/components/ui/layout/StatsCard.tsx`
- `src/features/workQueue/components/WorkQueueSummaryCards.tsx`
- `src/features/advancedPayments/components/OverviewKPICards.tsx`
- `src/features/advancedPayments/components/AdvancePaymentsKPICards.tsx`
- `src/features/binders/components/table/BindersFiltersBar.tsx`
- `src/features/clients/pages/ClientsPage.tsx`
- `src/features/vatReports/pages/VatWorkItemsPage.tsx`
- `src/features/taxDashboard/components/TaxSubmissionStats.tsx`
- `src/features/dashboard/components/DashboardStatsGrid.tsx`
- `src/features/dashboard/components/DashboardPrimitives.tsx`
- `src/features/annualReports/components/panel/ReportSummaryCards.tsx`
- `src/features/vatReports/components/VatBreakdownCards.tsx`

Why this looks like drift:

- Many operational pages use `StatsCard`.
- Dashboard uses `DashboardMetricCard`, with a separate tone map, different radius (`rounded-3xl`), height, value treatment, hover shadow, and progress styling.
- Some annual/VAT panels use local summary-card markup instead of `StatsCard`, likely because the card is more financial/detail-oriented than a KPI tile.

Confidence:

- Candidate drift. Dashboard may intentionally own a distinct dashboard design language.

Risk if left as-is:

- Semantic tone changes and responsive card behavior must be maintained in multiple places.
- Users may see inconsistent KPI interactions: some cards filter when clicked, some are links, some are static.

Suggested target abstraction or ownership boundary:

- Keep `StatsCard` for operational list counters and filter pills.
- Decide whether dashboard has an explicit `DashboardMetricCard` design-system exception. If yes, document it in `frontend/DESIGN.md` or `docs/frontend/ui-guidelines.md`.
- Do not force financial detail cards into `StatsCard` unless the information shape is actually the same.

Suggested migration order:

1. Document or remove the dashboard exception.
2. Normalize tone names (`orange` vs `amber`) if dashboard remains separate.
3. Convert only true KPI tiles to `StatsCard`; leave richer financial panels local.

Fix type:

- Needs human/design decision.

### Cluster: Client / Entity Picker Behavior

Responsibility shared:

- Search for clients.
- Hold selected-client id/name pair.
- Render selected client chip/display.
- Sync selected ids to URL params or form state.

Files involved:

- `src/components/shared/client/ClientSearchInput.tsx`
- `src/components/shared/client/ClientPickerField.tsx`
- `src/components/shared/client/useClientPickerState.ts`
- `src/components/ui/filters/ClientPickerFilter.tsx`
- `src/features/search/components/SearchFiltersBar.tsx`
- `src/features/charges/components/ChargesFiltersCard.tsx`
- `src/features/notifications/pages/NotificationsPage.tsx`
- `src/features/tasks/components/TaskSourceSection.tsx`
- `src/features/binders/components/drawer/BinderReceivePanel.tsx`
- `src/features/annualReports/components/shared/CreateReportModal.tsx`
- `src/features/signatureRequests/components/CreateSignatureRequestModal.tsx`
- `src/features/vatReports/components/VatWorkItemsCreateModal.tsx`
- `src/features/charges/components/ChargesCreateModal.tsx`

Why this looks like drift:

- There are already three shared client-picker surfaces: raw input, field wrapper, and filter wrapper.
- Some consumers use `ClientPickerFilter`, some use `ClientPickerField`, and some wire `ClientSearchInput`/`SelectedClientDisplay` manually.
- URL-only ids are not hydrated consistently. `ChargesFiltersCard` performs its own client detail query, while `SearchFiltersBar` falls back to `לקוח #id`.
- Form use cases and filter use cases are mixed under the same components without a clear state-owner boundary.

Confidence:

- Definitely drift.

Risk if left as-is:

- Shared links with client filters show inconsistent names.
- Client id query keys may continue diverging (`client_id`, `client_record_id`, display-only `client_name`).
- Form validation and filter clearing can disagree.

Suggested target abstraction or ownership boundary:

- Shared client picker should expose separate adapters:
  - presentational `ClientSearchInput`
  - form field adapter
  - URL filter adapter with id hydration and clear semantics
- URL param names remain feature-owned, but normalization/hydration mechanics should be shared.

Suggested migration order:

1. Define a shared selected-client model with id, display name, and optional office number.
2. Add a URL-filter adapter that can hydrate from id.
3. Replace feature-local hydration in charges and fallback-id display in search/notifications.
4. Keep form-specific field validation in each feature form.

Fix type:

- Shared component/hook cleanup plus feature-local adapters.

### Cluster: Status Badge / Semantic Pill Usage

Responsibility shared:

- Display status/timing/category tags using semantic variants.

Files involved:

- `src/components/ui/primitives/Badge.tsx`
- `src/components/ui/primitives/StatusBadge.tsx`
- `src/components/ui/table/columnRenderers.tsx`
- `src/features/advancedPayments/components/AdvancePaymentStatusBadge.tsx`
- `src/features/advancedPayments/components/AdvancePaymentTimingBadge.tsx`
- `src/features/binders/components/sections/BinderIntakesSection.tsx`
- `src/features/users/components/UsersColumns.tsx`
- `src/features/workQueue/components/workQueueColumns.tsx`
- `src/features/timeline/components/TimelineCommandBar.tsx`
- `src/features/notes/components/NotesCard.tsx`

Why this looks like drift:

- `StatusBadge` can map status to label and variant, but several domains wrap `Badge` directly.
- Some inline pills use raw semantic/background classes instead of `Badge`.
- Some direct wrappers are acceptable because they add behavior, such as clickable VAT status lookup in binder intake.

Confidence:

- Candidate drift.

Risk if left as-is:

- Semantic color changes will require scattered edits.
- Some pills may rely on color alone or bypass shared size/dot semantics.

Suggested target abstraction or ownership boundary:

- Use `StatusBadge` for simple enum status display.
- Use `Badge` directly for non-status tags.
- Keep feature wrappers only when they add behavior or domain-specific composition.

Suggested migration order:

1. Convert purely visual wrappers like `AdvancePaymentStatusBadge` to `StatusBadge` if types allow.
2. Leave behaviorful badges local.
3. Replace raw timing/status spans with `Badge` variants where equivalent.

Fix type:

- Naming/shared component cleanup.

### Cluster: Bulk Action Bars

Responsibility shared:

- Show selected count and batch actions.

Files involved:

- `src/components/ui/table/BulkSelectionToolbar.tsx`
- `src/features/charges/components/ChargeBulkToolbar.tsx`
- `src/features/charges/components/ChargesTableBlock.tsx`
- `src/features/charges/components/ClientChargesTab.tsx`
- `src/features/binders/components/dialogs/BindersPageDialogs.tsx`
- `src/features/binders/components/sections/BinderHandoverPanel.tsx`

Why this looks like drift:

- `ChargeBulkToolbar` correctly composes `BulkSelectionToolbar`.
- Binder has batch/bulk workflows, but they are domain dialogs/panels rather than table selection bars.
- No broad competing bulk toolbar family was found.

Confidence:

- No action for now.

Risk if left as-is:

- Low. Watch future features that add table selection.

Suggested target abstraction or ownership boundary:

- Keep `BulkSelectionToolbar` as the shared table-selection shell.
- Domain batch dialogs should stay feature-local unless they become generic selected-row toolbars.

Suggested migration order:

- None now.

Fix type:

- No action.

## High-Confidence Refactor Candidates

1. Filters/toolbars: consolidate mechanics around `FilterPanel`, client-picker hydration, and toolbar layout.
2. Row actions: standardize when to use inline icon buttons versus `RowActionsMenu`; remove hook/mutation ownership from row components.
3. Notification drawer: migrate custom portal/drawer mechanics to `DetailDrawer`/`OverlayContainer`.
4. Documents empty state: replace custom dashed empty-state markup with `StateCard` or `InlineEmptyState`.
5. Client picker adapters: define separate URL-filter and form adapters around the existing shared client picker.

## Candidate / Needs-Human-Decision Areas

1. Dashboard KPI design: decide whether `DashboardMetricCard` is an explicit dashboard-only design variant or unintentional duplication of `StatsCard`.
2. Status badges: decide which wrappers encode domain behavior and which merely duplicate `StatusBadge`.
3. Large detail drawers: decide whether to split for maintainability without changing overlay ownership.
4. Search advanced filters: decide whether advanced/disclosure filters should be part of shared filter primitives or remain feature-owned.

## No-Action Areas

1. `ChargeBulkToolbar` using `BulkSelectionToolbar`: current pattern is aligned.
2. Rich financial/detail cards in annual reports and VAT: not every bordered summary card is a KPI tile.
3. Feature-local domain sections inside drawers: acceptable when they only render domain content and still use shared `DetailDrawer`.

## Full Component Source Appendix

Source is capped to the components that prove each cluster. Very large generated/API files, lock files, dist output, snapshots, and unrelated files are omitted.

### Filters And Toolbars

#### `src/components/ui/filters/FilterPanel.tsx`

```tsx
import React, { useRef, useCallback } from 'react'
import { Select } from '@/components/ui/inputs/Select'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { ActiveFilterBadges } from '@/components/ui/table/ActiveFilterBadges'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'
import { cn } from '@/utils/utils'
import { SearchFilter } from './SearchFilter'
import { ClientPickerFilter } from './ClientPickerFilter'
import { buildFilterBadges } from './filterBadges'
import type { FilterFieldDef, SearchFieldHandle } from './types'

export interface FilterPanelProps {
  fields: FilterFieldDef[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>
  onChange: (key: string, value: string) => void
  onMultiChange?: (updates: Record<string, string>) => void
  onReset: () => void
  /** Tailwind grid class. Default: 'grid-cols-1 sm:grid-cols-3' */
  gridClass?: string
  /** Extra content rendered above ToolbarContainer (e.g. StatsCard pills) */
  above?: React.ReactNode
  /** Extra badge(s) appended to the auto-generated badge list */
  extraBadges?: FilterBadge[]
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onMultiChange,
  onReset,
  gridClass = 'grid-cols-1 sm:grid-cols-3',
  above,
  extraBadges,
}) => {
  const searchRefs = useRef<Record<string, SearchFieldHandle | null>>({})

  const handleReset = useCallback(() => {
    for (const ref of Object.values(searchRefs.current)) ref?.reset()
    onReset()
  }, [onReset])

  const badges = buildFilterBadges(fields, values, onChange, searchRefs.current)
  const allBadges = extraBadges ? [...badges, ...extraBadges] : badges

  const handleMulti =
    onMultiChange ??
    ((updates: Record<string, string>) => {
      for (const [k, v] of Object.entries(updates)) onChange(k, v)
    })

  return (
    <div className="space-y-3">
      {above}
      <ToolbarContainer>
        <div className="space-y-3">
          <div className={cn('grid gap-3', gridClass)}>
            {fields.map((field) => {
              if (field.type === 'search') {
                return (
                  <SearchFilter
                    key={field.key}
                    ref={(el) => {
                      searchRefs.current[field.key] = el
                    }}
                    field={field}
                    externalValue={values[field.key] ?? ''}
                    onChange={onChange}
                  />
                )
              }
              if (field.type === 'select') {
                const v = values[field.key] ?? ''
                const isActive = v !== '' && v !== (field.defaultValue ?? '')
                return (
                  <Select
                    key={field.key}
                    label={field.label}
                    value={v}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    options={field.options}
                    className={cn(isActive && 'border-primary-400 ring-1 ring-primary-200')}
                  />
                )
              }
              if (field.type === 'date') {
                return (
                  <DatePicker
                    key={field.key}
                    label={field.label}
                    value={values[field.key] ?? ''}
                    onChange={(v) => onChange(field.key, v)}
                  />
                )
              }
              if (field.type === 'date-range') {
                return (
                  <React.Fragment key={`${field.fromKey}__${field.toKey}`}>
                    <DatePicker
                      label={field.fromLabel}
                      value={values[field.fromKey] ?? ''}
                      onChange={(v) => onChange(field.fromKey, v)}
                    />
                    <DatePicker
                      label={field.toLabel}
                      value={values[field.toKey] ?? ''}
                      onChange={(v) => onChange(field.toKey, v)}
                    />
                  </React.Fragment>
                )
              }
              if (field.type === 'client-picker') {
                return (
                  <ClientPickerFilter key={field.idKey} field={field} values={values} onMultiChange={handleMulti} />
                )
              }
              return null
            })}
          </div>
          <ActiveFilterBadges badges={allBadges} onReset={handleReset} />
        </div>
      </ToolbarContainer>
    </div>
  )
}

FilterPanel.displayName = 'FilterPanel'
```

#### `src/features/workQueue/components/WorkQueueFiltersBar.tsx`

```tsx
import { z } from 'zod'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/utils/utils'
import { workQueueSourceTypeLabels, workQueueSourceTypeValues, workQueueUrgencyLabels } from '../constants'
import { taskStatusLabels, taskStatusValues } from '@/features/tasks'
import type { WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'
import type { TaskStatus } from '@/features/tasks'

interface WorkQueueFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  urgencyFilter: WorkQueueUrgency | null
  onUrgencyChange: (value: WorkQueueUrgency | null) => void
  typeFilter: WorkQueueSourceType | null
  onTypeChange: (value: WorkQueueSourceType | null) => void
  statusFilter: TaskStatus | null
  onStatusChange: (value: TaskStatus | null) => void
  linkedFilter: 'linked' | 'unlinked' | null
  onLinkedChange: (value: 'linked' | 'unlinked' | null) => void
  scopeFilter: 'system' | 'manual' | null
  onScopeChange: (value: 'system' | 'manual' | null) => void
  historyMode: boolean
  onHistoryModeChange: (value: boolean) => void
  hasFilters: boolean
  onClear: () => void
}

const typeOptions = [
  { value: '', label: 'כל הסוגים' },
  ...workQueueSourceTypeValues.map((v) => ({ value: v, label: workQueueSourceTypeLabels[v] })),
]

const statusOptions = [
  { value: '', label: 'כל סטטוסי המשימה' },
  ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
]

type TaskRelationFilter = '' | 'manual' | 'linked' | 'unlinked' | 'system'

const taskRelationOptions: { value: TaskRelationFilter; label: string }[] = [
  { value: '', label: 'כל העבודה הפעילה' },
  { value: 'manual', label: 'משימות עצמאיות בלבד' },
  { value: 'linked', label: 'פריטים עם משימה קשורה' },
  { value: 'unlinked', label: 'פריטים ללא משימה קשורה' },
  { value: 'system', label: 'פריטי עבודה שאינם משימה' },
]

const parseSourceType = (value: string): WorkQueueSourceType | null => {
  const result = z.enum(workQueueSourceTypeValues).safeParse(value)
  return result.success ? result.data : null
}

const parseTaskStatus = (value: string): TaskStatus | null => {
  const result = z.enum(taskStatusValues).safeParse(value)
  return result.success ? result.data : null
}

const taskRelationValue = (
  scopeFilter: 'system' | 'manual' | null,
  linkedFilter: 'linked' | 'unlinked' | null,
): TaskRelationFilter => {
  if (scopeFilter === 'manual') return 'manual'
  if (scopeFilter === 'system') return 'system'
  if (linkedFilter === 'linked') return 'linked'
  if (linkedFilter === 'unlinked') return 'unlinked'
  return ''
}

export const WorkQueueFiltersBar: React.FC<WorkQueueFiltersBarProps> = ({
  search,
  onSearchChange,
  urgencyFilter,
  onUrgencyChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  linkedFilter,
  onLinkedChange,
  scopeFilter,
  onScopeChange,
  historyMode,
  onHistoryModeChange,
  hasFilters,
  onClear,
}) => {
  const selectedTaskRelation = taskRelationValue(scopeFilter, linkedFilter)
  const onTaskRelationChange = (value: string) => {
    if (value === 'manual') {
      onScopeChange('manual')
      onLinkedChange(null)
      return
    }
    if (value === 'system') {
      onScopeChange('system')
      onLinkedChange(null)
      return
    }
    if (value === 'linked' || value === 'unlinked') {
      onScopeChange(null)
      onLinkedChange(value)
      return
    }
    onScopeChange(null)
    onLinkedChange(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[220px] flex-1">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש לפי לקוח, מספר, כותרת או משימה"
          startIcon={<Search className="h-4 w-4" />}
          className={cn(search.trim() && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-36 shrink-0">
        <Select
          options={typeOptions}
          value={typeFilter ?? ''}
          onChange={(e) => onTypeChange(parseSourceType(e.target.value))}
          className={cn(typeFilter && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-44 shrink-0">
        <Select
          options={statusOptions}
          value={statusFilter ?? ''}
          onChange={(e) => onStatusChange(parseTaskStatus(e.target.value))}
          className={cn(statusFilter && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-52 shrink-0">
        <Select
          options={taskRelationOptions}
          value={selectedTaskRelation}
          onChange={(e) => onTaskRelationChange(e.target.value)}
          className={cn(selectedTaskRelation && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <Button
        variant={historyMode ? 'secondary' : 'ghost'}
        size="sm"
        aria-pressed={historyMode}
        className={cn(historyMode && 'ring-2 ring-primary-300 ring-offset-1')}
        onClick={() => onHistoryModeChange(!historyMode)}
      >
        היסטוריה
      </Button>
      {urgencyFilter && (
        <Button variant="secondary" size="sm" aria-pressed onClick={() => onUrgencyChange(null)}>
          {`דחיפות: ${workQueueUrgencyLabels[urgencyFilter]}`}
        </Button>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          אפס סינון
        </Button>
      )}
    </div>
  )
}
```

#### `src/features/taxCalendar/components/TaxCalendarFiltersBar.tsx`

```tsx
import { Button } from '@/components/ui/primitives/Button'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS, TAX_CALENDAR_STATUS_OPTIONS } from '../constants'
import type { TaxCalendarGroupStatusFilter } from '../utils'

interface TaxCalendarFiltersBarProps {
  startYear: string
  endYear: string
  obligationType: string
  status: TaxCalendarGroupStatusFilter
  onStartYearChange: (value: string) => void
  onEndYearChange: (value: string) => void
  onObligationTypeChange: (value: string) => void
  onStatusChange: (value: TaxCalendarGroupStatusFilter) => void
  onReset: () => void
  clientSearchText?: string
  includeEmpty?: boolean
  onClientSearchTextChange?: (value: string) => void
  onIncludeEmptyChange?: (value: boolean) => void
}

export const TaxCalendarFiltersBar = ({
  startYear,
  endYear,
  obligationType,
  status,
  onStartYearChange,
  onEndYearChange,
  onObligationTypeChange,
  onStatusChange,
  onReset,
  clientSearchText,
  includeEmpty,
  onClientSearchTextChange,
  onIncludeEmptyChange,
}: TaxCalendarFiltersBarProps) => {
  const yearOptions = getOperationalYearOptions()
  const showClientSearch = clientSearchText != null && onClientSearchTextChange
  const showIncludeEmpty = includeEmpty != null && onIncludeEmptyChange
  const gridColumns =
    showClientSearch && showIncludeEmpty
      ? 'lg:grid-cols-7'
      : showClientSearch || showIncludeEmpty
        ? 'lg:grid-cols-6'
        : 'lg:grid-cols-5'

  return (
    <ToolbarContainer>
      <div className={`grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 ${gridColumns}`}>
        <Select
          label="משנת מס"
          value={startYear}
          options={yearOptions}
          onChange={(event) => onStartYearChange(event.target.value)}
        />
        <Select
          label="עד שנת מס"
          value={endYear}
          options={yearOptions}
          onChange={(event) => onEndYearChange(event.target.value)}
        />
        <Select
          label="סוג חובה"
          value={obligationType}
          onChange={(event) => onObligationTypeChange(event.target.value)}
          options={TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS}
        />
        <Select
          label="מצב"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TaxCalendarGroupStatusFilter)}
          options={TAX_CALENDAR_STATUS_OPTIONS}
        />
        {showClientSearch ? (
          <Input
            label="חיפוש לקוח"
            value={clientSearchText}
            onChange={(event) => onClientSearchTextChange(event.target.value)}
            placeholder="שם או מספר לקוח"
          />
        ) : null}
        {showIncludeEmpty ? (
          <Checkbox
            checked={includeEmpty}
            onChange={(event) => onIncludeEmptyChange(event.target.checked)}
            label="כולל ריקים"
            description="הצג חובות ללא תיקים מקושרים"
            containerClassName="h-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3"
          />
        ) : null}
        <div className="flex h-full items-center">
          <Button type="button" variant="outline" size="sm" onClick={onReset} className="w-full">
            איפוס סינון
          </Button>
        </div>
      </div>
    </ToolbarContainer>
  )
}

TaxCalendarFiltersBar.displayName = 'TaxCalendarFiltersBar'
```

#### `src/features/search/components/SearchFiltersBar.tsx`

```tsx
import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { Button } from '../../../components/ui/primitives/Button'
import { ClientPickerField, useClientPickerState } from '@/components/shared/client'
import { CLIENT_STATUS_OPTIONS, ENTITY_TYPE_OPTIONS } from '@/features/clients'
import { BINDER_LOCATION_STATUS_OPTIONS } from '../../binders'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFiltersBarProps } from '../types'

const withEmptyOption = (label: string, options: { value: string; label: string }[]) => [
  { value: '', label },
  ...options,
]

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpen,
  onToggle,
}) => {
  const advancedCount = SEARCH_ADVANCED_FILTER_KEYS.filter((k) => Boolean(filters[k])).length
  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange } =
    useClientPickerState({
      onSelect: (client) => onFilterChange('client_id', String(client.id)),
      onClear: () => onFilterChange('client_id', ''),
    })
  const activeClient =
    selectedClient ?? (filters.client_id ? { id: Number(filters.client_id), name: `לקוח #${filters.client_id}` } : null)

  return (
    <div>
      <Button type="button" variant="ghost" size="sm" onClick={onToggle} className="text-gray-600 hover:text-gray-900">
        <SlidersHorizontal className="h-4 w-4" />
        פילטרים מתקדמים
        {advancedCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
            {advancedCount}
          </span>
        )}
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ClientPickerField
              selectedClient={activeClient}
              clientQuery={clientQuery}
              onQueryChange={handleClientQueryChange}
              onSelect={handleSelectClient}
              onClear={handleClearClient}
              label="לקוח"
              placeholder="חפש לקוח לפי שם או מזהה"
            />
            <Input
              label="ת.ז / ח.פ"
              type="text"
              value={filters.id_number}
              onChange={(e) => onFilterChange('id_number', e.target.value)}
              placeholder="מספר מזהה"
            />
            <Input
              label="מספר קלסר"
              type="text"
              value={filters.binder_number}
              onChange={(e) => onFilterChange('binder_number', e.target.value)}
              placeholder="לדוגמה: 12345"
            />
            <Select
              label="סטטוס לקוח"
              value={filters.client_status}
              onChange={(e) => onFilterChange('client_status', e.target.value)}
              options={withEmptyOption('כל הסטטוסים', CLIENT_STATUS_OPTIONS)}
            />
            <Select
              label="סוג עסק"
              value={filters.entity_type}
              onChange={(e) => onFilterChange('entity_type', e.target.value)}
              options={withEmptyOption('כל הסוגים', ENTITY_TYPE_OPTIONS)}
            />
            <Select
              label="מיקום קלסר"
              value={filters.binder_location_status}
              onChange={(e) => onFilterChange('binder_location_status', e.target.value)}
              options={withEmptyOption('כל הסטטוסים', BINDER_LOCATION_STATUS_OPTIONS)}
            />
          </div>

          {advancedCount > 0 && onReset && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-500">{advancedCount} פילטרים פעילים</span>
              <Button type="button" variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                איפוס הכל
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

#### `src/features/charges/components/ChargesFiltersCard.tsx`

```tsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { CHARGE_STATUS_OPTIONS, CHARGE_TYPE_OPTIONS_WITH_ALL, CHARGE_PERIOD_OPTIONS } from '../constants'
import { clientsApi, clientsQK } from '@/features/clients'
import type { ChargesFilters } from '../types'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

interface ChargesFiltersCardProps {
  filters: ChargesFilters
  onClear: () => void
  onFilterChange: (key: string, value: string) => void
}

const FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name' },
  { type: 'select' as const, key: 'status', label: 'סטטוס', options: CHARGE_STATUS_OPTIONS },
  {
    type: 'select' as const,
    key: 'charge_type',
    label: 'סוג חיוב',
    options: CHARGE_TYPE_OPTIONS_WITH_ALL,
  },
  {
    type: 'select' as const,
    key: 'period',
    label: 'תקופה',
    options: CHARGE_PERIOD_OPTIONS,
  },
  {
    type: 'date-range' as const,
    fromKey: 'issued_after',
    toKey: 'issued_before',
    fromLabel: 'הונפק מתאריך',
    toLabel: 'הונפק עד תאריך',
  },
]

export const ChargesFiltersCard = ({ filters, onClear, onFilterChange }: ChargesFiltersCardProps) => {
  const [clientName, setClientName] = useState('')

  // Resolve client name when filter arrives via URL (no name in URL params)
  const urlClientId = filters.client_record_id ? Number(filters.client_record_id) : null
  const { data: urlClient } = useQuery({
    queryKey: clientsQK.detail(urlClientId ?? 0),
    queryFn: () => clientsApi.getById(urlClientId!),
    enabled: urlClientId != null && !clientName,
    staleTime: QUERY_STALE_TIME.medium,
  })

  useEffect(() => {
    if (urlClient) setClientName(urlClient.full_name)
  }, [urlClient])

  useEffect(() => {
    if (!filters.client_record_id) setClientName('')
  }, [filters.client_record_id])

  return (
    <FilterPanel
      fields={FIELDS}
      values={{
        client_record_id: filters.client_record_id ?? '',
        client_name: clientName,
        status: filters.status ?? '',
        charge_type: filters.charge_type ?? '',
        period: filters.period ?? '',
        issued_after: filters.issued_after ?? '',
        issued_before: filters.issued_before ?? '',
      }}
      onChange={(key, value) => {
        if (key === 'client_name') {
          setClientName(value)
          return
        }
        onFilterChange(key, value)
      }}
      onReset={onClear}
    />
  )
}

ChargesFiltersCard.displayName = 'ChargesFiltersCard'
```

### Row Actions

#### `src/features/clients/components/list/ClientRowActions.tsx`

```tsx
import { Clock, Pencil, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { formatClientOfficeId } from '@/utils/utils'
import { Button } from '@/components/ui/primitives/Button'

interface ClientRowActionsProps {
  clientId: number
  officeClientNumber: number | null
  onEditClient?: () => void
}

export const ClientRowActions: React.FC<ClientRowActionsProps> = ({ clientId, officeClientNumber, onEditClient }) => {
  const navigate = useNavigate()
  const clientOfficeId = formatClientOfficeId(officeClientNumber)

  return (
    <div aria-label={`פעולות ללקוח ${clientOfficeId}`} className="flex items-center justify-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        tooltip="פתח פרופיל"
        aria-label="פתח פרופיל"
        className="p-1.5 text-gray-400 hover:text-gray-700"
        onClick={(e) => {
          e.stopPropagation()
          navigate(CLIENT_ROUTES.detail(clientId))
        }}
      >
        <UserCircle className="h-4 w-4" />
      </Button>
      {onEditClient && (
        <Button
          variant="ghost"
          size="sm"
          tooltip="עריכת לקוח"
          aria-label="עריכת לקוח"
          className="p-1.5 text-gray-400 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation()
            onEditClient()
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        tooltip="ציר זמן"
        aria-label="ציר זמן"
        className="p-1.5 text-gray-400 hover:text-gray-700"
        onClick={(e) => {
          e.stopPropagation()
          navigate(CLIENT_ROUTES.timeline(clientId))
        }}
      >
        <Clock className="h-4 w-4" />
      </Button>
    </div>
  )
}

ClientRowActions.displayName = 'ClientRowActions'
```

#### `src/features/users/components/UserRowActions.tsx`

```tsx
import { Pencil, KeyRound, UserX, UserCheck } from 'lucide-react'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import type { UserResponse } from '../api'
import { Button } from '@/components/ui/primitives/Button'

interface UserRowActionsProps {
  user: UserResponse
  currentUserId: number | undefined
  onEdit: (user: UserResponse) => void
  onResetPassword: (user: UserResponse) => void
  onToggleActive: (user: UserResponse) => void
}

export const UserRowActions: React.FC<UserRowActionsProps> = ({
  user,
  currentUserId,
  onEdit,
  onResetPassword,
  onToggleActive,
}) => (
  <div className="flex items-center justify-center gap-0.5">
    <Button
      variant="ghost"
      size="sm"
      tooltip="עריכה"
      aria-label="עריכה"
      className="p-1.5 text-gray-400 hover:text-gray-700"
      onClick={(e) => {
        e.stopPropagation()
        onEdit(user)
      }}
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      tooltip="איפוס סיסמה"
      aria-label="איפוס סיסמה"
      className="p-1.5 text-gray-400 hover:text-gray-700"
      onClick={(e) => {
        e.stopPropagation()
        onResetPassword(user)
      }}
    >
      <KeyRound className="h-4 w-4" />
    </Button>
    {user.id !== currentUserId && (
      <RowActionsMenu ariaLabel={`פעולות נוספות למשתמש ${user.full_name}`}>
        <RowActionItem
          label={user.is_active ? 'השבתה' : 'הפעלה'}
          onClick={() => onToggleActive(user)}
          icon={user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          danger={user.is_active}
        />
      </RowActionsMenu>
    )}
  </div>
)

UserRowActions.displayName = 'UserRowActions'
```

#### `src/features/charges/components/ChargeRowActions.tsx`

```tsx
import { Bell, CheckCircle2, Eye, FileText, Trash2 } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { canCancel, canIssue, canMarkPaid } from '../utils'
import type { BackendAction } from '@/lib/actions/types'

interface ChargeRowActionsProps {
  chargeId: number
  actions?: BackendAction[] | null
  disabled?: boolean
  showActions?: boolean
  onIssue: () => void
  onMarkPaid: () => void
  onCancel: () => void
  onOpenDetail: () => void
  onSendInvoiceNotification?: () => void
  onSendPaymentReminder?: () => void
}

export const ChargeRowActions: React.FC<ChargeRowActionsProps> = ({
  chargeId,
  actions,
  disabled = false,
  showActions = true,
  onIssue,
  onMarkPaid,
  onCancel,
  onOpenDetail,
  onSendInvoiceNotification,
  onSendPaymentReminder,
}) => {
  const hasActions = showActions && (canIssue(actions) || canMarkPaid(actions) || canCancel(actions))

  return (
    <RowActionsMenu ariaLabel={`פעולות לחיוב ${chargeId}`}>
      <RowActionItem
        label="צפייה בפרטים"
        onClick={onOpenDetail}
        icon={<Eye className="h-4 w-4" />}
        disabled={disabled}
      />
      {(onSendInvoiceNotification || onSendPaymentReminder) && <RowActionSeparator />}
      {onSendInvoiceNotification && (
        <RowActionItem
          label="שלח הודעת חשבונית"
          onClick={onSendInvoiceNotification}
          icon={<Bell className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {onSendPaymentReminder && (
        <RowActionItem
          label="שלח תזכורת לתשלום"
          onClick={onSendPaymentReminder}
          icon={<Bell className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {hasActions && <RowActionSeparator />}
      {showActions && canIssue(actions) && (
        <RowActionItem label="הנפקה" onClick={onIssue} icon={<FileText className="h-4 w-4" />} disabled={disabled} />
      )}
      {showActions && canMarkPaid(actions) && (
        <RowActionItem
          label="סימון שולם"
          onClick={onMarkPaid}
          icon={<CheckCircle2 className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {showActions && canCancel(actions) && (
        <RowActionItem
          label="ביטול"
          onClick={onCancel}
          icon={<Trash2 className="h-4 w-4" />}
          danger
          disabled={disabled}
        />
      )}
    </RowActionsMenu>
  )
}

ChargeRowActions.displayName = 'ChargeRowActions'
```

#### `src/features/vatReports/components/VatWorkItemRowActions.tsx`

```tsx
import { useState } from 'react'
import { PackageCheck, SendHorizontal, Trash2 } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { useRole } from '../../../hooks/useRole'
import { canMarkMaterialsComplete, canMarkReadyForReview, isFiled } from '../utils'
import { useDeleteWorkItem } from '../hooks/useVatInvoiceMutations'
import type { VatWorkItemRowActionsProps } from '../types'

export const VatWorkItemRowActions: React.FC<VatWorkItemRowActionsProps> = ({
  item,
  isLoading,
  isDisabled,
  runAction,
}) => {
  const { isAdvisor, isSecretary } = useRole()
  const { deleteWorkItem, isDeleting } = useDeleteWorkItem()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const canDelete = (isAdvisor || isSecretary) && !isFiled(item.status)
  const hasAny = canMarkMaterialsComplete(item.available_actions) || canMarkReadyForReview(item.available_actions)

  if (isFiled(item.status)) {
    return <span className="text-xs text-gray-400">הוגש</span>
  }

  if (!hasAny && !canDelete) return null

  return (
    <>
      <RowActionsMenu ariaLabel={`פעולות לפריט ${item.id}`}>
        {canMarkMaterialsComplete(item.available_actions) && (
          <RowActionItem
            label="אשר קבלת חומרים"
            onClick={() => void runAction(item.id, 'materialsComplete')}
            icon={<PackageCheck className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
        {canMarkReadyForReview(item.available_actions) && (
          <RowActionItem
            label="שלח לבדיקה"
            onClick={() => void runAction(item.id, 'readyForReview')}
            icon={<SendHorizontal className="h-4 w-4" />}
            disabled={isLoading || isDisabled}
          />
        )}
        {canDelete && (
          <>
            <RowActionSeparator />
            <RowActionItem
              label="מחק תיק"
              onClick={() => setConfirmOpen(true)}
              icon={<Trash2 className="h-4 w-4" />}
              disabled={isLoading || isDisabled || isDeleting}
              danger
            />
          </>
        )}
      </RowActionsMenu>
      {canDelete && (
        <ConfirmDialog
          open={confirmOpen}
          title='מחיקת תיק מע"מ'
          message="האם למחוק את התיק? פעולה זו אינה הפיכה."
          confirmLabel="מחק"
          cancelLabel="ביטול"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={async () => {
            const ok = await deleteWorkItem(item.id)
            if (ok) setConfirmOpen(false)
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}

VatWorkItemRowActions.displayName = 'VatWorkItemRowActions'
```

### Drawer And Overlay Behavior

#### `src/components/ui/overlays/DetailDrawer.tsx`

```tsx
import { OverlayContainer } from '../layout/OverlayContainer'
import { UnsavedChangesGuard } from '../feedback/UnsavedChangesGuard'
import { SectionHeader } from '../layout/SectionHeader'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

interface DetailDrawerProps {
  open: boolean
  title: React.ReactNode
  subtitle?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  /** Optional sticky footer — rendered below the scrollable content area. */
  footer?: React.ReactNode
  /** When true, closing shows a confirmation prompt before discarding */
  isDirty?: boolean
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  isDirty = false,
}) => {
  const { showGuard, handleClose, handleContinue, handleDiscard } = useUnsavedChangesGuard({
    isDirty,
    onClose,
  })

  return (
    <>
      <OverlayContainer
        open={open}
        variant="drawer"
        title={title}
        subtitle={subtitle}
        footer={footer}
        onClose={handleClose}
      >
        {children}
      </OverlayContainer>

      {showGuard && <UnsavedChangesGuard onContinue={handleContinue} onDiscard={handleDiscard} />}
    </>
  )
}
DetailDrawer.displayName = 'DetailDrawer'

// ── Field row ──────────────────────────────────────────────────────────────────

interface DrawerFieldProps {
  label: string
  value: React.ReactNode
}

export const DrawerField: React.FC<DrawerFieldProps> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500 shrink-0">{label}</span>
    <span className="text-sm text-gray-900 text-start font-medium">{value ?? '—'}</span>
  </div>
)
DrawerField.displayName = 'DrawerField'

// ── Section ────────────────────────────────────────────────────────────────────

interface DrawerSectionProps {
  title: string
  children: React.ReactNode
}

export const DrawerSection: React.FC<DrawerSectionProps> = ({ title, children }) => (
  <div>
    <SectionHeader title={title} size="xs" className="mb-2" />
    <div className="rounded-lg border border-gray-200 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">{children}</div>
  </div>
)
DrawerSection.displayName = 'DrawerSection'
```

#### `src/features/notifications/components/NotificationDrawer.tsx`

```tsx
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { cn } from '../../../utils/utils'
import { Button } from '../../../components/ui/primitives/Button'
import { useNotifications } from '../hooks/useNotifications'
import { useEscapeToClose } from '../../../components/ui/overlays/useEscapeToClose'
import { useRole } from '../../../hooks/useRole'
import { DrawerNotificationListItem } from './NotificationListItem'
import { SendNotificationModal } from './SendNotificationModal'
import { CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS } from '../api'
import type { NotificationDrawerProps } from '../types'

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose, clientRecordId }) => {
  const { data } = useNotifications(
    {
      client_record_id: clientRecordId,
      status: 'sent',
      page: FIRST_PAGE,
      page_size: PAGE_SIZE_SM,
    },
    open,
  )
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const notifications = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = total > PAGE_SIZE_SM

  const handleClose = useCallback(() => {
    setSendOpen(false)
    onClose()
  }, [onClose])

  useEscapeToClose({ open, onClose: handleClose })

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  if (typeof document === 'undefined') return null
  if (!open && !sendOpen) return null

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-sm',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="התראות"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">התראות</h3>
          <div className="flex items-center gap-3">
            {isAdvisor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSendOpen(true)}
                className="gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-0 hover:bg-transparent"
              >
                <Send className="h-3.5 w-3.5" />
                שלח הודעה
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} aria-label="סגירה" className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">אין התראות</p>}
          {notifications.map((item) => (
            <DrawerNotificationListItem key={item.id} item={item} />
          ))}
        </div>
        {hasMore && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-2 text-center text-xs text-gray-400">
            מוצגות {PAGE_SIZE_SM} ההתראות שנשלחו לאחרונה מתוך {total}
          </div>
        )}
      </div>

      {isAdvisor && (
        <SendNotificationModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          clientRecordId={clientRecordId}
          allowedTriggers={CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS}
        />
      )}
    </>,
    document.body,
  )
}

NotificationDrawer.displayName = 'NotificationDrawer'
```

### Empty States

#### `src/components/ui/feedback/StateCard.tsx`

```tsx
import { Card } from '../primitives/Card'
import { Button } from '../primitives/Button'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'

export interface StateCardProps {
  icon: LucideIcon
  title?: string
  message: string
  variant?: 'default' | 'illustration' | 'minimal' | 'error'
  action?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  /** Dev-only error details block */
  details?: string
  className?: string
  size?: 'default' | 'compact'
}

export const StateCard: React.FC<StateCardProps> = ({
  icon: Icon,
  title,
  message,
  variant = 'default',
  action,
  secondaryAction,
  details,
  className,
  size = 'default',
}) => {
  const isError = variant === 'error'
  const isIllustration = variant === 'illustration'
  const isCompact = size === 'compact'

  return (
    <Card className={cn(!isError && 'border-dashed', className)} variant="elevated">
      <div className={cn('flex flex-col items-center justify-center px-6 text-center', isCompact ? 'py-4' : 'py-12')}>
        <div
          className={cn(
            'relative animate-scale-in',
            isCompact ? 'mb-3' : 'mb-6',
            isIllustration && !isCompact && 'mb-8',
          )}
        >
          {isIllustration && (
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-100 rounded-full opacity-40 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-200 rounded-full opacity-60" />
            </div>
          )}
          <div
            className={cn(
              'relative rounded-2xl transition-transform duration-300 hover:scale-110',
              isCompact ? 'p-3' : 'p-5',
              isError
                ? 'rounded-full bg-negative-100 p-4'
                : isIllustration
                  ? 'bg-gradient-to-br from-primary-100 to-accent-100 shadow-lg'
                  : 'bg-gray-100',
            )}
          >
            <Icon
              className={cn(
                'transition-colors duration-300',
                isError
                  ? 'h-12 w-12 text-negative-600'
                  : isIllustration
                    ? 'h-12 w-12 text-primary-600'
                    : isCompact
                      ? 'h-5 w-5 text-gray-400'
                      : 'h-10 w-10 text-gray-400',
              )}
            />
          </div>
        </div>

        {title && (
          <h3
            className={cn(
              'mb-3 font-semibold text-gray-900',
              isCompact ? 'text-sm' : isError ? 'text-2xl font-bold' : 'text-xl',
            )}
          >
            {title}
          </h3>
        )}

        <p
          className={cn(
            'max-w-md leading-relaxed text-gray-600',
            isCompact ? 'mb-3 text-sm' : isError ? 'mb-6 text-base' : 'mb-6 text-base max-w-3xl',
          )}
        >
          {message}
        </p>

        {details && (
          <div className="text-start bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 w-full">
            <div className="text-xs font-mono text-negative-600 whitespace-pre-wrap break-all">{details}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button onClick={action.onClick} variant={isError ? 'primary' : 'primary'}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

StateCard.displayName = 'StateCard'
```

#### `src/features/documents/components/DocumentsEmptyState.tsx`

```tsx
import { FileText, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/primitives/Button'

interface DocumentsEmptyStateProps {
  hasDocuments: boolean
  onUploadClick: () => void
}

export const DocumentsEmptyState: React.FC<DocumentsEmptyStateProps> = ({ hasDocuments, onUploadClick }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-14 text-center">
    <FileText className="h-9 w-9 text-gray-300" />
    {!hasDocuments ? (
      <>
        <p className="text-sm font-medium text-gray-500">עדיין לא הועלו מסמכים ללקוח זה</p>
        <Button size="sm" onClick={onUploadClick} className="gap-1.5 mt-1">
          <Plus className="h-4 w-4" />
          העלאת מסמך ראשון
        </Button>
      </>
    ) : (
      <p className="text-sm font-medium text-gray-500">לא נמצאו מסמכים מתאימים לחיפוש</p>
    )}
  </div>
)
```

#### `src/features/dashboard/components/DashboardOnboardingEmptyState.tsx`

```tsx
import { Link } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { DashboardPanel } from './DashboardPrimitives'

export const DashboardOnboardingEmptyState = () => {
  return (
    <DashboardPanel className="border-dashed">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <UserPlus className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">עדיין אין נתונים במערכת</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              כדי להתחיל: צור לקוח ראשון. המערכת תפתח קלסר ותייצר מועדים רלוונטיים אוטומטית.
            </p>
          </div>
        </div>
        <Link
          to="/clients?create=1"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-elevation-1 transition-colors hover:bg-primary-700"
        >
          צור לקוח ראשון
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </DashboardPanel>
  )
}

DashboardOnboardingEmptyState.displayName = 'DashboardOnboardingEmptyState'
```

### KPI / Stat Cards Candidate

#### `src/components/ui/layout/StatsCard.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { semanticStatToneClasses } from '@/utils/semanticColors'

type StatVariant = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'neutral'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  eyebrow?: string
  icon?: LucideIcon
  variant?: StatVariant
  trend?: {
    value: number
    label: string
  }
  progress?: number
  selected?: boolean
  onClick?: () => void
  className?: string
  actionLabel?: string
  compact?: boolean
}

const STAT_VARIANTS: Record<
  StatVariant,
  {
    accent: string
    border: string
    iconBg: string
    value: string
    strip: string
    progress: string
    progressTrack: string
  }
> = {
  blue: {
    ...semanticStatToneClasses.info,
    progress: 'bg-info-500',
    progressTrack: 'bg-info-50',
  },
  green: {
    ...semanticStatToneClasses.positive,
    progress: 'bg-positive-500',
    progressTrack: 'bg-positive-50',
  },
  red: {
    ...semanticStatToneClasses.negative,
    progress: 'bg-negative-500',
    progressTrack: 'bg-negative-50',
  },
  orange: {
    ...semanticStatToneClasses.warning,
    progress: 'bg-warning-500',
    progressTrack: 'bg-warning-50',
  },
  purple: {
    accent: 'bg-violet-500',
    border: 'border-r-2 border-r-violet-500',
    iconBg: 'bg-violet-50 text-violet-500',
    value: 'text-violet-700',
    strip: 'from-violet-500/10 to-transparent',
    progress: 'bg-violet-500',
    progressTrack: 'bg-violet-50',
  },
  neutral: {
    ...semanticStatToneClasses.neutral,
    progress: 'bg-gray-500',
    progressTrack: 'bg-gray-100',
  },
}

const clampProgress = (value: number) => Math.min(Math.max(value, 0), 100)

const formatTrend = (value: number) => {
  if (value > 0) return { icon: '↑', className: 'bg-positive-100 text-positive-700' }
  if (value < 0) return { icon: '↓', className: 'bg-negative-100 text-negative-700' }

  return { icon: '→', className: 'bg-gray-100 text-gray-700' }
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  eyebrow,
  icon: Icon,
  variant = 'neutral',
  trend,
  progress,
  selected = false,
  onClick,
  className,
  actionLabel,
  compact = false,
}) => {
  const [displayValue, setDisplayValue] = useState(() => (typeof value === 'number' ? 0 : null))
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      setDisplayValue(null)
      return
    }

    const durationMs = 900
    const startValue = 0
    const endValue = value
    const startedAt = performance.now()

    const animate = (now: number) => {
      const elapsedRatio = Math.min((now - startedAt) / durationMs, 1)
      const easedRatio = 1 - Math.pow(1 - elapsedRatio, 3)
      const nextValue = Math.round(startValue + (endValue - startValue) * easedRatio)

      setDisplayValue(nextValue)

      if (elapsedRatio < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [value])

  const config = STAT_VARIANTS[variant]
  const isInteractive = Boolean(onClick)
  const trendConfig = trend ? formatTrend(trend.value) : null

  const card = (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200',
        compact ? 'min-h-[150px] px-4 py-3' : 'px-5 py-4',
        isInteractive && 'hover:shadow-md',
        selected && 'ring-2 ring-primary-400 ring-offset-0',
        isInteractive && !selected && 'ring-1 ring-transparent',
        config.border,
        className,
      )}
    >
      <div className={cn('absolute bottom-0 right-0 top-0 w-0.5 rounded-r-xl', config.accent)} />

      <div
        className={cn(
          'relative flex h-full min-w-0',
          compact ? 'flex-col justify-between gap-2' : 'flex-row-reverse items-start gap-4',
        )}
      >
        {Icon && (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-lg',
              compact ? 'absolute left-0 top-0 h-8 w-8' : 'h-10 w-10',
              config.iconBg,
            )}
          >
            <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
        )}

        <div className={cn('min-w-0 flex-1 text-right', compact && 'flex flex-col justify-between')}>
          <p className={cn('text-xs text-gray-500', compact ? 'mb-2 pl-9' : 'mb-0.5')}>{title}</p>

          {eyebrow && <p className="mb-1 text-xs font-medium text-gray-500">{eyebrow}</p>}

          <div>
            <div className={cn('font-bold leading-tight tabular-nums', compact ? 'text-xl' : 'text-lg', config.value)}>
              {typeof value === 'number' ? (displayValue ?? value).toLocaleString('he-IL') : value}
            </div>

            {description && (
              <p className={cn('mt-1 text-gray-600', compact ? 'text-xs leading-snug' : 'text-sm leading-relaxed')}>
                {description}
              </p>
            )}
          </div>

          {progress !== undefined && (
            <div className={cn('mt-3 h-2 w-full rounded-full', config.progressTrack)}>
              <div
                className={cn('h-2 rounded-full transition-all duration-700', config.progress)}
                style={{ width: `${clampProgress(progress)}%` }}
              />
            </div>
          )}

          {trend && trendConfig && (
            <div className="mt-3 flex flex-row-reverse items-center gap-2 text-sm">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                  trendConfig.className,
                )}
              >
                {trendConfig.icon} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}

          {actionLabel && (
            <p className={cn('text-xs font-medium text-gray-500', compact ? 'mt-2' : 'mt-3')}>{actionLabel}</p>
          )}
        </div>
      </div>
    </div>
  )

  if (!isInteractive) {
    return card
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full text-right transition-transform hover:scale-[1.01]"
    >
      {card}
    </button>
  )
}
```

#### `src/features/dashboard/components/DashboardStatsGrid.tsx`

```tsx
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { staggerAnimationDelayVars } from '../../../utils/animation'
import { DashboardMetricCard } from './DashboardPrimitives'

export interface StatItem {
  key: string
  title: string
  value: string | number
  description: string
  eyebrow?: string
  icon: LucideIcon
  variant: 'blue' | 'green' | 'red' | 'amber' | 'purple'
  urgent?: boolean
  href?: string
  progress?: number
  actionLabel?: string
}

interface DashboardStatsGridProps {
  stats: StatItem[]
}

/* ── Single stat card ───────────────────────────────────────────────────── */

interface StatCardProps {
  stat: StatItem
  index: number
}

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
  const cardClass = cn(
    'group relative transition-all duration-200',
    'animate-fade-in h-full',
    stat.href && 'cursor-pointer',
  )

  const inner = (
    <div className="relative h-full">
      <DashboardMetricCard
        title={stat.title}
        value={stat.value}
        description={stat.description}
        eyebrow={stat.eyebrow}
        icon={stat.icon}
        tone={stat.variant}
        urgent={stat.urgent}
        progress={stat.progress}
        actionLabel={stat.actionLabel}
      />
    </div>
  )

  if (stat.href) {
    return (
      <Link
        to={stat.href}
        className={`${cardClass} [animation-delay:var(--enter-delay)]`}
        style={staggerAnimationDelayVars(index, 60)}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div className={`${cardClass} [animation-delay:var(--enter-delay)]`} style={staggerAnimationDelayVars(index, 60)}>
      {inner}
    </div>
  )
}
StatCard.displayName = 'StatCard'

/* ── Grid ───────────────────────────────────────────────────────────────── */

export const DashboardStatsGrid = ({ stats }: DashboardStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.key} stat={stat} index={index} />
      ))}
    </div>
  )
}

DashboardStatsGrid.displayName = 'DashboardStatsGrid'
```

## Recommended Refactor Sequence

1. Define the policies before editing: row-action inline/menu rule, drawer mechanic rule, and filter/client-picker ownership rule.
2. Fix the shared client-picker URL hydration path first, because it unblocks several filter migrations.
3. Normalize filters/toolbars in the highest-traffic list pages: charges, clients, binders, work queue, tax calendar.
4. Normalize row actions, starting with `ClientRowActions`, `UserRowActions`, and `VatWorkItemRowActions`.
5. Convert `NotificationDrawer` to the shared drawer path.
6. Convert obvious empty-state duplicates like documents.
7. Decide dashboard KPI/status-badge policy after the high-confidence cleanup, then migrate only if the design decision says they should converge.

## Risks / Open Questions

- `frontend/AGENTS.md` is absent although the review skill expects it. If it exists in another checkout, this report may miss frontend-local instructions from that file.
- Some files had existing user changes, especially VAT row actions and VAT invoice mutations. This report reads them as current state but does not modify them.
- Dashboard and financial cards may be intentionally different from operational stat cards. Treat those as design decisions, not automatic refactor targets.
- Search advanced filters combine disclosure state and client picker state; a shared abstraction may be useful, but over-generalizing it would violate the page-structure guidance against generic mega-components.
- No formatting/tests were run because this is an audit Markdown-only task.
