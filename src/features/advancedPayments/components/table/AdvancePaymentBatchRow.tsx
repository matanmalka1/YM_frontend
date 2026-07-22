import { GLOBAL_UI_MESSAGES } from '@/messages'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/grouping/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/grouping/groupedPeriodRow.utils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { getIncludedPeriodLabel } from '../../utils/advancePaymentComponentUtils'
import { AdvancePaymentBatchContent } from './AdvancePaymentBatchContent'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchRowProps {
  batch: AdvancePaymentDueDateGroup
  defaultOpen: boolean
  scrollOnMount?: boolean
  isCurrentPeriod: boolean
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

const getBatchSummary = (batch: AdvancePaymentDueDateGroup): PeriodSummaryMetric[] => {
  const summary: PeriodSummaryMetric[] = [
    { label: GLOBAL_UI_MESSAGES.common.clients, value: batch.client_count },
    {
      label: ADVANCED_PAYMENTS_MESSAGES.batchRow.pendingLabel,
      value: batch.pending_count,
      tone: batch.pending_count > 0 ? 'warning' : 'muted',
    },
    {
      label: ADVANCED_PAYMENTS_MESSAGES.batchRow.paidLabel,
      value: batch.paid_count,
      tone: batch.paid_count > 0 ? 'positive' : 'muted',
    },
    {
      label: ADVANCED_PAYMENTS_MESSAGES.batchRow.unpaidLabel,
      value: batch.not_paid_count,
      tone: batch.not_paid_count > 0 ? 'warning' : 'muted',
    },
    {
      label: ADVANCED_PAYMENTS_MESSAGES.batchRow.overdueLabel,
      value: batch.overdue_count,
      tone: batch.overdue_count > 0 ? 'negative' : 'muted',
    },
  ]
  if (batch.missing_turnover_count > 0) {
    summary.push({
      label: ADVANCED_PAYMENTS_MESSAGES.batchRow.missingTurnoverLabel,
      value: batch.missing_turnover_count,
      tone: 'warning',
    })
  }
  return summary
}

export const AdvancePaymentBatchRow: React.FC<AdvancePaymentBatchRowProps> = ({
  batch,
  defaultOpen,
  scrollOnMount,
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
      typeLabel={ADVANCED_PAYMENTS_MESSAGES.batchRow.typeLabel}
      primaryLabel={formatDueDateLabel(dueDate, ADVANCED_PAYMENTS_MESSAGES.batchRow.dueDatePrefix) ?? dueDate ?? '—'}
      secondaryLabel={getIncludedPeriodLabel(batch.source_batches ?? [batch])}
      relativeDueLabel={formatRelativeDueLabel(dueDate, { showPastDue: batch.overdue_count > 0 })}
      isCurrentPeriod={isCurrentPeriod}
      defaultOpen={defaultOpen}
      scrollOnMount={scrollOnMount}
      metrics={getBatchSummary(batch)}
      ctaLabel={ADVANCED_PAYMENTS_MESSAGES.batchRow.ctaLabel}
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
