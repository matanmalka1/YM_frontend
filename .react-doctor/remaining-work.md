# React Doctor — remaining work map

Snapshot after the 2026-06-20 cleanup pass (292 → 224 findings cleared & verified: tsc clean, vitest 48/48).
Read `.react-doctor/false-positives.md` first — it is the source of truth for findings that must NOT be re-fixed.

---

## How to use this file

1. Re-scan: `npx react-doctor@latest --json --no-score . > /tmp/rd.json 2>/dev/null`
2. Filter every finding against `false-positives.md`.
3. Fix order: **moderate (below) → shared input primitives → one modal-flow per PR → long tail.**
4. Per rule you fix: `curl https://react.doctor/docs/rules/react-doctor/<rule>` (no cache), apply the
   canonical fix at the root cause, re-run the tool to confirm, then `npx tsc -p tsconfig.app.json --noEmit`
   + `npx vitest run`.

Guardrails: never delete `@auditContract` exports (backend enum-sync CI); don't break `OverlayPortalContext`
(makes dropdowns render inside top-layer `<dialog>`s); the PDF iframe in `DocumentPreviewModal` is a
documented can't-fix (unsandboxed on purpose).

---

## MODERATE — ✅ CLEARED (pass 2026-06-20, commit 38b9259c: 224 → 215)

All moderate findings are resolved — either fixed at the root cause or triaged into
`false-positives.md` with a verify recipe. Outcomes:

| Rule | Count | Outcome |
|---|---|---|
| `query-mutation-missing-invalidation` | ~30 | All confirmed already-documented FP (helper-traced invalidation). No new bugs. |
| `exhaustive-deps` | 10 | ✅ 2 fixed (`useClientTimelinePage`) · 📝 3 FP (ref-cleanup timers ×2, one-shot seed) · ⏸ **5 deferred — they live in HEAVY files** (`DatePicker`, `useAdvancePaymentDrawerForm`, `AnnualReportDetailForm`, `SendNotificationModal`, `useSearchDebounce`); the per-flow refactor deletes these prop→state sync effects, so patching deps now is throwaway. |
| `no-many-boolean-props` | 6 | ✅ 1 fixed (`TasksListPanel` isLoading/isError → `status`) · 📝 5 FP (orthogonal state on containers). |
| `no-multi-comp` | 4 | ✅ all fixed (`DetailDrawer`→`DrawerPrimitives`; `TaskListStates` split). |
| `jsx-no-jsx-as-prop` | 4 | 📝 all FP (slot JSX on unmemoized `DetailTabPanel`). |
| `jsx-no-constructed-context-values` | 1 | ✅ fixed (`RowActions` useCallback). |

