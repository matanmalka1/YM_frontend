import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { getTotalPages } from '@/utils/paginationUtils'
import type { AdvancePaymentDueDateGroup, AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../../api/contracts'
import { ADVANCE_PAYMENT_BATCH_PAGE_SIZE, useAdvancePaymentBatchRows } from '../../hooks/useAdvancePaymentBatchRows'
import { AdvancePaymentBatchTableRow } from './AdvancePaymentBatchTableRow'
import {
  ADVANCE_PAYMENT_BATCH_COLUMN_COUNT,
  ADVANCE_PAYMENT_BATCH_TABLE_HEADERS,
} from './advancePaymentBatchTable.constants'

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

  if (content.isLoading) return <TableSkeleton rows={3} columns={ADVANCE_PAYMENT_BATCH_COLUMN_COUNT} />

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-right">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {ADVANCE_PAYMENT_BATCH_TABLE_HEADERS.map((header) => (
                <th key={header.label} className={header.className}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {content.rows.length === 0 ? (
              <tr>
                <td colSpan={ADVANCE_PAYMENT_BATCH_COLUMN_COUNT} className="py-5 text-center text-sm text-gray-400">
                  אין תוצאות
                </td>
              </tr>
            ) : (
              content.rows.map((row) => (
                <AdvancePaymentBatchTableRow
                  key={row.id}
                  row={row}
                  onRowClick={onRowClick}
                  onNavigateToClient={onNavigateToClient}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {content.total > ADVANCE_PAYMENT_BATCH_PAGE_SIZE ? (
        <PaginationCard
          page={content.page}
          totalPages={getTotalPages(content.total, ADVANCE_PAYMENT_BATCH_PAGE_SIZE)}
          total={content.total}
          label="מקדמות"
          onPageChange={content.setPage}
        />
      ) : null}
    </>
  )
}
