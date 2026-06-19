import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { getAdvancePaymentBatchKey } from '../../advancedPaymentsPage.utils'
import { AdvancePaymentBatchRow } from './AdvancePaymentBatchRow'

interface AdvancePaymentsBatchesListProps {
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

export const AdvancePaymentsBatchesList = ({
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
}: AdvancePaymentsBatchesListProps) => (
  <MonthlyAccordionList
    isLoading={isLoading}
    isEmpty={!isLoading && batches.length === 0}
    emptyState={{ message: year === null ? 'אין מקדמות' : `אין מקדמות לשנה ${year}` }}
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

AdvancePaymentsBatchesList.displayName = 'AdvancePaymentsBatchesList'
