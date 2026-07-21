import type { ReactNode } from 'react'
import { formatDate, formatDateTime } from '@/utils/utils'
import type { BadgeVariant } from '../../primitives/Badge'
import { StatusBadge, type StatusBadgeVariantMap } from '../../primitives/StatusBadge'
import { EmptyCell } from './EmptyCell'
import type { Column, TableCellTone } from '../core/tableTypes'
import { GLOBAL_UI_MESSAGES } from '../../../../messages'

const isEmpty = (value: ReactNode): boolean => value == null || value === ''

/** A string `emptyValue` renders as a grey placeholder; any other node renders as-is. */
const emptyFallback = (emptyValue?: ReactNode): ReactNode =>
  typeof emptyValue === 'string' ? <EmptyCell>{emptyValue}</EmptyCell> : (emptyValue ?? <EmptyCell />)

interface ColumnBaseOptions {
  key: string
  header: string
  tone?: TableCellTone
  align?: Column<unknown>['align']
  truncate?: boolean
  wrap?: boolean
  footer?: ReactNode
  /** Layout-only escape hatch. Do not use for color, font, padding, hover, border, or default typography. */
  className?: string
  /** Header layout-only escape hatch. Do not use for color, font, padding, hover, border, or default typography. */
  headerClassName?: string
}

interface ValueColumnOptions<T> extends ColumnBaseOptions {
  emptyValue?: ReactNode
  getValue: (item: T, index: number) => ReactNode
}

interface DateColumnOptions<T> extends ColumnBaseOptions {
  emptyValue?: ReactNode
  getValue: (item: T, index: number) => string | null | undefined
}

interface StatusColumnOptions<T, TStatus extends string> extends ColumnBaseOptions {
  defaultVariant?: BadgeVariant
  getLabel: (status: TStatus) => string
  getStatus: (item: T, index: number) => TStatus
  variantMap: StatusBadgeVariantMap
}

interface ActionsColumnOptions<T> {
  header?: string
  key?: string
  className?: string
  headerClassName?: string
  render: (item: T, index: number) => ReactNode
  editRender?: (item: T, index: number) => ReactNode
}

type ValueColumnKind = 'text' | 'mono' | 'number' | 'money'

/**
 * Shared builder for value columns. `text` flows with the surrounding RTL layout;
 * `mono`/`number`/`money` are forced `ltr` so digits/IDs read left-to-right.
 */
const valueColumn =
  (kind: ValueColumnKind) =>
  <T,>({ emptyValue, getValue, ...options }: ValueColumnOptions<T>): Column<T> => ({
    ...options,
    kind,
    dir: kind === 'text' ? undefined : 'ltr',
    render: (item, index) => {
      const value = getValue(item, index)
      return isEmpty(value) ? emptyFallback(emptyValue) : value
    },
  })

export const textColumn = valueColumn('text')
export const monoColumn = valueColumn('mono')
export const numberColumn = valueColumn('number')
export const moneyColumn = valueColumn('money')

const dateColumnFn =
  (kind: 'date' | 'dateTime', format: (value: string) => string) =>
  <T,>({ emptyValue, getValue, ...options }: DateColumnOptions<T>): Column<T> => ({
    ...options,
    kind,
    dir: 'ltr',
    render: (item, index) => {
      const value = getValue(item, index)
      return value ? format(value) : emptyFallback(emptyValue)
    },
  })

export const dateColumn = dateColumnFn('date', formatDate)
export const dateTimeColumn = dateColumnFn('dateTime', formatDateTime)

export const statusColumn = <T, TStatus extends string>({
  defaultVariant,
  getLabel,
  getStatus,
  variantMap,
  ...options
}: StatusColumnOptions<T, TStatus>): Column<T> => ({
  ...options,
  kind: 'status',
  render: (item, index) => (
    <StatusBadge status={getStatus(item, index)} getLabel={getLabel} variantMap={variantMap} defaultVariant={defaultVariant} />
  ),
})

export const actionsColumn = <T,>({
  key = 'actions',
  header = GLOBAL_UI_MESSAGES.common.actions,
  className,
  headerClassName,
  render,
  editRender,
}: ActionsColumnOptions<T>): Column<T> => ({
  key,
  header,
  kind: 'actions',
  className,
  headerClassName,
  render,
  editRender,
})
