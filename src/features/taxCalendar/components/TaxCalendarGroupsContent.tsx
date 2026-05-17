import { Alert } from '@/components/ui/overlays/Alert'
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
  </>
)

TaxCalendarGroupsContent.displayName = 'TaxCalendarGroupsContent'
