import { memo, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { vatReportsApi, vatReportsQK } from '../api'
import type { VatWorkItemResponse, VatWorkItemGroupSummary } from '../api'
import { formatVatPeriodTitle } from '../view.helpers'

interface VatWorkItemsGroupedCardsProps {
  groups: VatWorkItemGroupSummary[]
  columns: Column<VatWorkItemResponse>[]
  isLoading?: boolean
  error?: string | null
  onRowClick: (item: VatWorkItemResponse) => void
  emptyState?: { title?: string; message?: string; action?: { label: string; onClick: () => void } }
  filters?: { status?: string; client_name?: string }
}

const PAGE_SIZE = 50

const getVatGroupSecondaryLabel = (group: VatWorkItemGroupSummary): string | null => {
  const periodLabels = (
    group.periods?.length ? group.periods : [{ period: group.period, period_type: group.period_type }]
  )
    .map((period) => formatVatPeriodTitle(period.period, period.period_type))
    .filter((label, index, labels) => labels.indexOf(label) === index)
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
    columns: Column<VatWorkItemResponse>[]
    onRowClick: (item: VatWorkItemResponse) => void
    filters?: { status?: string; client_name?: string }
  }) => {
    const [page, setPage] = useState(1)

    useEffect(() => {
      setPage(1)
    }, [filters?.status, filters?.client_name])

    const itemParams = { page, page_size: PAGE_SIZE, status: filters?.status, client_name: filters?.client_name }

    const { data, isLoading } = useQuery({
      queryKey: vatReportsQK.groupItems(group.group_key, itemParams),
      queryFn: () => vatReportsApi.listGroupItems(group.group_key, itemParams),
      staleTime: 30_000,
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
        const metrics: PeriodSummaryMetric[] = [
          { label: 'לקוחות', value: group.total_count },
          { label: 'ממתינים', value: group.pending_count, tone: group.pending_count > 0 ? 'warning' : 'muted' },
          { label: 'הוגשו', value: group.filed_count, tone: group.filed_count > 0 ? 'success' : 'muted' },
        ]

        return (
          <GroupedPeriodRow
            key={group.group_key}
            typeLabel="מע״מ"
            primaryLabel={formatDueDateLabel(group.due_date, 'להגשה עד') ?? group.due_date}
            secondaryLabel={getVatGroupSecondaryLabel(group)}
            relativeDueLabel={formatRelativeDueLabel(group.due_date)}
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
