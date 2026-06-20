# React Doctor — known false positives

Patterns here are dropped during triage. Each entry says how to verify before suppressing — never suppress on filename alone.

## react-doctor/query-mutation-missing-invalidation

The rule only detects a literal `.invalidateQueries` / `.setQueryData` / `.resetQueries` member call **inside** the `useMutation` options object. It cannot trace a helper function. This codebase deliberately centralizes invalidation in reusable helpers (endorsed by `docs/frontend/architecture.md` → "Mutation hooks own cache updates, targeted invalidation, and reusable mutation lifecycle behavior"), so the rule fires even though invalidation is correctly present.

**Verify before suppressing:** open the flagged `useMutation` and confirm its `onSuccess`/`onSettled` either (a) calls a local helper whose body calls `queryClient.invalidateQueries(...)` / `setQueryData(...)`, or (b) mutates nothing that is cached and shown to the user. If neither holds, it is a REAL bug — fix it.

Confirmed FP sites (2026-06-19 scan):

- Invalidation via helper (`invalidate()`, `invalidateClientYear()`, `invalidateUsers()`, `invalidateTaskLists()`, `invalidateVatWorkItem()`, `invalidateVatInvoiceQueries()`, `handleTaskMutationSuccess()`):
  - `src/features/annualReports/hooks/useAnnexDataPanel.ts` (add/update/delete)
  - `src/features/annualReports/hooks/useIncomeExpenseMutations.ts` (all six)
  - `src/features/advancedPayments/hooks/useClientAdvancePaymentsTab.ts` (generate/update)
  - `src/features/tasks/hooks/useTaskActions.ts` (create; others use `setQueryData` + helper)
  - `src/features/signatureRequests/hooks/useSignatureRequestActions.ts` (create/cancel)
  - `src/features/vatReports/hooks/useVatInvoiceMutations.ts` (add/delete/update/deleteWorkItem)
  - `src/features/vatReports/hooks/useVatWorkItemsPage.ts` (create/action/sendBack)
  - `src/features/users/hooks/useUsersPage.ts` (create/update/toggleActive)
  - `src/features/workQueue/hooks/useWorkQueueActions.ts` (createTask/updateTask)
- Nothing to invalidate (no cached server-state change):
  - `src/features/notifications/hooks/useSendNotification.ts` (`usePreviewNotification` — read-only preview)
  - `src/features/users/hooks/useUsersPage.ts` (resetPassword — password is never cached/displayed)
- UI driven by local state, no cached list to refresh (public single-use page):
  - `src/features/signing/hooks/useSigningPageState.ts` (approve/decline — terminal state via `setPageState`)

## react-doctor/query-destructure-result

Fires unconditionally on `const x = useQuery(...)` (whole result held under one name), with no usage analysis. The recipe itself lists "forwarded as-is, returned untouched from a custom hook, or kept to spread later" as legitimate reasons to hold the whole object.

**Verify before suppressing:** confirm the binding is spread (`return { ...query }`), passed wholesale to a child/function, or returned untouched. If individual fields are read and the object is otherwise unused, destructure instead.

Confirmed FP sites (2026-06-20 scan) — all spread/forward/return the whole query object:

- `src/features/audit/hooks/useEntityAuditTrail.ts` (`return { ...query, ... }`)
- `src/features/vatReports/hooks/useActiveVatBinder.ts` (`return { ...query, ... }`)
- `src/features/vatReports/hooks/useVatHistory.ts` (`return { ...query, ... }`)
- `src/features/vatReports/hooks/useVatPeriodOptions.ts` (`return { ...query, ... }`)
- `src/features/taxCalendarSettings/hooks/useTaxCalendarSettings.ts` (×3 — `rulesQuery`/`entriesQuery`/`summaryQuery` returned whole)
- `src/features/workQueue/hooks/useWorkQueueActions.ts` (`taskDetail` returned whole)
- `src/features/dashboard/hooks/useDashboardPage.ts` (`dashboardQuery` passed whole to `deriveDashboardState`)

