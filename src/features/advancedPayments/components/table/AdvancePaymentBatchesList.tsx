import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { getAdvancePaymentBatchKey } from '../../utils/advancePaymentUtils'
import { AdvancePaymentBatchRow } from './AdvancePaymentBatchRow'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchesListProps {
  isLoading: boolean
  batches: AdvancePaymentDueDateGroup[]
  displayBatches: AdvancePaymentDueDateGroup[]
  year: number | null
  defaultOpenBatchKey: string | null
  currentReportingYear: number
  currentReportingMonth: number
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const AdvancePaymentBatchesList = ({
  isLoading,
  batches,
  displayBatches,
  year,
  defaultOpenBatchKey,
  currentReportingYear,
  currentReportingMonth,
  clientRecordId,
  statusFilter,
  periodFilter,
  onRowClick,
  onNavigateToClient,
}: AdvancePaymentBatchesListProps) => (
  <MonthlyAccordionList
    isLoading={isLoading}
    isEmpty={!isLoading && batches.length === 0}
    emptyState={{ message: year === null ? ADVANCED_PAYMENTS_MESSAGES.batchesList.emptyNoYear : ADVANCED_PAYMENTS_MESSAGES.batchesList.emptyWithYear(year) }}
    skeletonCols={11}
  >
    {displayBatches.map((batch) => {
      const stableKey = getAdvancePaymentBatchKey(batch)
      const isCurrentPeriod = reportingPeriodIncludesMonth(
        batch.year,
        batch.month,
        batch.period_months_count,
        currentReportingYear,
        currentReportingMonth,
      )

      return (
        <AdvancePaymentBatchRow
          key={stableKey}
          batch={batch}
          defaultOpen={stableKey === defaultOpenBatchKey}
          isCurrentPeriod={isCurrentPeriod}
          clientRecordId={clientRecordId}
          statusFilter={statusFilter}
          periodFilter={periodFilter}
          onRowClick={onRowClick}
          onNavigateToClient={onNavigateToClient}
        />
      )
    })}
  </MonthlyAccordionList>
)

AdvancePaymentBatchesList.displayName = 'AdvancePaymentBatchesList'
