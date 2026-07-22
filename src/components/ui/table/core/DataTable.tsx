import { Fragment, type KeyboardEvent, type ReactNode } from 'react'
import { Card } from '../../primitives/Card'
import { cn } from '../../../../utils/utils'
import { StateCard } from '../../feedback/StateCard'
import type { StateCardProps } from '../../feedback/StateCard'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from './TableSkeleton'
import { GLOBAL_UI_MESSAGES } from '../../../../messages'
import type { Column, TableSurface, TableDensity, TableRowVariant } from './tableTypes'
import { getAlignClass, getCellClass, getRowVariantClass } from './tableStyles'

export type { Column, TableRowVariant } from './tableTypes'

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowKey: (item: T) => string | number
  /** Key of the row currently being inline-edited; `renderEditRow` replaces that row. */
  editingRowKey?: string | number | null
  /**
   * Replaces the entire <tr> for the row whose key === `editingRowKey` — use when the edit UI is a
   * cohesive form spanning the row (returns a full `<tr>`).
   */
  renderEditRow?: (item: T) => ReactNode
  /** Replaces the auto per-column `<tfoot>` with a custom footer row (e.g. spanning/colSpan totals). Returns `<tr>` content. */
  renderFooter?: () => ReactNode
  onRowClick?: (item: T) => void
  className?: string
  emptyMessage?: string
  isLoading?: boolean
  getRowVariant?: (item: T, index: number) => TableRowVariant | undefined
  emptyState?: Partial<StateCardProps>
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
  emptyMessage = GLOBAL_UI_MESSAGES.common.noData,
  isLoading = false,
  getRowVariant,
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
    // Only act on keys pressed on the row itself. Bubbled keydowns from nested
    // interactive cells (selection checkbox, action buttons) must keep their
    // native behavior — preventDefault here would swallow a checkbox toggle.
    if (event.target !== event.currentTarget) return

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
      <TableSkeleton rows={5} columns={Math.max(columns.length, 1)} className={className} surface={surface} density={density} />
    )
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

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn('border-b border-gray-200 text-right', !isBare && 'bg-gray-100')}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  headerCellClass,
                  'font-semibold uppercase tracking-wider text-gray-500',
                  'first:ps-5 last:pe-5',
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
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(event) => handleRowKeyDown(event, item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {cellContent(column.render(item, index), column)}
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
    <Card disablePadding radius="lg" className={cn('overflow-hidden', className)}>
      {table}
    </Card>
  )
}
