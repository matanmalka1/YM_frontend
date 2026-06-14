import { AlertTriangle, ExternalLink, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import { getTotalPages } from '@/utils/paginationUtils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../types'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { formatShekelAmount } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from './advancePaymentComponent.utils'
import { formatDate, formatClientOfficeId } from '../../../utils/utils'
import { AdvancePaymentStatusBadge } from './AdvancePaymentStatusBadge'
import { RowActionsMenu, RowActionItem } from '../../../components/ui/table/RowActions'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const COL_COUNT = 11
const PAGE_SIZE = 20

const TABLE_HEADERS = [
  {
    label: 'מס׳',
    className: 'px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right align-middle w-16',
  },
  {
    label: 'שם לקוח',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right align-middle w-48',
  },
  {
    label: 'תקופת מקדמה',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right align-middle w-28',
  },
  {
    label: 'תאריך יעד',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right align-middle w-24',
  },
  {
    label: 'מחזור מדווח',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-24',
  },
  {
    label: 'צפוי',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-20',
  },
  {
    label: 'שולם',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-20',
  },
  {
    label: 'יתרה',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-20',
  },
  {
    label: 'אחוז מקדמה',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-20',
  },
  {
    label: 'סטטוס',
    className: 'px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center align-middle w-24',
  },
  { label: '', className: 'px-3 py-1.5 align-middle w-10' },
]

interface AdvancePaymentBatchRowProps {
  batch: AdvancePaymentDueDateGroup
  defaultOpen: boolean
  isCurrentPeriod: boolean
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
  onRowClick: (row: AdvancePaymentOverviewRow) => void
}

const formatAdvancePaymentPeriod = (batch: AdvancePaymentDueDateGroup): string => {
  const period = `${batch.year}-${String(batch.month).padStart(2, '0')}`
  return `${getAdvancePaymentMonthLabel(period, batch.period_months_count)} ${batch.year}`.replace('-', '–')
}

const getIncludedPeriodLabel = (batch: AdvancePaymentDueDateGroup): string | null => {
  const labels = (batch.source_batches ?? [batch])
    .map(formatAdvancePaymentPeriod)
    .filter((label, index, allLabels) => allLabels.indexOf(label) === index)
  return labels.length > 0 ? `כולל תקופות: ${labels.join(' · ')}` : null
}

const BatchContent = ({
  batch,
  clientRecordId,
  statusFilter,
  periodFilter,
  onRowClick,
}: Omit<AdvancePaymentBatchRowProps, 'defaultOpen' | 'isCurrentPeriod'>) => {
  const [page, setPage] = useState(1)
  const statusParam = statusFilter ? [statusFilter] : undefined
  const sourceBatches = batch.due_date ? [batch] : (batch.source_batches ?? [batch])

  useEffect(() => {
    setPage(1)
  }, [batch.due_date, batch.month, batch.period_months_count, clientRecordId, periodFilter, statusFilter])

  const queries = useQueries({
    queries: sourceBatches.map((sourceBatch) => ({
      queryKey: advancedPaymentsQK.overview({
        year: sourceBatch.year,
        month: batch.due_date ? undefined : sourceBatch.month,
        due_date: batch.due_date,
        period_months_count: periodFilter ?? undefined,
        client_record_id: clientRecordId,
        page,
        page_size: PAGE_SIZE,
        status: statusParam,
      }),
      queryFn: () =>
        advancePaymentsApi.overview({
          year: sourceBatch.year,
          month: batch.due_date ? undefined : sourceBatch.month,
          due_date: batch.due_date,
          period_months_count: periodFilter ?? undefined,
          client_record_id: clientRecordId,
          page,
          page_size: PAGE_SIZE,
          status: statusParam,
        }),
      staleTime: QUERY_STALE_TIME.default,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)

  const rowsById = new Map<number, AdvancePaymentOverviewRow>()
  queries.forEach((query, index) => {
    const sourceBatch = sourceBatches[index]
    const rows = query.data?.items ?? []
    rows.forEach((row) => {
      const rowStartMonth = Number(row.period.substring(5, 7))
      if (
        !batch.due_date &&
        (rowStartMonth !== sourceBatch.month || row.period_months_count !== sourceBatch.period_months_count)
      ) {
        return
      }
      rowsById.set(row.id, row)
    })
  })

  const filtered = Array.from(rowsById.values())
  const total = queries.reduce((sum, query) => sum + (query.data?.total ?? 0), 0)

  if (isLoading) return <TableSkeleton rows={3} columns={COL_COUNT} />

  const sorted = [...filtered].sort((a, b) => (b.missing_turnover ? 1 : 0) - (a.missing_turnover ? 1 : 0))

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {TABLE_HEADERS.map((h) => (
                <th key={h.label} className={h.className}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COL_COUNT} className="py-5 text-center text-sm text-gray-400">
                  אין תוצאות
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const isOverdue = row.timing_status === 'overdue'
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-gray-100 cursor-pointer transition-colors ${
                      isOverdue ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-blue-50/40'
                    }`}
                    onClick={() => onRowClick(row)}
                  >
                    <td className="px-3 py-1.5 text-sm text-gray-400 tabular-nums align-middle">
                      {formatClientOfficeId(row.office_client_number)}
                    </td>
                    <td className="px-3 py-1.5 align-middle w-48">
                      <Link
                        to={`/clients/${row.client_record_id}/advance-payments`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline leading-snug block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.business_name}
                      </Link>
                      {row.missing_turnover && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          חסר מחזור
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-sm text-gray-600 whitespace-nowrap align-middle">
                      {getAdvancePaymentMonthLabel(row.period, row.period_months_count)} {row.period.substring(0, 4)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-sm tabular-nums whitespace-nowrap align-middle ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}
                    >
                      {formatDate(row.due_date)}
                    </td>
                    <td dir="ltr" className="px-3 py-1.5 text-sm tabular-nums text-center align-middle">
                      {row.turnover_amount ? (
                        <span className="text-gray-700">{formatShekelAmount(row.turnover_amount)}</span>
                      ) : row.live_turnover ? (
                        <span className="text-gray-400 italic">{formatShekelAmount(row.live_turnover)}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td
                      dir="ltr"
                      className="px-3 py-1.5 text-sm font-semibold tabular-nums text-gray-800 text-center align-middle"
                    >
                      {formatShekelAmount(row.expected_amount)}
                    </td>
                    <td dir="ltr" className="px-3 py-1.5 text-sm tabular-nums text-gray-600 text-center align-middle">
                      {formatShekelAmount(row.paid_amount)}
                    </td>
                    <td dir="ltr" className="px-3 py-1.5 text-sm tabular-nums text-center align-middle">
                      {row.delta == null ? (
                        <span className="text-gray-500">—</span>
                      ) : Number(row.delta) > 0 ? (
                        <span className="font-semibold text-red-500">{formatShekelAmount(row.delta)}</span>
                      ) : (
                        <span className="text-gray-500">{formatShekelAmount(row.delta)}</span>
                      )}
                    </td>
                    <td dir="ltr" className="px-3 py-1.5 text-sm tabular-nums text-gray-600 text-center align-middle">
                      {row.advance_rate != null ? (
                        `${Number(row.advance_rate).toFixed(2)}%`
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-center align-middle">
                      <AdvancePaymentStatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu ariaLabel={`פעולות למקדמה ${row.id}`}>
                        <RowActionItem
                          label="עדכן תשלום"
                          icon={<Edit className="h-3.5 w-3.5" />}
                          onClick={() => onRowClick(row)}
                        />
                        <RowActionItem
                          label="עבור ללקוח"
                          icon={<ExternalLink className="h-3.5 w-3.5" />}
                          onClick={() => window.open(`/clients/${row.client_record_id}/advance-payments`, '_self')}
                        />
                      </RowActionsMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {total > PAGE_SIZE ? (
        <PaginationCard
          page={page}
          totalPages={getTotalPages(total, PAGE_SIZE)}
          total={total}
          label="מקדמות"
          onPageChange={setPage}
        />
      ) : null}
    </>
  )
}

export const AdvancePaymentBatchRow: React.FC<AdvancePaymentBatchRowProps> = ({
  batch,
  defaultOpen,
  isCurrentPeriod,
  clientRecordId,
  statusFilter,
  periodFilter,
  onRowClick,
}) => {
  const dueDate = batch.due_date ?? null
  const clientCount = batch.client_count
  const pendingCount = batch.pending_count
  const overdueCount = batch.overdue_count
  const missingTurnoverCount = batch.missing_turnover_count
  const paidCount = batch.paid_count
  const notPaidCount = batch.not_paid_count
  const metrics: PeriodSummaryMetric[] = [
    { label: 'לקוחות', value: clientCount },
    { label: 'ממתינים', value: pendingCount, tone: pendingCount > 0 ? 'warning' : 'muted' },
    { label: 'שולם', value: paidCount, tone: paidCount > 0 ? 'success' : 'muted' },
    { label: 'לא שולם', value: notPaidCount, tone: notPaidCount > 0 ? 'warning' : 'muted' },
    { label: 'באיחור', value: overdueCount, tone: overdueCount > 0 ? 'danger' : 'muted' },
  ]

  if (missingTurnoverCount > 0) {
    metrics.push({ label: 'חסרי מחזור', value: missingTurnoverCount, tone: 'warning' })
  }

  return (
    <GroupedPeriodRow
      typeLabel="מקדמות"
      primaryLabel={formatDueDateLabel(dueDate, 'לתשלום עד') ?? dueDate ?? '—'}
      secondaryLabel={getIncludedPeriodLabel(batch)}
      relativeDueLabel={formatRelativeDueLabel(dueDate)}
      isCurrentPeriod={isCurrentPeriod}
      defaultOpen={defaultOpen}
      metrics={metrics}
      ctaLabel="פתח לקוחות"
    >
      <BatchContent
        batch={batch}
        clientRecordId={clientRecordId}
        statusFilter={statusFilter}
        periodFilter={periodFilter}
        onRowClick={onRowClick}
      />
    </GroupedPeriodRow>
  )
}

AdvancePaymentBatchRow.displayName = 'AdvancePaymentBatchRow'