## react-doctor/no-mutable-in-deps

Branch (b) matches a dep whose root identifier is named `location`/`window`/`history`/etc. **by name alone** — it never checks what the root resolves to.

**Verify before suppressing:** confirm the root is a local reactive binding (`const location = useLocation()`, a prop, state, or context value) that merely shares a browser-global name. If it is the genuine browser global, it is a REAL bug.

Confirmed FP sites (2026-06-20 scan):

- `src/router/AppRoutes.tsx` (`[location.pathname, location.search]` — `location` is react-router `useLocation()`, reactive)

## react-doctor/js-hoist-intl

Fires on `new Intl.*` inside any function body — including a module-scope memo-getter, so a cache helper still trips it. Genuinely cacheable cases (fixed options) are hoisted; the rest are dynamic-per-call.

**Verify before suppressing:** confirm the `Intl` options depend on per-call input (e.g. variable `fractionDigits`) so no single module-scope formatter can serve all calls.

Confirmed FP sites (2026-06-20 scan):

- `src/utils/utils.ts` → `formatCurrencyILS` (min/max fraction digits vary per call)
- `src/utils/utils.ts` → `formatPercent` (fraction digits vary per call)

## react-doctor/js-combine-iterations

Recipe FP: "N tiny enough that the extra pass is negligible." JSX `.filter().map(render)` over small static option arrays — collapsing into `flatMap` of JSX hurts readability for no measurable gain.

**Verify before suppressing:** confirm the source is a small static/constant array rendered to JSX (not a hot data path).

Confirmed FP sites (2026-06-20 scan):

- `src/features/binders/components/drawer/BinderReceivePanel.tsx` (`BINDER_TYPE_OPTIONS.filter().map(Checkbox)`)
- `src/features/taxCalendarSettings/pages/TaxCalendarSettingsPage.tsx` (`entryGroups.filter().map(render)`)

## react-doctor/js-index-maps

Recipe FP: "the searched array changes per iteration, so a pre-built index can't be reused."

**Verify before suppressing:** confirm the `.find()`/`.findIndex()` runs over a *different* array each loop iteration.

Confirmed FP sites (2026-06-20 scan):

- `src/components/ui/filters/filterBadges.ts` (`field.options.find(...)` — `field.options` differs per field in the loop)

## react-doctor/async-defer-await

Recipe FP: an early-return that is a legitimate post-await guard.

**Verify before suppressing:** confirm the `if (...) return` after the `await` is a *staleness/race* check that must run **after** the await (e.g. "was this request superseded while awaiting?"). Moving it before the await would defeat its purpose.

Confirmed FP sites (2026-06-20 scan):

- `src/components/shared/client/ClientSearchInput.tsx` (`if (requestId !== requestIdRef.current) return` — debounced-search supersession guard)

## react-doctor/prefer-tag-over-role

Fires on generic `div`/`span` carrying a `role` that maps to a native tag. FP when no native tag fits the widget.

**Verify before suppressing:** confirm (a) it's a custom ARIA composite widget (`listbox`/`option`) that cannot be a native `<select>` because it renders custom children, or (b) `role="status"` live-region, where the mapped `<output>` is semantically wrong (output = form-calculation result).

Confirmed FP sites (2026-06-20 scan):

- Custom combobox/listbox (cannot be native `<select>`):
  - `src/components/shared/client/ClientSearchInput.tsx` (`listbox` + `option` on divs — aria-activedescendant pattern)
  - `src/components/ui/inputs/DatePickerInlineSelect.tsx` (`listbox`)
  - `src/components/ui/inputs/SelectDropdown.tsx` (`listbox`)
- `role="status"` live-region (`<output>` semantically wrong):
  - `src/components/ui/primitives/Spinner.tsx`
  - `src/features/auth/pages/LoginPage.tsx`
