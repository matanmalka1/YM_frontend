import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { taxDeadlinesApi, taxDeadlinesQK, getDeadlineTypeLabel } from '../api'
import type { DeadlineGroup, TaxDeadlineResponse } from '../api'
import { getTaxDeadlinePeriodLabel } from '../utils'
import { getTaxDeadlineSourcePath } from '../sourcePath'
import { cn, formatDate } from '../../../utils/utils'
import { DeadlineStatusBadge } from './TaxDeadlineTableParts'
import { TaxDeadlineRowActions } from './TaxDeadlineRowActions'
import { StateCard } from '../../../components/ui/feedback/StateCard'

interface TaxDeadlinesGroupedTableProps {
  groups: DeadlineGroup[]
  onComplete?: (id: number) => void
  onReopen?: (id: number) => void
  completingId: number | null
  reopeningId?: number | null
  onRowClick?: (deadline: TaxDeadlineResponse) => void
  onEdit?: (deadline: TaxDeadlineResponse) => void
  onDelete?: (id: number) => void
  deletingId?: number | null
}

interface GroupRowProps {
  group: DeadlineGroup
  onComplete?: (id: number) => void
  onReopen?: (id: number) => void
  completingId: number | null
  reopeningId?: number | null
  onRowClick?: (deadline: TaxDeadlineResponse) => void
  onEdit?: (deadline: TaxDeadlineResponse) => void
  onDelete?: (id: number) => void
  deletingId?: number | null
}

const ClientsSubTable = ({
  groupKey,
  onComplete,
  onReopen,
  completingId,
  reopeningId,
  onRowClick,
  onEdit,
  onDelete,
  deletingId,
}: {
  groupKey: string
  onComplete?: (id: number) => void
  onReopen?: (id: number) => void
  completingId: number | null
  reopeningId?: number | null
  onRowClick?: (deadline: TaxDeadlineResponse) => void
  onEdit?: (deadline: TaxDeadlineResponse) => void
  onDelete?: (id: number) => void
  deletingId?: number | null
}) => {
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const { data, isLoading } = useQuery({
    queryKey: taxDeadlinesQK.groupClients(groupKey, { page, page_size: PAGE_SIZE }),
    queryFn: () => taxDeadlinesApi.listGroupClients(groupKey, { page, page_size: PAGE_SIZE }),
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-400">טוען לקוחות...</div>
  }

  if (items.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-400">אין לקוחות לקבוצה זו</div>
  }

  return (
    <div className="border-t border-gray-100">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-right">
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">לקוח</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">סוג מועד</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">תקופה / שנת מס</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">תאריך יעד</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">סטטוס</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500">מקור מקושר</th>
            <th className="w-10 px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((d) => (
            <tr
              key={d.id}
              className={cn(
                'transition-colors duration-100',
                onRowClick && 'cursor-pointer hover:bg-primary-50/30',
                d.status === 'canceled' && 'opacity-50',
              )}
              onClick={() => onRowClick?.(d)}
            >
              <td className="px-4 py-2">
                <span className="block max-w-[240px] truncate font-medium text-gray-800">
                  {d.client_name ?? `לקוח #${d.client_record_id}`}
                </span>
              </td>
              <td className="px-4 py-2">{getDeadlineTypeLabel(d.deadline_type)}</td>
              <td className="px-4 py-2">{getTaxDeadlinePeriodLabel(d)}</td>
              <td className="px-4 py-2 font-mono tabular-nums">{formatDate(d.due_date)}</td>
              <td className="px-4 py-2">
                <DeadlineStatusBadge status={d.status} />
              </td>
              <td className="px-4 py-2">{getTaxDeadlineSourcePath(d) ? 'קיים' : 'חסר'}</td>
              <td className="px-4 py-2">
                <TaxDeadlineRowActions
                  deadline={d}
                  completingId={completingId}
                  reopeningId={reopeningId}
                  deletingId={deletingId}
                  onComplete={onComplete}
                  onReopen={onReopen}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-100 py-2 text-xs text-gray-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40"
          >
            הקודם
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40"
          >
            הבא
          </button>
        </div>
      )}
    </div>
  )
}

