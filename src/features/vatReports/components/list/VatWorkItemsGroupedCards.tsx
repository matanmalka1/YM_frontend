import { memo, useCallback, useEffect, useState } from 'react'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { getTotalPages } from '@/utils/paginationUtils'
import { isCurrentReportingPeriod } from '@/utils/reportingPeriod'
import { useVatGroupItems } from '../../hooks/useVatGroupItems'
import type { VatWorkItemListItem, VatWorkItemGroupSummary, VatWorkItemStatus } from '../../api'
import { formatVatPeriodTitle } from '../../utils/viewHelpers'

interface VatWorkItemsGroupedCardsProps {
  groups: VatWorkItemGroupSummary[]
  columns: Column<VatWorkItemListItem>[]
  isLoading?: boolean
  error?: string | null
  onRowClick: (item: VatWorkItemListItem) => void
  emptyState?: { title?: string; message?: string; action?: { label: string; onClick: () => void } }
  filters?: { status?: VatWorkItemStatus; client_record_id?: number }
}

const PAGE_SIZE = 20

const getVatGroupSecondaryLabel = (group: VatWorkItemGroupSummary): string | null => {
  const seen = new Set<string>()
  const periodLabels = (
    group.periods?.length ? group.periods : [{ period: group.period, period_type: group.period_type }]
  )
    .map((period) => formatVatPeriodTitle(period.period, period.period_type))
    .filter((label) => (seen.has(label) ? false : (seen.add(label), true)))
  return periodLabels.length > 0 ? `כולל תקופות: ${periodLabels.join(' · ')}` : null
}

const GroupContent = memo(
  ({
    group,
    columns,
    onRowClick,
    filters,
  }: {
    group: VatWorkItemGroupSummary
    columns: Column<VatWorkItemListItem>[]
    onRowClick: (item: VatWorkItemListItem) => void
    filters?: { status?: VatWorkItemStatus; client_record_id?: number }
  }) => {
    const [page, setPage] = useState(1)

    useEffect(() => {
      setPage(1)
    }, [filters?.status, filters?.client_record_id])

    const { data, isLoading } = useVatGroupItems(group.group_key, {
      page,
      page_size: PAGE_SIZE,
      status: filters?.status,
      client_record_id: filters?.client_record_id,
    })

    if (isLoading) return <TableSkeleton rows={3} columns={columns.length} />

    return (
      <>
        <DataTable
          data={data?.items ?? []}
          columns={columns}
          getRowKey={(r) => r.id}
          onRowClick={onRowClick}
          emptyMessage="אין תיקים בתקופה זו"
        />
        {data && data.total > PAGE_SIZE && (
          <PaginationCard
            page={page}
            totalPages={getTotalPages(data.total, PAGE_SIZE)}
            total={data.total}
            label="תיקים"
            onPageChange={setPage}
          />
        )}
      </>
    )
  },
)

GroupContent.displayName = 'GroupContent'

export const VatWorkItemsGroupedCards = ({
  groups,
  columns,
  isLoading,
  error,
  onRowClick,
  emptyState,
  filters,
}: VatWorkItemsGroupedCardsProps) => {
  const sortedGroups = [...groups].sort((a, b) => a.due_date.localeCompare(b.due_date))

  const getKey = useCallback((g: VatWorkItemGroupSummary) => g.group_key, [])
  const getDueDate = useCallback((g: VatWorkItemGroupSummary) => g.due_date, [])
  const defaultOpenKey = useDefaultOpenGroup(sortedGroups, getKey, getDueDate)

  return (
    <MonthlyAccordionList
      isLoading={isLoading}
      isEmpty={groups.length === 0}
      emptyState={{
        icon: Inbox,
        title: emptyState?.title ?? 'אין תיקי מע"מ',
        message: emptyState?.message ?? 'לא נמצאו תיקים התואמים לסינון',
        action: emptyState?.action,
      }}
    >
      {error && <div className="text-sm text-negative-600">{error}</div>}
      {sortedGroups.map((group) => {
        const periodMonthsCount = group.period_type === 'bimonthly' ? 2 : 1
        const isCurrentPeriod = isCurrentReportingPeriod(group.period, periodMonthsCount)
        const metrics: PeriodSummaryMetric[] = [
          { label: 'לקוחות', value: group.total_count },
          { label: 'ממתינים', value: group.pending_count, tone: group.pending_count > 0 ? 'warning' : 'muted' },
          { label: 'הוגשו', value: group.filed_count, tone: group.filed_count > 0 ? 'success' : 'muted' },
          { label: 'לא הוגשו', value: group.not_filed_count, tone: group.not_filed_count > 0 ? 'warning' : 'muted' },
          { label: 'באיחור', value: group.overdue_count, tone: group.overdue_count > 0 ? 'danger' : 'muted' },
        ]

        return (
          <GroupedPeriodRow
            key={group.group_key}
            typeLabel="מע״מ"
            primaryLabel={formatDueDateLabel(group.due_date, 'להגשה עד') ?? group.due_date}
            secondaryLabel={getVatGroupSecondaryLabel(group)}
            relativeDueLabel={formatRelativeDueLabel(group.due_date)}
            isCurrentPeriod={isCurrentPeriod}
            defaultOpen={group.group_key === defaultOpenKey}
            metrics={metrics}
            ctaLabel="פתח לקוחות"
          >
            <GroupContent group={group} columns={columns} onRowClick={onRowClick} filters={filters} />
          </GroupedPeriodRow>
        )
      })}
    </MonthlyAccordionList>
  )
}

VatWorkItemsGroupedCards.displayName = 'VatWorkItemsGroupedCards'