- Drag-and-drop zone (cannot be a native `<button>` — wraps drag handlers / a nested file input):
  - `src/features/documents/components/form/DocumentsUploadCard.tsx`

## react-doctor/no-static-element-interactions

FP when the role is set correctly but dynamically (the static check can't prove it), or the element is an event-bubbling wrapper, not an interaction target.

**Verify before suppressing:** confirm the handler element either sets an interactive `role` via a conditional the checker can't read, or only catches bubbled events from interactive descendants.

Confirmed FP sites (2026-06-20 scan):

- `src/components/ui/primitives/Badge.tsx` (`role={onClick ? 'button' : undefined}` — correct, but role is dynamic)
- `src/components/ui/primitives/Tooltip.tsx` (hover/focus wrapper for tooltip display, not a click target)

## react-doctor/control-has-associated-label

Firing set includes `th`/`td`. Empty decorative spacer/corner cells in tables have no meaningful accessible name to give.

**Verify before suppressing:** confirm the cell is a layout spacer / empty corner cell (no interactive content, no data). Real unlabelled controls (inputs, buttons, action-column headers) must still be labelled.

Confirmed FP sites (2026-06-20 scan):

- `src/features/annualReports/components/annex/AnnexDataTable.tsx` (empty `<th />` spacer)
- `src/features/annualReports/components/shared/ClientYearComparisonModal.tsx` (empty top-left corner `<th>`)
- `src/features/vatReports/components/detail/VatCategoryTable.tsx` (empty `<td />` spacer)
- `src/features/vatReports/components/list/VatInvoiceTable.tsx` (empty footer `<td colSpan>` spacer)

## react-doctor/no-tiny-text

Treats SVG `font-size` as CSS px. SVG `<text>` scales with the chart's viewBox, so a value below 12 may render larger than 12px on screen.

**Verify before suppressing:** confirm it's SVG `<text>` inside a chart whose rendered size differs from its user-unit coordinate system. HTML body text below 12px is a REAL finding.

Confirmed FP sites (2026-06-20 scan):

- `src/features/dashboard/components/panels/SeasonInsightsCarousel.tsx` (donut-center `<text fontSize={9}>`)
- `src/features/dashboard/components/panels/SeasonSummaryWidget.tsx` (donut-center `<text fontSize={10}>`)

## react-doctor/iframe-missing-sandbox

FP when the framed content genuinely requires `allow-scripts` + `allow-same-origin` to function (a combination that defeats the sandbox) and the source is trusted/same-origin.

**Verify before suppressing:** confirm the frame breaks under a real sandbox AND the `src` is same-origin content the app itself serves.

Confirmed FP sites (2026-06-20 scan):

- `src/features/documents/components/detail/DocumentPreviewModal.tsx` (PDF preview — Chrome's built-in PDF viewer needs the escape combo to render; `src` is a same-origin document we serve. Verified in-browser 2026-06-20: any sandbox without that pair blocks the viewer's scripts.)

## react-doctor/click-events-have-key-events + react-doctor/no-noninteractive-element-interactions

Both fire together on a native `<dialog>` that carries an `onClick` backdrop-click-to-close handler. The handler only closes when `event.target === dialogRef.current` (i.e. the click landed on the backdrop pseudo-element, not the panel content). The `<dialog>` is a modal: Escape is handled natively via `onCancel`, so no keyboard listener is needed for dismissal, and backdrop click is a pure mouse-only *enhancement* (not the only way to close). Both lines already carry an `eslint-disable-next-line` with the same rationale; react-doctor cannot read eslint-disable comments, so it re-reports.

**Verify before suppressing:** confirm (a) the element is a modal `<dialog>` (native Escape dismissal), (b) the click handler is guarded to the backdrop target only, and (c) closing is also reachable by keyboard (Escape) and by an in-panel button. If any is missing, it is a REAL finding.

Confirmed FP sites (2026-06-20 scan):

- `src/components/ui/layout/OverlayContainer.tsx` (drawer variant — `event.target === dialogRef.current` backdrop close; Escape via `onCancel`)
- `src/components/ui/overlays/ConfirmDialog.tsx` (sheet — `closeOnBackdrop && event.target === dialogRef.current`; Escape via `onCancel`)

## react-doctor/exhaustive-deps

Two distinct FP shapes here (the rest of the exhaustive-deps findings are REAL and tracked in `remaining-work.md`):

### (a) Unmount cleanup that clears the *latest* pending timer via a ref

The rule warns "cleanup may read the wrong node since `ref.current` can change before it runs" and suggests capturing the value at effect-setup. For a mount-only effect whose cleanup clears a **pending timer**, capturing at setup grabs `null` (no timer exists yet) — the cleanup must read the *latest* `ref.current` at unmount to clear whatever timer is in flight. The suggested fix would leak the timer.

**Verify before suppressing:** confirm the effect has `[]` deps, the cleanup clears a timer/subscription stored in a ref that is written *after* mount, and capturing at setup time would read a stale/empty value.

- `src/components/shared/client/ClientSearchInput.tsx:78` (`debounceRef.current` — clears pending debounce on unmount)
- `src/features/vatReports/hooks/useVatWorkItemActions.ts:20` (`cooldownTimerRef.current` — clears action-cooldown timer on unmount)

### (b) One-shot seed effect that intentionally excludes a reactive value

The rule wants `year`/`setFilter` added. The effect seeds a URL filter from an async-loaded default **once it arrives**, guarded by `if (!year)`. Adding `year` to deps would re-run when the user clears `year` (their explicit "all years" mode) and re-seed the default — fighting the user. `year` is excluded on purpose; `setFilter` is referentially stable.

**Verify before suppressing:** confirm the excluded value is guarded against (the effect no-ops when it's set) and re-running on its change would undo a deliberate user action.

- `src/features/annualReports/hooks/useAnnualReportsPage.ts:37` (seed `year` from `defaultTaxYear` once, guarded by `!year`)

## react-doctor/no-many-boolean-props

Fires at 4+ props with boolean-ish prefixes (`is|has|should|can|show|...`). The canonical fix (a `variant`/`size` enum or compound subcomponents) targets **presentational** components with mutually-exclusive style stacks (`<Button isPrimary isLarge hasIcon>`). The rule's own caveat: *"validate that flagged props are actually mutually-exclusive booleans before refactoring."*

**Verify before suppressing:** confirm the component is a **stateful container/form/dialog** (not a presentational variant), and the flagged booleans are **orthogonal independent state** (loading + error + permission + UI-mode + dialog-open) that cannot share a single discriminant. Collapsing orthogonal flags into one enum is semantically wrong; bundling them into a state object adds indirection and rewrites every call site for no gain. If the flags ARE a mutually-exclusive set (e.g. a loading/error pair → query `status`), collapse them (REAL finding).

Confirmed FP sites (2026-06-20 scan) — orthogonal state on container components:

- `src/features/vatReports/components/list/VatWorkItemRowActions.tsx` (`isLoading`/`isDisabled`/`canDelete`/`isDeleting` — action state + permission)
- `src/features/clients/components/details/ClientDetailsOverviewTab.tsx` (`canEditClients`/`isUpdating`/`isDeleting`/`isEditing` — perm + 2 mutations + UI mode)
- `src/features/clients/components/details/ClientRelatedData.tsx` (`hasRequestedData`/`isFetching`/`canViewCharges`/`canCreateCharge` — load state + 2 perms)
- `src/features/binders/components/dialogs/BindersPageDialogs.tsx` (per-dialog open + loading flags — god-component aggregator; real smell but a HEAVY restructure, not an enum collapse)
- `src/features/clients/components/createClientModal/CreateClientStepContent.tsx` (8 orthogonal form/async/permission flags — prop-drilled step content)

(Resolved, not FP: `TasksListPanel` collapsed its `isLoading`/`isError` pair into a single `status: QueryStatus` prop.)

## react-doctor/jsx-no-jsx-as-prop

The rule allowlists slot-style prop names (`icon`/`tooltip`/`fallback`/`header`/`render*`/`*Button`/`*Icon`/`*Component`) but not every layout-slot name. `DetailTabPanel` exposes `summary`/`filters`/`actions` as `React.ReactNode` slots — functionally identical to the allowlisted `header`/`fallback`. The rule's own docs note these fire "despite negligible re-render costs, particularly when child components aren't themselves memoized."

**Verify before suppressing:** confirm (a) the prop is a layout/content slot typed `React.ReactNode`, (b) the receiving component is **not** `React.memo`'d, and (c) the slotted child component is **not** `React.memo`'d either. When all hold, prop identity gates nothing — the parent re-renders with its own parent regardless — so `useMemo` adds dep-array risk for zero render benefit. If the consumer *is* memoized, memoize the slot (REAL finding).

Confirmed FP sites (2026-06-20 scan) — `DetailTabPanel` is a plain FC (not memoized), and `ChargesSummaryBar`/`TaxCalendarStatsSection`/`TaxCalendarFiltersBar` are not memoized:

- `src/features/charges/components/shared/ClientChargesTab.tsx` (`summary={<ChargesSummaryBar/>}`)
- `src/features/notifications/components/shared/NotificationsTab.tsx` (`summary={...}`)
- `src/features/taxCalendar/components/shared/ClientTaxCalendarTab.tsx` (`summary={<TaxCalendarStatsSection/>}`, `filters={<TaxCalendarFiltersBar/>}`)

## react-doctor/prefer-dynamic-import

Flags any static `import ... from '<heavy-lib>'` (recharts/monaco/draft-js). It fires at the import line and does **not** trace whether the module containing that import is itself only reached via a dynamic `import()`/`React.lazy`. recharts exports named JSX components, so the import cannot be rewritten to `lazy(() => import('recharts'))` in place — the deferral must happen at the consumer.

**Verify before suppressing:** confirm the recharts-importing module has exactly one consumer and that consumer loads it via `React.lazy(() => import(...))` wrapped in `<Suspense>` (so recharts lands in its own deferred chunk). The bundle goal is met even though the rule still reports the leaf's static import.

Confirmed FP sites (2026-06-20 scan):

- `src/features/annualReports/components/financials/MultiYearPLChart.tsx` (only importer of recharts; lazy-loaded from `AnnualPLSummary.tsx` via `lazy()` + `Suspense` — recharts is in a deferred chunk)

## deslop/unused-export

FP when an export is consumed by an out-of-repo tool the scanner can't see.

**Verify before suppressing:** confirm a `@auditContract` doc-comment (read by the backend enum-sync CI) or another external consumer. A genuinely unreferenced symbol should be un-exported or deleted.

Confirmed FP sites (2026-06-20 scan) — all carry `/** @auditContract Read by the backend enum-sync audit. */`:

- `src/features/charges/constants.ts` → `CHARGE_STATUS_VALUES`
- `src/features/clients/constants.ts` → `CLIENT_ID_NUMBER_TYPES`
- `src/features/signatureRequests/constants.ts` → `SIGNATURE_REQUEST_STATUS_VALUES`, `SIGNATURE_REQUEST_TYPE_VALUES`
- `src/features/vatReports/constants/vatConstants.ts` → `VAT_WORK_ITEM_STATUS_VALUES`

## deslop/unused-dev-dependency

FP for CLI tooling that is invoked via `npx`/scripts rather than imported.

**Verify before suppressing:** confirm the package is a CLI/tool run from the command line or CI, not an importable module.

Confirmed FP sites (2026-06-20 scan):

- `package.json` → `react-doctor` (this scanner itself; run via `npx react-doctor`)
