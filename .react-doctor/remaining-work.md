# React Doctor — remaining work map

Rebuilt from a live scan on **2026-06-21** (tsc clean, vitest 48/48). 161 raw diagnostics →
**78 real findings** after excluding FP-by-rule noise → **~73 actionable** after the documented
per-site false positives below.
Read `.react-doctor/false-positives.md` first — it is the source of truth for findings that must NOT be re-fixed.

---

## How to use this file

1. Re-scan: `node_modules/.bin/react-doctor --json --no-score . > /tmp/rd.json` (or `npx react-doctor@latest …`).
2. Filter every finding against `false-positives.md` (whole-rule FPs) AND the per-site FP list below.
3. Per rule you fix: `curl https://react.doctor/docs/rules/react-doctor/<rule>` (no cache), apply the
   canonical fix at the root cause, re-run the tool to confirm, then `npx tsc -p tsconfig.app.json --noEmit`
   + `npx vitest run`.

Guardrails: never delete `@auditContract` exports (backend enum-sync CI); don't break `OverlayPortalContext`
(makes dropdowns render inside top-layer `<dialog>`s); the PDF iframe in `DocumentPreviewModal` is a
documented can't-fix (unsandboxed on purpose).

**FP-by-rule (excluded from the 78 — see `false-positives.md`):** prefer-tag-over-role,
query-mutation-missing-invalidation, query-destructure-result, no-mutable-in-deps, js-hoist-intl,
js-combine-iterations, js-index-maps, async-defer-await, no-static-element-interactions,
control-has-associated-label, no-tiny-text, iframe-missing-sandbox, click-events-have-key-events,
no-noninteractive-element-interactions, prefer-dynamic-import, unused-export, unused-dev-dependency,
no-many-boolean-props, jsx-no-jsx-as-prop.

---

## ✅ Done since the 2026-06-20 snapshot

The previous snapshot was badly stale. Verified clear on the 2026-06-21 scan:

| File | Was | Now | How |
|---|---|---|---|
| `features/tasks/components/form/TaskModal.tsx` | 19 | **0** | prior session (uncommitted at snapshot time) |
| `components/ui/inputs/SelectDropdown.tsx` | 4 | **0** | prior session (1 FP left) |
| `components/ui/inputs/DatePickerInlineSelect.tsx` | 4 | **0** | prior session (1 FP left) |
| `components/ui/inputs/DatePicker.tsx` | 3 | **0 real** | prior session (1 documented site-FP left) |
| `features/advancedPayments/hooks/useAdvancePaymentDrawerForm.ts` | 9 | **0** | 2026-06-21 — sync effect → lazy `useState` + `key={row.id}` |
| `features/charges/components/list/ChargesFiltersCard.tsx` | 6 | **0** | 2026-06-21 — derived clientName + `onMultiChange` pairing |

Plus the 4 real `exhaustive-deps` fixed 2026-06-21 (see commit history): `AnnualReportDetailForm`
(RHF `values`), `useSearchDebounce` (ref-latest), `SendNotificationModal` (auto-preview ref),
`useAdvancePaymentDrawerForm` (above). The "shared primitives first" sequencing is **complete**.

---

## Documented per-site false positives still in the raw scan (DO NOT fix)

These 5 are real-looking but verified FP in `false-positives.md` — subtract from the table below:

- `components/shared/client/ClientSearchInput.tsx` — `exhaustive-deps` (debounceRef unmount-clear)
- `features/annualReports/hooks/useAnnualReportsPage.ts` — `exhaustive-deps` (guarded one-shot year seed)
- `features/vatReports/hooks/useVatWorkItemActions.ts` — `exhaustive-deps` (cooldownTimerRef unmount-clear)
- `components/ui/inputs/DatePicker.tsx` — `no-adjust-state-on-prop-change` (post-mount DOM measurement)
- `features/clients/components/details/ClientDetailsOverviewTab.tsx` — `prefer-useReducer` (independent toggles)

---

## HEAVY — deliberate per-flow refactors (~73 actionable, DO NOT start without sign-off)

The state-derivation + event-handler family. Canonical fix is removing duplicated state
(`useState` initializers + `key`-based remount / derive-during-render / lift state up), not
relocating setters — see https://react.dev/learn/you-might-not-need-an-effect . Each touches call
sites, so it's a focused PR with manual verification of the affected flow.

### By file / flow (count — rules) — 2026-06-21 scan