const GroupRow = ({
  group,
  onComplete,
  onReopen,
  completingId,
  reopeningId,
  onRowClick,
  onEdit,
  onDelete,
  deletingId,
}: GroupRowProps) => {
  const [expanded, setExpanded] = useState(false)
  const secondaryLabel = getGroupSecondaryLabel(group)

  const metrics: PeriodSummaryMetric[] = [
    { label: 'לקוחות', value: group.total_clients },
    { label: 'ממתינים', value: group.pending_count, tone: group.pending_count > 0 ? 'warning' : 'muted' },
    { label: 'הושלמו', value: group.completed_count, tone: group.completed_count > 0 ? 'success' : 'muted' },
    { label: 'באיחור', value: group.overdue_count, tone: group.overdue_count > 0 ? 'danger' : 'muted' },
  ]

  return (
    <GroupedPeriodRow
      typeLabel={getDeadlineTypeLabel(group.deadline_type)}
      primaryLabel={formatDueDateLabel(group.due_date, getDeadlineDueDatePrefix(group.deadline_type)) ?? group.due_date}
      secondaryLabel={secondaryLabel}
      relativeDueLabel={group.worst_urgency === 'none' ? null : formatRelativeDueLabel(group.due_date)}
      isOpen={expanded}
      onToggle={setExpanded}
      metrics={metrics}
      ctaLabel="פתח לקוחות"
      className={cn(
        group.overdue_count > 0 && 'border-r-4 border-negative-500',
        group.worst_urgency === 'critical' && !group.overdue_count && 'border-r-4 border-negative-400',
        group.worst_urgency === 'warning' && !group.overdue_count && 'border-r-4 border-warning-400',
      )}
    >
      <ClientsSubTable
        groupKey={group.group_key}
        onComplete={onComplete}
        onReopen={onReopen}
        completingId={completingId}
        reopeningId={reopeningId}
        onRowClick={onRowClick}
        onEdit={onEdit}
        onDelete={onDelete}
        deletingId={deletingId}
      />
    </GroupedPeriodRow>
  )
}

const getDeadlineDueDatePrefix = (deadlineType: string) => {
  if (deadlineType === 'advance_payment') return 'לתשלום עד'
  if (deadlineType === 'vat' || deadlineType === 'annual_report') return 'להגשה עד'
  return 'מועד עד'
}

const getGroupSecondaryLabel = (group: DeadlineGroup): string | null => {
  if (group.deadline_type === 'annual_report') {
    const years = group.tax_years?.length ? group.tax_years : group.tax_year != null ? [group.tax_year] : []
    return years.length ? `שנת מס: ${years.join(' · ')}` : null
  }
  if (group.deadline_type !== 'vat' && group.deadline_type !== 'advance_payment') return null
  const periods = (
    group.periods?.length
      ? group.periods
      : group.period
        ? [{ period: group.period, period_months_count: group.period_months_count }]
        : []
  )
    .map((period) =>
      getTaxDeadlinePeriodLabel({
        deadline_type: group.deadline_type,
        period: period.period,
        period_months_count: period.period_months_count,
        tax_year: null,
      }),
    )
    .filter((label, index, labels) => labels.indexOf(label) === index)
  return periods.length ? `כולל תקופות: ${periods.join(' · ')}` : null
}

export const TaxDeadlinesGroupedTable = ({
  groups,
  onComplete,
  onReopen,
  completingId,
  reopeningId,
  onRowClick,
  onEdit,
  onDelete,
  deletingId,
}: TaxDeadlinesGroupedTableProps) => {
  if (groups.length === 0) {
    return (
      <StateCard
        icon={Inbox}
        title="אין מועדים להצגה"
        message="לא נמצאו מועדי מס התואמים לסינון הנוכחי"
        variant="illustration"
      />
    )
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <GroupRow
          key={group.group_key}
          group={group}
          onComplete={onComplete}
          onReopen={onReopen}
          completingId={completingId}
          reopeningId={reopeningId}
          onRowClick={onRowClick}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  )
}

TaxDeadlinesGroupedTable.displayName = 'TaxDeadlinesGroupedTable'
