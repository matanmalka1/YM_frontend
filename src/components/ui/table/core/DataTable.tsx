import { Fragment, type KeyboardEvent, type ReactNode } from 'react'
import { Card } from '../../primitives/Card'
import { cn } from '../../../../utils/utils'
import { StateCard } from '../../feedback/StateCard'
import type { StateCardProps as EmptyStateProps } from '../../feedback/StateCard'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from './TableSkeleton'
import { GLOBAL_UI_MESSAGES } from '../../../../messages'
import { Alert } from '../../overlays/Alert'
import type { Column, TableSurface, TableDensity, TableRowVariant } from './tableTypes'
import { getAlignClass, getCellClass, getRowVariantClass } from './tableStyles'

export type {
  Column,
  ColumnAlign,
  TableColumnKind,
  TableCellTone,
  TableRowVariant,
  TableVerticalAlign,
} from './tableTypes'

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowKey: (item: T) => string | number
  /** Key of the row currently being inline-edited; its cells use `Column.editRender` where defined. */
  editingRowKey?: string | number | null
  /**
   * Replaces the entire <tr> for the row whose key === `editingRowKey` — use when the edit UI is a
   * cohesive form spanning the row (returns a full `<tr>`). Takes precedence over per-cell `editRender`.
   */
  renderEditRow?: (item: T) => ReactNode
  /** Replaces the auto per-column `<tfoot>` with a custom footer row (e.g. spanning/colSpan totals). Returns `<tr>` content. */
  renderFooter?: () => ReactNode
  onRowClick?: (item: T) => void
  className?: string
  error?: string | null
  emptyMessage?: string
  isLoading?: boolean
  onRetry?: () => void
  rowClassName?: (item: T, index: number) => string
  getRowVariant?: (item: T, index: number) => TableRowVariant | undefined
  stickyHeader?: boolean
  /**
   * Max height of the scroll area. Required for stickyHeader to work — the
   * thead sticks against this bounded scroll container. Tailwind class or CSS value.
   * @default 'max-h-[70vh]' when stickyHeader is set
   */
  maxHeight?: string
  emptyState?: Omit<EmptyStateProps, 'icon' | 'message'> & {
    icon?: LucideIcon
    message?: string
  }
  /** Classes applied to the totals <tfoot> (rendered only when a column defines `footer`). */
  footerClassName?: string
  surface?: TableSurface
  density?: TableDensity
}

export const DataTable = <T,>({
  data,
  columns,
  getRowKey,
  editingRowKey,
  renderEditRow,
  renderFooter,
  onRowClick,
  className,
  error,
  emptyMessage = GLOBAL_UI_MESSAGES.common.noData,
  isLoading = false,
  onRetry,
  rowClassName,
  getRowVariant,
  stickyHeader = false,
  maxHeight,
  emptyState,
  footerClassName,
  surface = 'card',
  density = 'default',
}: DataTableProps<T>) => {
  const isBare = surface === 'bare'
  const isCompact = density === 'compact'
  const headerCellClass = isCompact ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-2xs'
  const bodyCellClass = isCompact ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm'
  const hasFooter = columns.some((column) => column.footer !== undefined)
  const cellClass = (column: Column<T>): string => getCellClass(column, bodyCellClass)

  const cellContent = (node: ReactNode, column: Column<T>): ReactNode =>
    column.dir ? <span dir={column.dir}>{node}</span> : node

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: T) => {
    if (!onRowClick) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(item)
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const currentRow = event.currentTarget
    const sibling = event.key === 'ArrowDown' ? currentRow.nextElementSibling : currentRow.previousElementSibling

    if (sibling instanceof HTMLTableRowElement) {
      sibling.focus()
    }
  }

  if (isLoading) {
    return (
      <TableSkeleton
        rows={5}
        columns={Math.max(columns.length, 1)}
        className={className}
        surface={surface}
        density={density}
      />
    )
  }

  if (error && data.length === 0) {
    return <Alert variant="error" message={error} onRetry={onRetry} className={className} />
  }

  if (data.length === 0) {
    return (
      <StateCard
        icon={emptyState?.icon ?? Inbox}
        title={emptyState?.title}
        message={emptyState?.message ?? emptyMessage}
        action={emptyState?.action}
        secondaryAction={emptyState?.secondaryAction}
        variant={emptyState?.variant}
        className={cn(className, emptyState?.className)}
      />
    )
  }

  const heightClass = stickyHeader ? (maxHeight ?? 'max-h-[70vh]') : undefined

  const table = (
    <div className={cn('overflow-x-auto', stickyHeader && cn('overflow-y-auto', heightClass))}>
      <table className="w-full border-collapse">
        <thead className={cn(stickyHeader && 'sticky top-0 z-20')}>
          <tr className={cn('border-b border-gray-200 text-right', !isBare && 'bg-gray-50/80')}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  headerCellClass,
                  'font-semibold uppercase tracking-wider text-gray-500',
                  'first:ps-5 last:pe-5',
                  stickyHeader && 'border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm',
                  getAlignClass(column),
                  column.headerClassName,
                )}
              >
                {column.headerRender ? column.headerRender() : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn('divide-y divide-gray-200', !isBare && 'bg-white')}>
          {data.map((item, index) => {
            const isRowEditing = editingRowKey != null && editingRowKey === getRowKey(item)
            const rowVariant = getRowVariant?.(item, index)
            if (isRowEditing && renderEditRow) {
              return <Fragment key={getRowKey(item)}>{renderEditRow(item)}</Fragment>
            }
            return (
              <tr
                key={getRowKey(item)}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick &&
                    'cursor-pointer hover:bg-primary-50/60 active:bg-primary-50/80 hover:shadow-[inset_-3px_0_0_0_var(--color-primary-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
                  !onRowClick && 'hover:bg-gray-50/80',
                  rowVariant && getRowVariantClass(rowVariant),
                  rowClassName?.(item, index),
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(event) => handleRowKeyDown(event, item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {isRowEditing && column.editRender
                      ? column.editRender(item, index)
                      : cellContent(column.render(item, index), column)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
        {(renderFooter || hasFooter) && (
          <tfoot className={footerClassName}>
            {renderFooter ? (
              renderFooter()
            ) : (
              <tr>
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {cellContent(column.footer, column)}
                  </td>
                ))}
              </tr>
            )}
          </tfoot>
        )}
      </table>
    </div>
  )

  if (isBare) {
    return className ? <div className={className}>{table}</div> : table
  }

  if (surface === 'embedded') {
    return <div className={cn('overflow-hidden rounded-lg border border-gray-100', className)}>{table}</div>
  }

  return (
    <Card disablePadding className={cn('overflow-hidden', className)}>
      {table}
    </Card>
  )
}
