import React, { Fragment, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Inbox } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import type { Column } from '@/components/ui/table'
import { getTotalPages } from '@/utils/paginationUtils'
import { cn } from '@/utils/utils'
import { getVatWorkItemStatusLabel } from '@/utils/enums'
import type { VatWorkItemResponse } from '../api'
import { formatVatPeriodTitle } from '../view.helpers'

interface VatWorkItemsGroupedTableProps {
  columns: Column<VatWorkItemResponse>[]
  data: VatWorkItemResponse[]
  emptyMessage: string
  error?: string | null
  isLoading?: boolean
  label: string
  onPageChange: (page: number) => void
  onRowClick: (item: VatWorkItemResponse) => void
  page: number
  pageSize: number
  total: number
  emptyState?: {
    title?: string
    message?: string
    action?: { label: string; onClick: () => void }
  }
}

interface VatWorkItemGroup {
  period: string
  periodType: string | null
  items: VatWorkItemResponse[]
}

const groupByPeriod = (items: VatWorkItemResponse[]): VatWorkItemGroup[] => {
  const groups = new Map<string, VatWorkItemGroup>()
  items.forEach((item) => {
    const existing = groups.get(item.period)
    if (existing) {
      existing.items.push(item)
      return
    }
    groups.set(item.period, {
      period: item.period,
      periodType: item.period_type,
      items: [item],
    })
  })
  return [...groups.values()].sort((a, b) => b.period.localeCompare(a.period))
}

const getStatusSummary = (items: VatWorkItemResponse[]) => {
  const counts = new Map<string, number>()
  items.forEach((item) => counts.set(item.status, (counts.get(item.status) ?? 0) + 1))
  return [...counts.entries()]
}

export const VatWorkItemsGroupedTable: React.FC<VatWorkItemsGroupedTableProps> = ({
  columns,
  data,
  emptyMessage,
  emptyState,
  error,
  isLoading = false,
  label,
  onPageChange,
  onRowClick,
  page,
  pageSize,
  total,
}) => {
  const [collapsedPeriods, setCollapsedPeriods] = useState<Set<string>>(() => new Set())
  const groups = groupByPeriod(data)
  const shouldShowPagination = !isLoading && total > 0 && data.length > 0

  const togglePeriod = (period: string) => {
    setCollapsedPeriods((current) => {
      const next = new Set(current)
      if (next.has(period)) next.delete(period)
      else next.add(period)
      return next
    })
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: VatWorkItemResponse) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(item)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const sibling =
      event.key === 'ArrowDown' ? event.currentTarget.nextElementSibling : event.currentTarget.previousElementSibling
    if (sibling instanceof HTMLTableRowElement) sibling.focus()
  }

  if (isLoading) return <TableSkeleton rows={5} columns={Math.max(columns.length, 1)} />

  if (data.length === 0) {
    return (
      <>
        {error && <Alert variant="error" message={error} />}
        <StateCard
          icon={Inbox}
          title={emptyState?.title}
          message={emptyState?.message ?? emptyMessage}
          action={emptyState?.action}
        />
      </>
    )
  }

  return (
    <>
      {error && <Alert variant="error" message={error} />}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-center">
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
            <tbody className="bg-white">
              {groups.map((group) => {
                const isCollapsed = collapsedPeriods.has(group.period)
                return (
                  <Fragment key={group.period}>
                    <tr className="border-y border-gray-200 bg-gray-50">
                      <td colSpan={columns.length} className="px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            onClick={() => togglePeriod(group.period)}
                            aria-expanded={!isCollapsed}
                          >
                            <ChevronDown
                              className={cn('h-4 w-4 text-gray-500 transition-transform', isCollapsed && '-rotate-90')}
                            />
                            {formatVatPeriodTitle(group.period, group.periodType)}
                            <span className="text-xs font-medium text-gray-500">{group.items.length} תיקים</span>
                          </button>
                          <div className="flex flex-wrap gap-1.5">
                            {getStatusSummary(group.items).map(([status, count]) => (
                              <Badge key={status} variant="neutral" size="xs">
                                {getVatWorkItemStatusLabel(status)}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {!isCollapsed &&
                      group.items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="cursor-pointer border-b border-gray-100 transition-colors duration-100 hover:bg-primary-50/40 active:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
                          onClick={() => onRowClick(item)}
                          onKeyDown={(event) => handleRowKeyDown(event, item)}
                          tabIndex={0}
                        >
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              className={cn('px-3 py-2.5 align-middle text-center', column.className)}
                            >
                              {column.render(item, index)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {shouldShowPagination && (
        <PaginationCard
          page={page}
          totalPages={getTotalPages(total, pageSize)}
          total={total}
          label={label}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
