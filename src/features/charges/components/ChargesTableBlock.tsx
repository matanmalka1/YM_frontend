import type { Column } from '@/components/ui/table/DataTable'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { Alert } from '@/components/ui/overlays/Alert'
import { getChargeRowClassName, getChargesEmptyState } from '../utils/chargeHelpers'
import type { BulkChargeActionPayload, ChargeListItem } from '../api'
import { ChargeBulkToolbar } from './ChargeBulkToolbar'

interface ChargesTableBlockProps {
  charges: ChargeListItem[]
  columns: Column<ChargeListItem>[]
  error?: string | null
  isAdvisor: boolean
  loading?: boolean
  page: number
  pageSize: number
  selectedCount: number
  total: number
  bulkLoading: boolean
  onBulkAction: (action: BulkChargeActionPayload['action'], cancellationReason?: string) => Promise<void>
  onClearSelection: () => void
  onCreateCharge: () => void
  onOpenCharge: (chargeId: number) => void
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export const ChargesTableBlock = ({
  charges,
  columns,
  error,
  isAdvisor,
  loading = false,
  page,
  pageSize,
  selectedCount,
  total,
  bulkLoading,
  onBulkAction,
  onClearSelection,
  onCreateCharge,
  onOpenCharge,
  onPageChange,
  onPageSizeChange,
}: ChargesTableBlockProps) => (
  <>
    {!isAdvisor && <Alert variant="info" message="צפייה בלבד. יצירה ושינוי חיובים זמינים ליועץ בלבד." />}

    {isAdvisor && selectedCount > 0 && (
      <ChargeBulkToolbar
        selectedCount={selectedCount}
        loading={bulkLoading}
        onAction={onBulkAction}
        onClear={onClearSelection}
      />
    )}

    <PaginatedDataTable
      data={charges}
      columns={columns}
      error={error}
      getRowKey={(charge) => charge.id}
      isLoading={loading}
      onRowClick={(charge) => onOpenCharge(charge.id)}
      page={page}
      pageSize={pageSize}
      total={total}
      label="חיובים"
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      rowClassName={(charge) => getChargeRowClassName(charge.status)}
      emptyMessage="אין חיובים להצגה"
      emptyState={getChargesEmptyState(isAdvisor, onCreateCharge)}
    />
  </>
)

ChargesTableBlock.displayName = 'ChargesTableBlock'
