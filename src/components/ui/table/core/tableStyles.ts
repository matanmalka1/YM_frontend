/**
 * Pure class resolution for DataTable cells/headers/rows. No JSX, no React — just
 * maps semantic column intent (`kind`/`tone`/`align`/`verticalAlign`) to Tailwind
 * classes. Kept out of DataTable.tsx so the component file stays focused on
 * lifecycle, keyboard nav, and markup.
 */
import { cn } from '../../../../utils/utils'
import type { Column, ColumnAlign, TableCellTone, TableColumnKind, TableRowVariant } from './tableTypes'

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

const KIND_CLASS: Record<TableColumnKind, string> = {
  text: '',
  mono: 'font-mono tabular-nums',
  number: 'tabular-nums',
  money: 'tabular-nums',
  date: 'tabular-nums',
  dateTime: 'tabular-nums',
  status: '',
  actions: '',
  selection: '',
}

const TONE_CLASS: Record<TableCellTone, string> = {
  default: 'text-gray-700',
  muted: 'text-gray-500',
  strong: 'font-semibold text-gray-900',
  danger: 'font-semibold text-negative-600',
  warning: 'font-semibold text-warning-600',
  success: 'font-semibold text-positive-700',
}

const ROW_VARIANT_CLASS: Record<TableRowVariant, string> = {
  primarySoft: 'bg-primary-50 hover:bg-primary-50/80',
  warningSoft: 'bg-warning-50 hover:bg-warning-50/80',
  dangerSoft: 'bg-negative-50/40 hover:bg-negative-50/70',
  muted: 'bg-gray-50 hover:bg-gray-100/80',
}

const getColumnKind = <T>(column: Column<T>): TableColumnKind => column.kind ?? 'text'

const getColumnTone = <T>(column: Column<T>): TableCellTone => {
  if (column.tone) return column.tone
  const kind = getColumnKind(column)
  if (kind === 'date' || kind === 'dateTime') return 'muted'
  return 'default'
}

const getDefaultAlign = <T>(column: Column<T>): ColumnAlign => {
  const kind = getColumnKind(column)
  if (kind === 'actions' || kind === 'selection' || kind === 'status') return 'center'
  if (kind === 'number' || kind === 'money') return 'end'
  return 'start'
}

/** Text-alignment class, used by both header and body cells. */
export const getAlignClass = <T>(column: Column<T>): string => ALIGN_CLASS[column.align ?? getDefaultAlign(column)]

/** Full body/footer cell class. `bodyCellClass` carries the surface padding/text-size. */
export const getCellClass = <T>(column: Column<T>, bodyCellClass: string): string =>
  cn(
    bodyCellClass,
    'first:ps-5 last:pe-5',
    column.verticalAlign === 'top' ? 'align-top' : 'align-middle',
    column.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
    column.truncate && 'max-w-xs truncate',
    getAlignClass(column),
    KIND_CLASS[getColumnKind(column)],
    TONE_CLASS[getColumnTone(column)],
    column.className,
  )

export const getRowVariantClass = (variant: TableRowVariant): string => ROW_VARIANT_CLASS[variant]
