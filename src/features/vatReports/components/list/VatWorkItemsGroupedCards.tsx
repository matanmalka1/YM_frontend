import { memo, useCallback, useEffect, useState } from 'react'
import { Inbox } from 'lucide-react'
import { TableSkeleton, PaginationCard, DataTable, MonthlyAccordionList, GroupedPeriodRow, formatDueDateLabel, formatRelativeDueLabel, type Column, type PeriodSummaryMetric } from '@/components/ui/table'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { getTotalPages } from '@/utils/paginationUtils'
import { isCurrentReportingPeriod } from '@/utils/reportingPeriod'
import { useVatGroupItems } from '../../hooks/useVatGroupItems'
import type { VatWorkItemListItem, VatWorkItemGroupSummary, VatWorkItemStatus } from '../../api'
import { formatVatPeriodTitle } from '../../utils/viewHelpers'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { VAT_MESSAGES } from '../../messages'

interface VatWorkItemsGroupedCardsProps {
  groups: VatWorkItemGroupSummary[]
  columns: Column<VatWorkItemListItem>[]
  isLoading?: boolean
  error?: string | null
  onRowClick: (item: VatWorkItemListItem) => void
  emptyState?: { title?: string; message?: string; action?: { label: string; onClick: () => void } }
  filters?: { status?: VatWorkItemStatus; client_record_id?: number }
}

const getVatGroupSecondaryLabel = (group: VatWorkItemGroupSummary): string | null => {
  const seen = new Set<string>()
  const periodLabels = (
    group.periods?.length ? group.periods : [{ period: group.period, period_type: group.period_type }]
  ).flatMap((period) => {
    const label = formatVatPeriodTitle(period.period, period.period_type)
    if (seen.has(label)) return []
    seen.add(label)
    return [label]
  })
  return periodLabels.length > 0 ? VAT_MESSAGES.list.includedPeriods(periodLabels.join(' · ')) : null
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
          emptyMessage={VAT_MESSAGES.list.noWorkItemsInPeriod}
        />
        {data && data.total > PAGE_SIZE && (
          <PaginationCard
            page={page}
            totalPages={getTotalPages(data.total, PAGE_SIZE)}
            total={data.total}
            label={VAT_MESSAGES.list.workItemsPaginationLabel}
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
  const sortedGroups = groups.toSorted((a, b) => a.due_date.localeCompare(b.due_date))

  const getKey = useCallback((g: VatWorkItemGroupSummary) => g.group_key, [])
  const getDueDate = useCallback((g: VatWorkItemGroupSummary) => g.due_date, [])
  const defaultOpenKey = useDefaultOpenGroup(sortedGroups, getKey, getDueDate)

  return (
    <MonthlyAccordionList
      isLoading={isLoading}
      isEmpty={groups.length === 0}
      emptyState={{
        icon: Inbox,
        title: emptyState?.title ?? VAT_MESSAGES.list.noWorkItems,
        message: emptyState?.message ?? VAT_MESSAGES.list.noMatchingWorkItems,
        action: emptyState?.action,
      }}
    >
      {error && <div className="text-sm text-negative-600">{error}</div>}
      {sortedGroups.map((group) => {
        const periodMonthsCount = group.period_type === 'bimonthly' ? 2 : 1
        const isCurrentPeriod = isCurrentReportingPeriod(group.period, periodMonthsCount)
        const metrics: PeriodSummaryMetric[] = [
          { label: VAT_MESSAGES.list.clientsMetric, value: group.total_count },
          {
            label: VAT_MESSAGES.list.pendingMetric,
            value: group.pending_count,
            tone: group.pending_count > 0 ? 'warning' : 'muted',
          },
          {
            label: VAT_MESSAGES.list.filedMetric,
            value: group.filed_count,
            tone: group.filed_count > 0 ? 'positive' : 'muted',
          },
          {
            label: VAT_MESSAGES.list.notFiledMetric,
            value: group.not_filed_count,
            tone: group.not_filed_count > 0 ? 'warning' : 'muted',
          },
          {
            label: VAT_MESSAGES.list.overdueMetric,
            value: group.overdue_count,
            tone: group.overdue_count > 0 ? 'negative' : 'muted',
          },
        ]

        return (
          <GroupedPeriodRow
            key={group.group_key}
            typeLabel={VAT_MESSAGES.list.vatTypeLabel}
            primaryLabel={formatDueDateLabel(group.due_date, VAT_MESSAGES.list.dueByPrefix) ?? group.due_date}
            secondaryLabel={getVatGroupSecondaryLabel(group)}
            relativeDueLabel={formatRelativeDueLabel(group.due_date)}
            isCurrentPeriod={isCurrentPeriod}
            defaultOpen={group.group_key === defaultOpenKey}
            metrics={metrics}
            ctaLabel={VAT_MESSAGES.actions.openClients}
          >
            <GroupContent group={group} columns={columns} onRowClick={onRowClick} filters={filters} />
          </GroupedPeriodRow>
        )
      })}
    </MonthlyAccordionList>
  )
}

VatWorkItemsGroupedCards.displayName = 'VatWorkItemsGroupedCards'
