import { Alert } from '@/components/ui/overlays/Alert'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { getTotalPages } from '@/utils/paginationUtils'
import { getErrorMessage } from '@/utils/utils'
import type { TaxCalendarGroup } from '../api'
import { TaxCalendarGroupsTable } from './TaxCalendarGroupsTable'

interface TaxCalendarGroupsContentProps {
  groups: TaxCalendarGroup[]
  isLoading: boolean
  error: unknown
  errorFallback: string
  clientRecordId?: number
  clientSearchText?: string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export const TaxCalendarGroupsContent = ({
  groups,
  isLoading,
  error,
  errorFallback,
  clientRecordId,
  clientSearchText,
  page,
  pageSize,
  total,
  onPageChange,
}: TaxCalendarGroupsContentProps) => (
  <>
    {error ? <Alert variant="error" message={getErrorMessage(error, errorFallback)} /> : null}

    <TaxCalendarGroupsTable
      groups={groups}
      isLoading={isLoading}
      clientRecordId={clientRecordId}
      clientSearchText={clientSearchText}
    />

    {!isLoading && total > pageSize ? (
      <PaginationCard
        page={page}
        totalPages={getTotalPages(total, pageSize)}
        total={total}
        label="קבוצות"
        onPageChange={onPageChange}
      />
    ) : null}
  </>
)

TaxCalendarGroupsContent.displayName = 'TaxCalendarGroupsContent'
