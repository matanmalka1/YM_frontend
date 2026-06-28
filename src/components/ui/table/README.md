## Scope

This file owns only:

- Component-local usage and implementation notes for the shared table column kit.

This file must not contain:

- Project-wide frontend architecture rules.
- Product/domain behavior.
- Backend API contract rules.

Source of truth: reference

# Shared Table Column Kit

## Purpose

The shared table column kit keeps repeated table cell rendering consistent without centralizing feature table logic.

It provides small, domain-agnostic column factories for common rendering patterns:

- default, muted, strong, and semantic text tones
- mono/tabular ID values
- number and money values
- date and date-time values
- status badges
- row actions

Each feature still owns its own table columns, order, labels, permissions, and behavior.

## What Belongs In `commonColumns.tsx`

Only generic column factories that can be used by any feature:

- `textColumn`
- `monoColumn`
- `numberColumn`
- `moneyColumn`
- `dateColumn`
- `dateTimeColumn`
- `statusColumn`
- `actionsColumn`

These factories may know about shared UI primitives and shared formatting utilities. They must not know about clients, binders, VAT, reports, deadlines, roles, workflows, or API contracts.

## What Belongs In Feature Column Files

Feature column files should keep all domain decisions:

- column order
- Hebrew labels
- status variant maps
- feature-specific labels
- row actions
- selection behavior
- permission checks
- workflow conditions
- navigation links
- custom calculations

Examples:

- `ClientColumns.tsx` owns client labels, client status variants, row actions, and selection behavior.
- `BindersColumns.tsx` owns binder status variants, binder row actions, client link rendering, period display, and days-in-office urgency rendering.
- `VatWorkItemColumns.tsx` owns VAT workflow actions, VAT period display, financial amount rendering, override badges, and deadline warning rendering.

## When To Keep A Column Custom

Keep a column custom when it includes domain behavior that would make the shared kit less generic:

- workflow transitions
- role checks
- status-dependent actions
- period or range formatting
- financial calculations
- client or entity navigation links
- warning, urgency, or semantic color logic
- badges that depend on feature-specific calculations
- complex composed cells

If using a shared factory would hide important feature logic or change visual behavior, keep the column custom.

## Shared File Rules

Shared table files must stay domain-agnostic.

Do not add:

- global `ALL_COLUMNS` registries
- feature names or imports
- VAT, binder, report, deadline, or client-specific logic
- workflow-specific helpers
- role-specific behavior
- domain-specific column presets

Do not introduce `domainColumns.tsx` until there is proven duplication across multiple features that cannot be handled cleanly by `commonColumns.tsx`.

## Canonical Style Ownership

`DataTable` owns table visual design: container chrome, header style, row/cell padding, default text colour, numeric rhythm, alignment, hover, selected/semantic row states, loading, empty, compact density, and pagination adjacency through `PaginatedDataTable`.

Feature columns describe intent with:

- `kind`: `text`, `mono`, `number`, `money`, `date`, `dateTime`, `status`, `actions`, or `selection`
- `tone`: `default`, `muted`, `strong`, `danger`, `warning`, or `success`
- `align`, `truncate`, `wrap`, and `verticalAlign`
- `getRowVariant`: `primarySoft`, `warningSoft`, `dangerSoft`, or `muted`

Do not use column `className`, `headerClassName`, or table `rowClassName` for default colour, font weight, tabular numbers, padding, alignment, hover, row background state, or per-column width/height tuning. Use them only for layout that the semantic API cannot express, such as a domain accent border, `whitespace-nowrap`, or `break-words`.

In a custom `render` whose cell can collapse to "no value", return `<EmptyCell />` instead of hand-rolling `<span className="text-gray-400">—</span>`. The `kind`-based helpers (`textColumn`, `dateColumn`, …) already emit it for empty `getValue` results.

## Surfaces And Density

- `surface="card"`: normal page table; default.
- `surface="embedded"`: table inside another card, modal, drawer, or section; same typography and row behaviour, lighter outer chrome.
- `surface="bare"`: only for truly nested/editing tables already inside a visible container. Do not use it for page-level list tables.
- `density="compact"`: smaller row height for nested/editing tables only. It does not create a separate visual style.

## Current Examples

Clients:

- client number uses `monoColumn`
- full name uses `textColumn`
- status uses `statusColumn`
- created date uses `dateColumn`
- row menu uses `actionsColumn`

Binders:

- office client number and IDs use `monoColumn`
- status uses `statusColumn`
- row menu uses `actionsColumn`
- client link, period range, and days-in-office remain custom

VAT:

- office client number and ID use `monoColumn`
- client name uses `textColumn`
- status uses `statusColumn`
- update/filed timestamps currently use `textColumn` with existing date-time formatting
- period, net VAT, deadline warning, and workflow actions remain custom

`dateColumn` is date-only and uses the existing `formatDate` utility. `dateTimeColumn` uses `formatDateTime`.
