import { Alert } from '@/components/ui/overlays/Alert'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { getTotalPages } from '@/utils/paginationUtils'
import { getErrorMessage } from '@/utils/utils'
import type { TaxCalendarGroup } from '../api'
import { TaxCalendarGroupsTable } from './TaxCalendarGroupsTable'
import { TaxCalendarSummaryStrip } from './TaxCalendarSummaryStrip'

interface TaxCalendarGroupsContentProps {
  groups: TaxCalendarGroup[]
  isLoading: boolean
  error: unknown
  errorFallback: string
  linkedLabel: string
  clientRecordId?: number
  clientSearchText?: string
  showGroupsCount?: boolean
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
  linkedLabel,
  clientRecordId,
  clientSearchText,
  showGroupsCount,
  page,
  pageSize,
  total,
  onPageChange,
}: TaxCalendarGroupsContentProps) => (
  <>
    {error ? <Alert variant="error" message={getErrorMessage(error, errorFallback)} /> : null}

    <TaxCalendarSummaryStrip groups={groups} linkedLabel={linkedLabel} showGroupsCount={showGroupsCount} />

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
