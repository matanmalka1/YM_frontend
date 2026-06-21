import { useMemo } from 'react'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { ADVANCE_PAYMENT_BATCH_PAGE_SIZE, useAdvancePaymentBatchRows } from '../../hooks/useAdvancePaymentBatchRows'
import { buildAdvancePaymentBatchColumns } from './AdvancePaymentBatchColumns'

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
      emptyMessage="אין תוצאות"
      rowClassName={(row) => (row.timing_status === 'overdue' ? 'bg-negative-50/30 hover:bg-negative-50/60' : '')}
      page={content.page}
      pageSize={ADVANCE_PAYMENT_BATCH_PAGE_SIZE}
      total={content.total}
      onPageChange={content.setPage}
      label="מקדמות"
      showPagination={content.total > ADVANCE_PAYMENT_BATCH_PAGE_SIZE}
    />
  )
}
