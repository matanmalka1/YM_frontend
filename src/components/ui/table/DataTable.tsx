import type { KeyboardEvent, ReactNode } from 'react'
import { Card } from '../primitives/Card'
import { cn } from '../../../utils/utils'
import { StateCard } from '../feedback/StateCard'
import type { StateCardProps as EmptyStateProps } from '../feedback/StateCard'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from './TableSkeleton'

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
  className?: string
  headerClassName?: string
  dir?: 'ltr' | 'rtl'
  align?: ColumnAlign
  headerAlign?: ColumnAlign
  /** Allow long content to wrap instead of forcing horizontal scroll. */
  wrap?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowKey: (item: T) => string | number
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
}

export const DataTable = <T,>({
  data,
  columns,
  getRowKey,
  onRowClick,
  className,
  emptyMessage = 'אין נתונים להצגה',
  isLoading = false,
  rowClassName,
  stickyHeader = false,
  maxHeight,
  emptyState,
}: DataTableProps<T>) => {
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

  return (
    <Card disablePadding className={cn('overflow-hidden', className)}>
      <div className={cn('overflow-x-auto', stickyHeader && cn('overflow-y-auto', heightClass))}>
        <table className="w-full border-collapse">
          <thead className={cn(stickyHeader && 'sticky top-0 z-20 shadow-sm')}>
            <tr className="border-b border-gray-200 bg-gray-50 text-right">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500',
                    stickyHeader && 'bg-gray-50',
                    ALIGN_CLASS[column.headerAlign ?? column.align ?? 'center'],
                    column.headerClassName,
                  )}
                >
                  {column.headerRender ? column.headerRender() : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((item, index) => (
              <tr
                key={getRowKey(item)}
                className={cn(
                  'transition-colors duration-100',
                  onRowClick &&
                    'cursor-pointer hover:bg-primary-50/60 active:bg-primary-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
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
                      'px-3 py-3 align-middle',
                      column.wrap ? 'whitespace-normal' : 'whitespace-nowrap',
                      ALIGN_CLASS[column.align ?? 'center'],
                      column.className,
                    )}
                  >
                    {column.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
