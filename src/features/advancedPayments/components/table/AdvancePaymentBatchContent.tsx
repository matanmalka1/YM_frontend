import { GLOBAL_UI_MESSAGES } from '@/messages'
import { useMemo } from 'react'
import { PaginatedDataTable } from '@/components/ui/table'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { ADVANCE_PAYMENT_BATCH_PAGE_SIZE, useAdvancePaymentBatchRows } from '../../hooks/useAdvancePaymentBatchRows'
import { buildAdvancePaymentBatchColumns } from './AdvancePaymentBatchColumns'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentBatchContentProps {
  batch: AdvancePaymentDueDateGroup
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
  onRowClick: (row: AdvancePaymentOverviewRow) => void
  onNavigateToClient: (clientRecordId: number) => void
}

export const AdvancePaymentBatchContent = ({
  batch,
  clientRecordId,
  statusFilter,
  periodFilter,
  onRowClick,
  onNavigateToClient,
}: AdvancePaymentBatchContentProps) => {
  const content = useAdvancePaymentBatchRows({ batch, clientRecordId, statusFilter, periodFilter })
  const columns = useMemo(
    () => buildAdvancePaymentBatchColumns({ onRowClick, onNavigateToClient }),
    [onRowClick, onNavigateToClient],
  )

  return (
    <PaginatedDataTable
      data={content.rows}
      columns={columns}
      getRowKey={(row) => row.id}
      onRowClick={onRowClick}
      isLoading={content.isLoading}
      isFetching={content.isFetching}
      emptyMessage={GLOBAL_UI_MESSAGES.common.noResults}
      getRowVariant={(row) => (row.timing_status === 'overdue' ? 'dangerSoft' : undefined)}
      page={content.page}
      pageSize={ADVANCE_PAYMENT_BATCH_PAGE_SIZE}
      total={content.total}
      onPageChange={content.setPage}
      label={ADVANCED_PAYMENTS_MESSAGES.batchContent.paginationLabel}
    />
  )
}
