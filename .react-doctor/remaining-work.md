# React Doctor — remaining work (clean TODO)

Audited from a live scan on **2026-06-21** (tsc clean, vitest 48/48).
**158 raw diagnostics → 69 real actionable** (83 excluded by FP-rule, 6 documented per-site FPs).
`false-positives.md` is the source of truth for what must NOT be re-fixed — every box below is
already filtered against it.

## How to use
1. Re-scan: `node_modules/.bin/react-doctor --json --no-score . > /tmp/rd.json`
2. Re-filter against `false-positives.md` (whole-rule + the 6 per-site FPs listed below).
3. Fix at the root cause (https://react.dev/learn/you-might-not-need-an-effect), re-scan to confirm,
   then `npx tsc -p tsconfig.app.json --noEmit` + `npx vitest run`. One file/flow per PR.

## Guardrails
- Never delete `@auditContract` exports (backend enum-sync CI).
- Don't break `OverlayPortalContext` (renders dropdowns inside top-layer `<dialog>`s) — see Tier 0.
- `DocumentPreviewModal` PDF iframe is an intentional can't-fix (unsandboxed on purpose).

## Excluded — documented per-site FPs (DO NOT fix; in `false-positives.md`)
- `ClientSearchInput.tsx:78` — exhaustive-deps (debounceRef unmount-clear)
- `useAnnualReportsPage.ts:37` — exhaustive-deps (guarded one-shot year seed)
- `useVatWorkItemActions.ts:20` — exhaustive-deps (cooldownTimerRef unmount-clear)
- `DatePicker.tsx:120` — no-adjust-state (post-mount DOM measurement)
- `ClientDetailsOverviewTab.tsx:73` — prefer-useReducer (independent toggles)
- `Tooltip.tsx:73` — advanced-event-handler-refs (`updatePosition` is `useCallback([])`)

## Done (2026-06-21)
TaskModal (19), SelectDropdown (4), DatePickerInlineSelect (4), DatePicker (3) — prior session ·
useAdvancePaymentDrawerForm (9), ChargesFiltersCard (6), 4× exhaustive-deps, useOverlayDismiss (1),
ClientTimelineTab (2) — this session. "Shared primitives first" sequencing is complete.

---

## Canonical fixes (by rule)
- `no-event-handler` / `no-prop-callback-in-effect` → move the logic into the actual event handler.
- `no-derived-state` / `no-derived-state-effect` → compute during render; delete the effect.
- `no-adjust-state-on-prop-change` / `no-reset-all-state-on-prop-change` → `key`-remount, render-time
  reset (prev-value ref), or derive.
- `no-pass-data-to-parent` → lift the state to the parent, pass down.
- `no-cascading-set-state` → compute the final value once, set once.
- `prefer-useReducer` → consolidate ONLY if the `useState` slices transition in lockstep; independent
  slices stay separate (judgment call — verify before refactoring).
- `advanced-event-handler-refs` → ref-latest the handler so the effect deps stay honest.

---

## Tier 0 — guardrail-sensitive (needs in-browser verify before touching)
- [ ] `components/ui/layout/OverlayContainer.tsx` — no-derived-state×1 (`portalHost`)
- [ ] `components/ui/overlays/ConfirmDialog.tsx` — no-derived-state×1 (`portalHost`)
  > Both: `useState(portalHost)` + effect → callback-ref-into-state. Touches `OverlayPortalContext`;
  > verify dropdowns-in-dialogs still render before merging.

## Tier 1 — quick singles (1 finding, low blast radius)
- [ ] `features/annualReports/components/tax/AnnualReportDetailForm.tsx` — no-event-handler×1
- [ ] `features/annualReports/components/shared/CreateReportModal.tsx` — no-pass-data-to-parent×1
- [ ] `features/binders/hooks/useReceiveBinderDrawer.ts` — no-event-handler×1
- [ ] `features/correspondence/components/CorrespondenceModal.tsx` — no-event-handler×1
- [ ] `features/documents/components/form/DocumentEditCard.tsx` — no-pass-data-to-parent×1
- [ ] `features/documents/components/list/DocumentsDataCards.tsx` — prefer-useReducer×1
- [ ] `features/users/components/form/EditUserModal.tsx` — no-event-handler×1
- [ ] `features/vatReports/components/form/VatFileModal.tsx` — no-event-handler×1
- [ ] `features/auth/pages/ResetPasswordPage.tsx` — prefer-useReducer×1
- [ ] `features/signatureRequests/components/form/CreateSignatureRequestModal.tsx` — prefer-useReducer×1

## Tier 2 — mid-size, self-contained (2–3 findings)
- [ ] `features/vatReports/components/form/VatWorkItemsCreateModal.tsx` — no-event-handler×3
- [ ] `features/charges/components/form/ChargesCreateModal.tsx` — no-event-handler×2
- [ ] `features/binders/components/sections/BinderDocumentsSection.tsx` — no-adjust-state×1, no-derived-state-effect×1, no-reset-all-state×1
- [ ] `features/taxCalendar/components/list/TaxCalendarGroupsTable.tsx` — no-adjust-state×1, no-derived-state-effect×1, no-reset-all-state×1
- [ ] `features/vatReports/components/list/VatWorkItemsGroupedCards.tsx` — no-adjust-state×1, no-reset-all-state×1
- [ ] `features/advancedPayments/hooks/useAdvancePaymentBatchRows.ts` — no-adjust-state×1, no-derived-state-effect×1
- [ ] `features/documents/components/form/DocumentsUploadCard.tsx` — no-pass-data-to-parent×1, no-prop-callback-in-effect×1

## Tier 3 — modal/flow refactors (one PR each, verify the flow manually)
- [ ] `features/notifications/components/form/SendNotificationModal.tsx` — no-adjust-state×8, prefer-useReducer×1, no-cascading-set-state×1, no-reset-all-state×1, no-event-handler×1 *(auto-preview already done)*
- [ ] `features/binders/components/sections/BinderHandoverPanel.tsx` — no-derived-state×2, no-event-handler×2, prefer-useReducer×1
- [ ] `features/clients/components/edit/ClientEditForm.tsx` — no-pass-data-to-parent×3, no-prop-callback-in-effect×1, no-event-handler×1
- [ ] `features/tasks/components/shared/ClientTasksTab.tsx` — no-adjust-state×3, no-cascading-set-state×1
- [ ] `features/clients/components/createClientModal/CreateClientModal.tsx` — no-adjust-state×1, no-event-handler×1, no-reset-all-state×1

## Tier 4 — shared hooks/util (ripple risk — touch with care)
- [ ] `hooks/useBusinessesForClient.ts` — no-event-handler×3, no-pass-data-to-parent×1
- [ ] `components/ui/filters/ClientPickerFilter.tsx` — no-derived-state×1, no-event-handler×2 *(shared filter)*
- [ ] `components/shared/client/ClientSearchInput.tsx` — prefer-useReducer×1, advanced-event-handler-refs×1 *(+1 exhaustive-deps FP)*
- [ ] `hooks/useSearchDebounce.ts` — no-derived-state×1, no-derived-state-effect×1 *(consumed widely)*

---

**Total actionable: 69 findings across 28 files** (by tier: 2 + 10 + 17 + 29 + 11 findings).
Counts are a 2026-06-21 snapshot — re-scan before trusting any single number.