Also cleared this pass: `no-react19-deprecated-apis` ×1 (fixed), `prefer-dynamic-import`
×1 (recharts lazy-split; rule can't trace the dynamic boundary → FP), 4 backdrop-`<dialog>`
a11y findings (FP). **Net: 9 fixed, 19 reclassified as documented FP.**

The 5 deferred `exhaustive-deps` are folded into the HEAVY work below — fix them as part of
each file's per-flow refactor, not separately.

---

## HEAVY — deliberate per-flow refactors (~124 findings, DO NOT start without sign-off)

The state-derivation + event-handler family. Canonical fix is removing duplicated state
(`useState` initializers + `key`-based remount), not relocating setters — see
https://react.dev/learn/you-might-not-need-an-effect . Touches call sites (pages/hooks), so each is a
focused PR with manual verification of the affected flow.

Rules in this family: `no-adjust-state-on-prop-change`, `no-derived-state`, `no-derived-state-effect`,
`no-cascading-set-state`, `no-chain-state-updates`, `no-reset-all-state-on-prop-change`, `prefer-useReducer`,
`no-event-handler`, `no-pass-data-to-parent`, `no-pass-live-state-to-parent`, `advanced-event-handler-refs`,
`no-prop-callback-in-effect`.

### By file / flow (count — rules)

| Count | File | Rules |
|---|---|---|
| 19 | `features/tasks/components/form/TaskModal.tsx` | no-derived-state×7, no-adjust-state×6, no-event-handler×3, no-cascading-set-state×2, prefer-useReducer×1 |
| 15 | `features/notifications/components/form/SendNotificationModal.tsx` | no-adjust-state×8, no-event-handler×4, prefer-useReducer×1, no-cascading-set-state×1, no-reset-all-state×1 |
| 9 | `features/advancedPayments/hooks/useAdvancePaymentDrawerForm.ts` | no-derived-state×7, no-cascading-set-state×1, no-adjust-state×1 |
| 7 | `hooks/useSearchDebounce.ts` | no-event-handler×3, no-derived-state-effect×1, no-derived-state×1, no-pass-data-to-parent×1, no-pass-live-state-to-parent×1 — *shared hook, ripple risk* |
| 6 | `features/charges/components/list/ChargesFiltersCard.tsx` | no-event-handler×3, no-derived-state×1, no-reset-all-state×1, no-adjust-state×1 |
| 5 | `features/binders/components/sections/BinderHandoverPanel.tsx` | no-event-handler×2, no-derived-state×2, prefer-useReducer×1 |
| 4 | `components/ui/inputs/DatePickerInlineSelect.tsx` | no-chain-state-updates×2, no-adjust-state×1, no-derived-state×1 — *shared primitive* |
| 4 | `components/ui/inputs/SelectDropdown.tsx` | prefer-useReducer×1, no-adjust-state×1, no-chain-state-updates×1, no-derived-state×1 — *shared primitive* |
| 4 | `features/tasks/components/shared/ClientTasksTab.tsx` | no-adjust-state×3, no-cascading-set-state×1 |
| 4 | `hooks/useBusinessesForClient.ts` | no-event-handler×3, no-pass-data-to-parent×1 |
| 3 | `components/ui/filters/ClientPickerFilter.tsx` | no-event-handler×2, no-derived-state×1 |
| 3 | `components/ui/inputs/DatePicker.tsx` | no-event-handler×1, no-derived-state×1, no-adjust-state×1 — *shared primitive* |
| 3 | `features/binders/components/sections/BinderDocumentsSection.tsx` | no-derived-state-effect×1, no-reset-all-state×1, no-adjust-state×1 |
| 3 | `features/clients/components/createClientModal/CreateClientModal.tsx` | no-reset-all-state×1, no-event-handler×1, no-adjust-state×1 |
| 3 | `features/clients/components/edit/ClientEditForm.tsx` | no-pass-data-to-parent×2, no-event-handler×1 |
| 3 | `features/taxCalendar/components/list/TaxCalendarGroupsTable.tsx` | no-derived-state-effect×1, no-reset-all-state×1, no-adjust-state×1 |
| 3 | `features/vatReports/components/form/VatWorkItemsCreateModal.tsx` | no-event-handler×3 |
| 2 | `components/shared/client/ClientSearchInput.tsx` | prefer-useReducer×1, advanced-event-handler-refs×1 |
| 2 | `features/advancedPayments/hooks/useAdvancePaymentBatchRows.ts` | no-derived-state-effect×1, no-adjust-state×1 |
| 2 | `features/annualReports/components/tax/AnnualReportDetailForm.tsx` | no-pass-data-to-parent×1, no-event-handler×1 |
| 2 | `features/charges/components/form/ChargesCreateModal.tsx` | no-event-handler×2 |
| 2 | `features/documents/components/form/DocumentsUploadCard.tsx` | no-pass-data-to-parent×1, no-prop-callback-in-effect×1 |
| 2 | `features/timeline/components/ClientTimelineTab.tsx` | no-derived-state×2 |
| 2 | `features/vatReports/components/list/VatWorkItemsGroupedCards.tsx` | no-reset-all-state×1, no-adjust-state×1 |
| 1 | `components/ui/layout/OverlayContainer.tsx` | no-derived-state×1 |
| 1 | `components/ui/overlays/ConfirmDialog.tsx` | no-derived-state×1 |
| 1 | `components/ui/primitives/Tooltip.tsx` | advanced-event-handler-refs×1 |
| 1 | `features/annualReports/components/shared/CreateReportModal.tsx` | no-pass-data-to-parent×1 |
| 1 | `features/auth/pages/ResetPasswordPage.tsx` | prefer-useReducer×1 |
| 1 | `features/binders/hooks/useReceiveBinderDrawer.ts` | no-event-handler×1 |
| 1 | `features/correspondence/components/CorrespondenceModal.tsx` | no-event-handler×1 |
| 1 | `features/documents/components/form/DocumentEditCard.tsx` | no-pass-data-to-parent×1 |
| 1 | `features/documents/components/list/DocumentsDataCards.tsx` | prefer-useReducer×1 |
| 1 | `features/signatureRequests/components/form/CreateSignatureRequestModal.tsx` | prefer-useReducer×1 |
| 1 | `features/users/components/form/EditUserModal.tsx` | no-event-handler×1 |
| 1 | `features/vatReports/components/form/VatFileModal.tsx` | no-event-handler×1 |

### Recommended sequencing

1. **Shared input primitives first** (they ripple everywhere): `DatePicker.tsx`, `DatePickerInlineSelect.tsx`, `SelectDropdown.tsx`.
2. **One modal-flow per PR**: `TaskModal` (19), then `SendNotificationModal` (15) — each touches its page + page-hook + call sites; verify create/edit/link/preview flows manually.
3. **Shared hook with care**: `useSearchDebounce` (consumed widely).
4. **Long tail**: the 1–4-each files above.
