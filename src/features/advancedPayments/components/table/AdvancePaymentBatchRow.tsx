import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/table/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/table/groupedPeriodRow.utils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { getIncludedPeriodLabel } from '../../utils/advancePaymentComponentUtils'
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


const getBatchSummary = (batch: AdvancePaymentDueDateGroup): PeriodSummaryMetric[] => {
  const summary: PeriodSummaryMetric[] = [
    { label: 'לקוחות', value: batch.client_count },
    { label: 'ממתינים', value: batch.pending_count, tone: batch.pending_count > 0 ? 'warning' : 'muted' },
    { label: 'שולם', value: batch.paid_count, tone: batch.paid_count > 0 ? 'success' : 'muted' },
    { label: 'לא שולם', value: batch.not_paid_count, tone: batch.not_paid_count > 0 ? 'warning' : 'muted' },
    { label: 'באיחור', value: batch.overdue_count, tone: batch.overdue_count > 0 ? 'danger' : 'muted' },
  ]
  if (batch.missing_turnover_count > 0) {
    summary.push({ label: 'חסרי מחזור', value: batch.missing_turnover_count, tone: 'warning' })
  }
  return summary
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
  return (
    <GroupedPeriodRow
      typeLabel="מקדמות"
      primaryLabel={formatDueDateLabel(dueDate, 'לתשלום עד') ?? dueDate ?? '—'}
      secondaryLabel={getIncludedPeriodLabel(batch.source_batches ?? [batch])}
      relativeDueLabel={formatRelativeDueLabel(dueDate)}
      isCurrentPeriod={isCurrentPeriod}
      defaultOpen={defaultOpen}
      metrics={getBatchSummary(batch)}
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