| Count | File | Rules |
|---|---|---|
| 12 | `features/notifications/components/form/SendNotificationModal.tsx` | no-adjust-state×8, prefer-useReducer×1, no-cascading-set-state×1, no-reset-all-state×1, no-event-handler×1 |
| 5 | `features/binders/components/sections/BinderHandoverPanel.tsx` | no-derived-state×2, no-event-handler×2, prefer-useReducer×1 |
| 5 | `features/clients/components/edit/ClientEditForm.tsx` | no-pass-data-to-parent×3, no-prop-callback-in-effect×1, no-event-handler×1 |
| 4 | `features/tasks/components/shared/ClientTasksTab.tsx` | no-adjust-state×3, no-cascading-set-state×1 |
| 4 | `hooks/useBusinessesForClient.ts` | no-event-handler×3, no-pass-data-to-parent×1 |
| 3 | `components/ui/filters/ClientPickerFilter.tsx` | no-event-handler×2, no-derived-state×1 |
| 3 | `features/binders/components/sections/BinderDocumentsSection.tsx` | no-adjust-state×1, no-derived-state-effect×1, no-reset-all-state×1 |
| 3 | `features/clients/components/createClientModal/CreateClientModal.tsx` | no-adjust-state×1, no-event-handler×1, no-reset-all-state×1 |
| 3 | `features/taxCalendar/components/list/TaxCalendarGroupsTable.tsx` | no-adjust-state×1, no-derived-state-effect×1, no-reset-all-state×1 |
| 3 | `features/vatReports/components/form/VatWorkItemsCreateModal.tsx` | no-event-handler×3 |
| 2 | `components/shared/client/ClientSearchInput.tsx` | prefer-useReducer×1, advanced-event-handler-refs×1 *(+1 exhaustive-deps FP)* |
| 2 | `features/advancedPayments/hooks/useAdvancePaymentBatchRows.ts` | no-adjust-state×1, no-derived-state-effect×1 |
| 2 | `features/charges/components/form/ChargesCreateModal.tsx` | no-event-handler×2 |
| 2 | `features/documents/components/form/DocumentsUploadCard.tsx` | no-pass-data-to-parent×1, no-prop-callback-in-effect×1 |
| 2 | `features/vatReports/components/list/VatWorkItemsGroupedCards.tsx` | no-adjust-state×1, no-reset-all-state×1 |
| 2 | `features/timeline/components/ClientTimelineTab.tsx` | no-derived-state×2 |
| 2 | `hooks/useSearchDebounce.ts` | no-derived-state×1, no-derived-state-effect×1 |
| 1 | `components/ui/primitives/Tooltip.tsx` | advanced-event-handler-refs×1 |
| 1 | `components/ui/overlays/ConfirmDialog.tsx` | no-derived-state×1 |
| 1 | `components/ui/overlays/useOverlayDismiss.ts` | no-react19-deprecated-apis×1 |
| 1 | `components/ui/layout/OverlayContainer.tsx` | no-derived-state×1 |
| 1 | `features/annualReports/components/shared/CreateReportModal.tsx` | no-pass-data-to-parent×1 |
| 1 | `features/annualReports/components/tax/AnnualReportDetailForm.tsx` | no-event-handler×1 |
| 1 | `features/binders/hooks/useReceiveBinderDrawer.ts` | no-event-handler×1 |
| 1 | `features/auth/pages/ResetPasswordPage.tsx` | prefer-useReducer×1 |
| 1 | `features/correspondence/components/CorrespondenceModal.tsx` | no-event-handler×1 |
| 1 | `features/documents/components/form/DocumentEditCard.tsx` | no-pass-data-to-parent×1 |
| 1 | `features/documents/components/list/DocumentsDataCards.tsx` | prefer-useReducer×1 |
| 1 | `features/signatureRequests/components/form/CreateSignatureRequestModal.tsx` | prefer-useReducer×1 |
| 1 | `features/vatReports/components/form/VatFileModal.tsx` | no-event-handler×1 |
| 1 | `features/users/components/form/EditUserModal.tsx` | no-event-handler×1 |

`prefer-useReducer` is only a real fix where the flagged `useState` calls transition **in lockstep**;
independent slices stay as separate `useState` (see `false-positives.md`).

### Recommended sequencing

1. **Quick singles** (low blast radius): `useOverlayDismiss` (no-react19-deprecated-apis — likely a one-liner),
   `ConfirmDialog` / `OverlayContainer` / `ClientTimelineTab` (no-derived-state), `Tooltip`.
2. **Self-contained mid-size**: `ClientPickerFilter` (3), `VatWorkItemsCreateModal` (3), `ChargesCreateModal` (2).
3. **One modal/flow per PR** (verify manually): `SendNotificationModal` (12, auto-preview already done),
   `BinderHandoverPanel` (5), `ClientEditForm` (5), `CreateClientModal` (3).
4. **Shared hook/util with care** (ripple): `useSearchDebounce`, `useBusinessesForClient`, `ClientSearchInput`.
