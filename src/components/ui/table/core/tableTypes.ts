/**
 * Shared table types (column shape, surface/density, semantic style unions).
 *
 * Kept in their own module (rather than DataTable.tsx) so TableSkeleton and
 * tableStyles can reuse them without importing DataTable — DataTable renders
 * TableSkeleton and imports tableStyles, so a reverse import would form a cycle.
 */

import type { ReactNode } from 'react'

/**
 * `card` (default) wraps in a Card; `embedded` is a bordered box for use inside
 * another Card; `bare` is chrome-less (no border/bg) for compact sub-tables nested
 * on a tinted surface (e.g. an accordion detail strip).
 */
export type TableSurface = 'card' | 'embedded' | 'bare'

/** `compact` tightens padding + text for dense / nested tables. */
export type TableDensity = 'default' | 'compact'

export type ColumnAlign = 'start' | 'center' | 'end'

export type TableColumnKind = 'text' | 'mono' | 'number' | 'money' | 'date' | 'dateTime' | 'status' | 'actions' | 'selection'

export type TableCellTone = 'default' | 'muted' | 'strong' | 'danger' | 'warning' | 'success'

export type TableRowVariant = 'primarySoft' | 'warningSoft' | 'dangerSoft' | 'muted'

type TableVerticalAlign = 'middle' | 'top'

export interface Column<T> {
  key: string
  header: string
  headerRender?: () => ReactNode
  render: (item: T, index: number) => ReactNode
  editRender?: (item: T, index: number) => ReactNode
  kind?: TableColumnKind
  tone?: TableCellTone
  truncate?: boolean
  verticalAlign?: TableVerticalAlign
  className?: string
  headerClassName?: string
  dir?: 'ltr' | 'rtl'
  align?: ColumnAlign
  wrap?: boolean
  footer?: ReactNode
}
