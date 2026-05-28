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

- muted text with empty fallback
- mono/tabular values
- dates
- status badges
- row actions

Each feature still owns its own table columns, order, labels, permissions, and behavior.

## What Belongs In `commonColumns.tsx`

Only generic column factories that can be used by any feature:

- `textColumn`
- `monoColumn`
- `dateColumn`
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

## Current Limitation

`dateColumn` is date-only and uses the existing `formatDate` utility.

There is no `dateTimeColumn` yet. Use `textColumn` with explicit feature-side formatting when a table needs date-time display.
