import type { KeyboardEvent, ReactNode } from 'react'
import { Card } from '../primitives/Card'
import { cn } from '../../../utils/utils'
import { StateCard } from '../feedback/StateCard'
import type { StateCardProps as EmptyStateProps } from '../feedback/StateCard'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from './TableSkeleton'

export interface Column<T> {
  key: string
  header: string
  headerRender?: () => ReactNode
  render: (item: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
  dir?: 'ltr' | 'rtl'
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

  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-right">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
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
                  <td key={column.key} dir={column.dir} className={cn('px-3 py-3 align-middle text-center', column.className)}>
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
