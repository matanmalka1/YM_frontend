import { GLOBAL_UI_MESSAGES } from '@/messages'
import { GroupedPeriodRow, type PeriodSummaryMetric } from '@/components/ui/grouping/GroupedPeriodRow'
import { formatDueDateLabel, formatRelativeDueLabel } from '@/components/ui/grouping/groupedPeriodRow.utils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import type { AdvancePaymentOverviewSortBy, AdvancePaymentOverviewSortOrder } from '../../constants'
import type { AdvancePaymentRowSelection } from './AdvancePaymentBatchColumns'
import { getIncludedPeriodLabel } from '../../utils/advancePaymentComponentUtils'
import { AdvancePaymentBatchContent } from './AdvancePaymentBatchContent'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchRowProps {
  batch: AdvancePaymentDueDateGroup
  defaultOpen: boolean
  scrollOnMount?: boolean
  isCurrentPeriod: boolean
  clientRecordId?: number
  clientSearch?: string
  statusFilter: AdvancePaymentStatus | ''
  timingFilter?: 'overdue'
  /** Server-computed flag; true keeps only rows disagreeing with their VAT return. */
  vatMismatchFilter?: true
  periodFilter: 1 | 2 | null
  sortBy: AdvancePaymentOverviewSortBy
  order: AdvancePaymentOverviewSortOrder
  selection?: AdvancePaymentRowSelection
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
  if (batch.vat_mismatch_count > 0) {
    summary.push({
      label: ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.mismatchBadge,
      value: batch.vat_mismatch_count,
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
  clientSearch,
  statusFilter,
  timingFilter,
  vatMismatchFilter,
  periodFilter,
  sortBy,
  order,
  selection,
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
      ctaLabel={GLOBAL_UI_MESSAGES.actions.openClients}
    >
      <AdvancePaymentBatchContent
        batch={batch}
        clientRecordId={clientRecordId}
        clientSearch={clientSearch}
        statusFilter={statusFilter}
        timingFilter={timingFilter}
        vatMismatchFilter={vatMismatchFilter}
        periodFilter={periodFilter}
        sortBy={sortBy}
        order={order}
        selection={selection}
        onRowClick={onRowClick}
        onNavigateToClient={onNavigateToClient}
      />
    </GroupedPeriodRow>
  )
}

AdvancePaymentBatchRow.displayName = 'AdvancePaymentBatchRow'
