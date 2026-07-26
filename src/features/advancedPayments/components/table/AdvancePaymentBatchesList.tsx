import { GLOBAL_UI_MESSAGES } from '@/messages'
import { MonthlyAccordionList } from '@/components/ui/grouping/MonthlyAccordionList'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import type { AdvancePaymentOverviewSortBy, AdvancePaymentOverviewSortOrder } from '../../constants'
import type { AdvancePaymentRowSelection } from './AdvancePaymentBatchColumns'
import { getAdvancePaymentBatchKey } from '../../utils/advancePaymentUtils'
import { AdvancePaymentBatchRow } from './AdvancePaymentBatchRow'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchesListProps {
  isLoading: boolean
  batches: AdvancePaymentDueDateGroup[]
  displayBatches: AdvancePaymentDueDateGroup[]
  year: number | null
  defaultOpenBatchKey: string | null
  /** Deep-linked batch (dashboard stat card) — scrolls into view on mount */
  focusBatchKey: string | null
  currentReportingYear: number
  currentReportingMonth: number
  clientRecordId?: number
  clientSearch?: string
  statusFilter: AdvancePaymentStatus | ''
  timingFilter?: 'overdue'
  /** Server-computed flag; true keeps only rows disagreeing with their VAT return. */
  vatMismatchFilter?: true
  periodFilter: 1 | 2 | null
  sortBy: AdvancePaymentOverviewSortBy
  order: AdvancePaymentOverviewSortOrder
  /** Present only when the viewer may run bulk actions (advisor). */
  selection?: AdvancePaymentRowSelection
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const AdvancePaymentBatchesList = ({
  isLoading,
  batches,
  displayBatches,
  year,
  defaultOpenBatchKey,
  focusBatchKey,
  currentReportingYear,
  currentReportingMonth,
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
}: AdvancePaymentBatchesListProps) => (
  <MonthlyAccordionList
    isLoading={isLoading}
    isEmpty={!isLoading && displayBatches.length === 0}
    emptyState={{
      message:
        batches.length > 0
          ? GLOBAL_UI_MESSAGES.common.noResults
          : year === null
            ? ADVANCED_PAYMENTS_MESSAGES.batchesList.emptyNoYear
            : ADVANCED_PAYMENTS_MESSAGES.batchesList.emptyWithYear(year),
    }}
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
          scrollOnMount={stableKey === focusBatchKey}
          isCurrentPeriod={isCurrentPeriod}
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
      )
    })}
  </MonthlyAccordionList>
)

AdvancePaymentBatchesList.displayName = 'AdvancePaymentBatchesList'
