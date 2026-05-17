# CLAUDE.md — Binder & Billing CRM (Frontend)

> Single source of truth for assistant behavior and project rules.

---

## Assistant Behavior

- No greetings, affirmations, or filler
- No prompt repetition
- No unsolicited explanations
- Output final result only; reason internally
- Verify against existing code patterns before changing structure
- Prefer the current repo shape over historical assumptions

---

## Project Overview

Internal staff CRM: clients, binders, billing, tax businesses, charges, VAT, annual reports, reminders, notifications, signing, correspondence, and tax workflows.
UI is Hebrew-first with RTL defaults.
Roles are lowercase string literals: `"advisor" | "secretary"` (see `UserRole` in `src/types/index.ts`).

Backend: `../backend/` — FastAPI + SQLAlchemy.
Frontend API base defaults to `http://localhost:8000/api/v1` unless `VITE_API_BASE_URL` overrides it.

---

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run arch:check
npm run arch:check:strict
npm run test
npm run jscpd          # duplicate code detection
```

---

## Stack

- React 19, TypeScript 5, Vite 7, TailwindCSS v4
- React Query v5 for server state
- Zustand v5 for auth/session state only
- react-hook-form + Zod for forms
- Axios for HTTP
- react-router-dom v7
- sonner for toasts

---

## Architecture

```
main.tsx      -> app bootstrap, QueryClientProvider, BrowserRouter, AppErrorBoundary, Toaster
router/       -> route wiring, auth-expiry redirect handling, authenticated layout
features/*    -> primary domain modules with local api/hooks/components/pages
components/*  -> shared UI, layout, and cross-feature widgets
api/          -> thin shared transport/auth layer, auth API, query param helpers
store/        -> persisted auth/session state only
lib/actions/  -> action runtime and shared action helpers
```

### Core Shape

| Layer                 | Location                   | Responsibility                                                                |
| --------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| App bootstrap         | `src/main.tsx`             | Root render, providers, suspense, global toaster                              |
| Router                | `src/router/AppRoutes.tsx` | Route tree, guarded layout, auth expiry navigation                            |
| Shared API core       | `src/api/`                 | Axios client, auth API, shared contracts, query param helpers, core endpoints |
| Feature modules       | `src/features/<name>/`     | Domain-specific UI, hooks, endpoints, contracts, query keys                   |
| Shared UI             | `src/components/ui/`       | Reusable presentational primitives and generic interaction components         |
| Shared layout         | `src/components/layout/`   | Navbar, sidebar, page shell, page headers                                     |
| Shared domain widgets | `src/components/shared/`   | Cross-feature widgets reused in multiple domains                              |
| Shared hooks          | `src/hooks/`               | Generic hooks such as filters, debounce, role helpers                         |
| Store                 | `src/store/`               | Auth/session persistence and selectors                                        |

### Important Architectural Reality

- `src/api/` is a thin shared layer, not a centralized domain API registry
- Backend endpoint constants are usually feature-local under `src/features/<feature>/api/endpoints.ts`
- Query keys are feature-local under `src/features/<feature>/api/queryKeys.ts`
- There is no global `src/lib/queryKeys.ts`
- The `businesses` feature acts as an integration shell that composes tabs from multiple other features

---

## Directory Structure

```
src/
├── api/
│   ├── auth.api.ts
│   ├── client.ts
│   ├── contracts.ts
│   ├── core-endpoints.ts
│   └── queryParams.ts
├── components/
│   ├── errors/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── constants/
├── features/<name>/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── constants.ts or *.constants.ts
│   ├── schemas.ts
│   ├── types.ts
│   └── index.ts
├── hooks/
├── lib/
│   ├── actions/
│   └── queryClient.ts
├── router/
├── store/
├── types/
└── utils/
```

Large features may have nested component folders such as `kanban/`, `panel/`, `financials/`, `statusTransition/`, or `shared/`.

---

## Current Feature Surface

Active top-level feature folders:

- `actions`, `advancedPayments`, `annualReports`, `auth`, `authorityContacts`
- `binders`, `businesses`, `charges`, `clients`, `correspondence`
- `dashboard`, `documents`, `importExport`, `notifications`, `reminders`
- `reports`, `search`, `signatureRequests`, `signing`, `taxCalendar`, `taxDashboard`
- `taxProfile`, `timeline`, `users`, `vatReports`

---

## Shared Types (`src/types/index.ts`)

```ts
PaginatedResponse<T> // { items: T[]; page: number; page_size: number; total: number }
PagedQueryParams // { page: number; page_size: number }
PagedFilters<T> // PagedQueryParams & T
UserRole // "advisor" | "secretary"
AuthUser // { id: number; full_name: string; role: UserRole }
```

API response fields use **snake_case** to match the Python backend. Use snake_case keys in contracts, query params, and form field names when they map to backend fields.

---

## Authorization — `useRole`

`useRole()` returns:

```ts
{
  role: UserRole | null,
  isAdvisor: boolean,
  isSecretary: boolean,
  can: {
    createClients: boolean,        // advisor only
    viewChargeAmounts: boolean,    // advisor only
    editClients: boolean,          // advisor only
    performBinderActions: boolean, // always true
  }
}
```

Use `can.*` keys for permission-gated UI. Do not replicate role checks inline when a `can` key already covers the intent. Frontend authorization is a UX layer; backend remains the source of truth.

---

## Auth & 401 Handling (`src/api/client.ts`)

- 401 responses trigger a ref-counted expiry flow
- On first 401, persisted auth state is cleared and `AUTH_EXPIRED_EVENT` is dispatched on `window`
- The router listens for this event and redirects to login
- To skip the 401 interceptor on a specific request, set header `X-Skip-Auth-Intercept: 1`
- `AUTH_EXPIRED_EVENT` and `SKIP_AUTH_INTERCEPT_HEADER` are exported constants from `src/api/client.ts`

---

## Action Runtime (`src/lib/actions/runtime.ts`)

- Pure HTTP execution layer — no React, no hooks
- All action execution is whitelist-gated: the endpoint must match a pattern in `src/api/action-endpoint-patterns.ts`
- Unrecognised endpoints are blocked and throw; errors surface as Hebrew-language messages
- Import only from `src/features/actions/` — do not import this module elsewhere

---

## Rules

### Files & Structure

- Prefer small files, but do not assume a hard 150-line limit; follow existing local patterns when splitting
- Arrow functions only — no `function` declarations
- Components are functional; `AppErrorBoundary` is the class-component exception
- Feature-internal API, contracts, and query keys stay co-located under that feature
- External imports into a feature should prefer that feature's `index.ts` barrel

### Routing & Pages

- Route components live in `src/features/<feature>/pages/` when the feature exposes a route
- Pages should stay composition-focused and delegate fetching/mutations/state to hooks where practical
- `src/router/AppRoutes.tsx` should import feature entrypoints rather than deep feature internals
- Route-level layout and auth guards stay in the router layer

### API & Data

- All HTTP goes through the shared Axios client in `src/api/client.ts`
- Prefer feature-local endpoint maps under `src/features/<feature>/api/endpoints.ts`
- Use `toQueryParams()` from `src/api/queryParams.ts` for query-string construction; it skips null/undefined/empty values automatically
- Keep query key factories in feature-local `api/queryKeys.ts`
- Query keys should stay serializable and stable
- Avoid raw `fetch()` unless there is a strong reason and an established pattern

### Shared UI Boundaries

- `src/components/ui/` must stay free of feature-specific business logic
- `src/components/ui/` must not import from feature API modules or React Query
- Shared layout belongs in `src/components/layout/`
- Shared cross-feature widgets belong in `src/components/shared/`

### State

- Zustand is for auth/session state, not server entity caches
- Server data belongs in React Query
- `localStorage` and `sessionStorage` access is primarily concentrated in `src/store/` and auth expiry cleanup in `src/api/client.ts`

### TypeScript

- Keep strict typing; avoid `any`
- Use `import type` for type-only imports
- Shared transport/infrastructure types belong in `src/api/` or `src/types/`
- Feature-specific request/response contracts belong in `src/features/<feature>/api/contracts.ts`
- Feature-local UI/view types belong in `src/features/<feature>/types.ts`

### Forms & Zod

- Prefer react-hook-form + Zod for all forms
- Keep schemas in `src/features/<feature>/schemas.ts`
- Always use `z.object()` as the base for schemas
- Use `.extend()` for schema inheritance; use `.superRefine()` for cross-field validation
- Use `z.discriminatedUnion()` for variant schemas
- Extract types with `z.infer<typeof mySchema>` — do not manually duplicate types
- Provide explicit default values to `useForm`
- Validation and error text must be Hebrew-facing

```ts
// Preferred pattern
export const mySchema = z.object({ ... });
export type MyFormValues = z.infer<typeof mySchema>;
```

### Select Component (`src/components/ui/inputs/Select.tsx`)

`Select` supports two render modes:

- **Preferred:** pass `options={[{ value, label, disabled? }]}` — renders `SelectDropdown` with consistent styling
- **Fallback:** pass `children` (native `<option>` elements) — renders a native `<select>`

Always use `options={[...]}` for new code. The `children` path exists for compatibility but produces a different internal rendering path.

### Styling

- Tailwind is the default styling system
- Inline `style={{}}` is allowed for dynamic layout values, animation delays, sizing, z-index, or third-party integration when class names are insufficient
- Preserve RTL-aware spacing, alignment, and interaction patterns
- Reuse shared primitives before creating one-off wrappers

### Language

- User-facing copy should be Hebrew by default

### Toasts & Errors

- Prefer the `src/utils/toast.ts` wrapper for feature code
- `src/main.tsx` mounts `Toaster` directly from `sonner`
- Existing direct `sonner` imports should be treated as debt unless there is a clear reason
- 401 handling stays centralized in `src/api/client.ts`

### Tests

- The project currently has **zero unit tests** in `src/`
- Test infrastructure (vitest) exists and is runnable via `npm run test`
- Do not assume test files exist; do not generate test stubs unless explicitly asked

---

## Naming

| What               | Convention                                | Example                        |
| ------------------ | ----------------------------------------- | ------------------------------ |
| Feature folders    | camelCase                                 | `annualReports`                |
| Components         | PascalCase                                | `AnnualReportDrawer.tsx`       |
| Hooks              | `use` + camelCase                         | `useTaxProfile.ts`             |
| Pages              | `*Page.tsx`                               | `DashboardPage.tsx`            |
| Feature API files  | `<feature>.api.ts` or scoped API files    | `annualReports.api.ts`         |
| Feature contracts  | `contracts.ts`                            | `api/contracts.ts`             |
| Feature query keys | `queryKeys.ts`                            | `api/queryKeys.ts`             |
| Feature barrel     | `index.ts`                                | `features/taxProfile/index.ts` |
| Constants          | `constants.ts` or scoped `*.constants.ts` | `history.constants.ts`         |
| Request types      | `*Payload` / `*Params`                    | `CreateCorrespondencePayload`  |
| Response types     | `*Response`                               | `AnnualReportResponse`         |

---

## Barrel Pattern & Cross-Feature Imports

Each feature exports its public surface via its `index.ts` barrel. Rules:

- **Hooks, API modules, contracts, and query keys** from another feature must always be imported through that feature's barrel — never by direct internal path
- **Components** may be imported directly across features when used for composition (this is common and intentional)
- The router (`AppRoutes.tsx`) should import page components through the feature barrel, not deep internal paths
- Adding a new export to a barrel is the correct way to expose something for cross-feature use

---

## Guardrails

- Run `npm run arch:check` after structural changes
- Run `npm run arch:check:strict` when touching cross-feature imports or barrels; this additionally enforces barrel bypass rules
- `arch-check` is the enforceable source of truth for architectural boundaries
- Do not bypass a feature barrel for cross-feature hooks, API modules, contracts, or query keys
- Cross-feature component imports are allowed for composition patterns
- Preserve alias usage such as `@/api/client` and `@/features/<feature>`
