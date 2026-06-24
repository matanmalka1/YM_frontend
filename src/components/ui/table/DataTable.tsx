import { Fragment, type KeyboardEvent, type ReactNode } from 'react'
import { Card } from '../primitives/Card'
import { cn } from '../../../utils/utils'
import { StateCard } from '../feedback/StateCard'
import type { StateCardProps as EmptyStateProps } from '../feedback/StateCard'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from './TableSkeleton'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

type ColumnAlign = 'left' | 'center' | 'right'

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export interface Column<T> {
  key: string
  header: string
  headerRender?: () => ReactNode
  render: (item: T, index: number) => ReactNode
  /** Rendered in place of `render` for the row whose key === `editingRowKey` (inline edit). */
  editRender?: (item: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
  dir?: 'ltr' | 'rtl'
  align?: ColumnAlign
  headerAlign?: ColumnAlign
  /** Allow long content to wrap instead of forcing horizontal scroll. */
  wrap?: boolean
  /** Footer cell content for this column. When any column sets it, a totals <tfoot> is rendered. */
  footer?: ReactNode
}

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
  emptyMessage?: string
  isLoading?: boolean
  rowClassName?: (item: T, index: number) => string
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
  /**
   * `card` (default) wraps in a Card; `embedded` is a bordered box for use inside
   * another Card; `bare` is chrome-less (no border/bg) for compact sub-tables nested
   * on a tinted surface (e.g. an accordion detail strip).
   */
  surface?: 'card' | 'embedded' | 'bare'
  /** `compact` tightens padding + text for dense / nested tables. */
  density?: 'default' | 'compact'
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
  rowClassName,
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
    return <TableSkeleton rows={5} columns={Math.max(columns.length, 1)} className={className} />
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
                  ALIGN_CLASS[column.headerAlign ?? column.align ?? 'center'],
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
                  rowClassName?.(item, index),
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(event) => handleRowKeyDown(event, item)}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    dir={column.dir}
                    className={cn(
                      bodyCellClass,
                      'align-middle text-gray-700 first:ps-5 last:pe-5',
                      column.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
                      ALIGN_CLASS[column.align ?? 'center'],
                      column.className,
                    )}
                  >
                    {isRowEditing && column.editRender ? column.editRender(item, index) : column.render(item, index)}
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
                  <td
                    key={column.key}
                    dir={column.dir}
                    className={cn(
                      bodyCellClass,
                      'align-middle first:ps-5 last:pe-5',
                      column.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
                      ALIGN_CLASS[column.align ?? 'center'],
                      column.className,
                    )}
                  >
                    {column.footer}
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
