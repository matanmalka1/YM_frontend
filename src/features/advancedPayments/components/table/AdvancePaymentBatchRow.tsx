import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { getAdvancePaymentMonthLabel } from '../advancePaymentComponent.utils'
import { AdvancePaymentBatchContent } from './AdvancePaymentBatchContent'

interface AdvancePaymentBatchRowProps {
  batch: AdvancePaymentDueDateGroup
  defaultOpen: boolean
  isCurrentPeriod: boolean
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
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

export const AdvancePaymentBatchRow: React.FC<AdvancePaymentBatchRowProps> = ({
  batch,
  defaultOpen,
  isCurrentPeriod,
  clientRecordId,
  statusFilter,
  periodFilter,
  onRowClick,
  onNavigateToClient,
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
      <AdvancePaymentBatchContent
        batch={batch}
        clientRecordId={clientRecordId}
        statusFilter={statusFilter}
        periodFilter={periodFilter}
        onRowClick={onRowClick}
        onNavigateToClient={onNavigateToClient}
      />
    </GroupedPeriodRow>
  )
}

AdvancePaymentBatchRow.displayName = 'AdvancePaymentBatchRow'
