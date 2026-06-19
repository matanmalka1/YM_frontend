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
