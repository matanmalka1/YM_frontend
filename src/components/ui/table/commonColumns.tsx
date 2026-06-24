import type { ReactNode } from 'react'
import type { BadgeVariant } from '../primitives/Badge'
import type { StatusBadgeVariantMap } from '../primitives/StatusBadge'
import type { Column } from './DataTable'
import { renderDateText, renderMonoText, renderMutedText, renderStatusBadge, type TableCellValue } from './columnRenderers'

interface ColumnBaseOptions {
  key: string
  header: string
  className?: string
  headerClassName?: string
}

interface TextColumnOptions<T> extends ColumnBaseOptions {
  valueClassName?: string
  emptyValue?: ReactNode
  getValue: (item: T, index: number) => TableCellValue
}

interface DateColumnOptions<T> extends ColumnBaseOptions {
  valueClassName?: string
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
}

const makeTextColumnFn =
  (renderFn: typeof renderMutedText) =>
  <T,>({
    key,
    header,
    className,
    headerClassName,
    valueClassName,
    emptyValue,
    getValue,
  }: TextColumnOptions<T>): Column<T> => ({
    key,
    header,
    className,
    headerClassName,
    render: (item, index) => renderFn({ value: getValue(item, index), className: valueClassName, emptyValue }),
  })

export const textColumn = makeTextColumnFn(renderMutedText)

const makeMonoColumnFn =
  (renderFn: typeof renderMonoText) =>
  <T,>({
    key,
    header,
    className,
    headerClassName,
    valueClassName,
    emptyValue,
    getValue,
  }: TextColumnOptions<T>): Column<T> => ({
    key,
    header,
    className,
    headerClassName,
    dir: 'ltr',
    render: (item, index) => renderFn({ value: getValue(item, index), className: valueClassName, emptyValue }),
  })

export const monoColumn = makeMonoColumnFn(renderMonoText)

export const dateColumn = <T,>({
  key,
  header,
  className,
  headerClassName,
  valueClassName,
  emptyValue,
  getValue,
}: DateColumnOptions<T>): Column<T> => ({
  key,
  header,
  className,
  headerClassName,
  dir: 'ltr',
  render: (item, index) => renderDateText({ value: getValue(item, index), className: valueClassName, emptyValue }),
})

export const statusColumn = <T, TStatus extends string>({
  key,
  header,
  className,
  headerClassName,
  defaultVariant,
  getLabel,
  getStatus,
  variantMap,
}: StatusColumnOptions<T, TStatus>): Column<T> => ({
  key,
  header,
  className,
  headerClassName,
  render: (item, index) =>
    renderStatusBadge({
      status: getStatus(item, index),
      getLabel,
      variantMap,
      defaultVariant,
    }),
})

export const actionsColumn = <T,>({
  key = 'actions',
  header = 'פעולות',
  className = 'w-10',
  headerClassName = 'w-10',
  render,
}: ActionsColumnOptions<T>): Column<T> => ({
  key,
  header,
  className,
  headerClassName,
  render,
})
