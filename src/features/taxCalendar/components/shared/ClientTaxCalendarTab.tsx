import { type FC, useMemo } from 'react'
import { useTaxCalendarGroups } from '../../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_GROUP_PAGE_SIZE,
  readTaxCalendarCommonFilters,
  taxCalendarYearResetDefaults,
  toTaxCalendarCommonParams,
} from '../../utils'
import { type TaxCalendarGroupsParams } from '../../api'
import { TaxCalendarFiltersBar } from '../list/TaxCalendarFiltersBar'
import { TaxCalendarStatsSection } from '../list/TaxCalendarStatsSection'
import { ClientTaxCalendarList } from './ClientTaxCalendarList'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { DetailTabPanel } from '@/components/ui/layout'
import { Alert } from '@/components/ui/overlays/Alert'
import { PaginationCard } from '@/components/ui/table'
import { getTotalPages } from '@/utils/paginationUtils'
import { getErrorMessage } from '@/utils/utils'
import { TAX_CALENDAR_MESSAGES } from '../../messages'
import { TAX_CALENDAR_ERROR_MESSAGES } from '../../errorMessages'

interface ClientTaxCalendarTabProps {
  clientId: number
}

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const { searchParams, getParam, getPage, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const { startYear, endYear, obligationType, status, page } = readTaxCalendarCommonFilters(
    searchParams,
    getParam,
    getPage,
  )

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      ...toTaxCalendarCommonParams({ startYear, endYear, obligationType, status, page }),
      client_record_id: clientId,
    }),
    [clientId, endYear, obligationType, page, startYear, status],
  )

  const { data, isPending, error } = useTaxCalendarGroups(params)
  const groups = useMemo(() => data?.items ?? [], [data])
  const groupsSummary = data?.summary
  const total = data?.total ?? 0

  const resetAllFilters = () => resetFilters(taxCalendarYearResetDefaults())

  return (
    <DetailTabPanel
      title={TAX_CALENDAR_MESSAGES.clientTab.title}
      subtitle={TAX_CALENDAR_MESSAGES.clientTab.subtitle}
      summary={
        <TaxCalendarStatsSection
          summary={groupsSummary ?? { groups: 0, linked: 0, open: 0, overdue: 0, done: 0 }}
          linkedLabel={TAX_CALENDAR_MESSAGES.clientTab.linkedLabel}
        />
      }
      filters={
        <TaxCalendarFiltersBar
          startYear={startYear}
          endYear={endYear}
          obligationType={obligationType ?? ''}
          status={status}
          onStartYearChange={(value) => setFilter('tax_year_after', value)}
          onEndYearChange={(value) => setFilter('tax_year_before', value)}
          onObligationTypeChange={(value) => setFilter('obligation_type', value)}
          onStatusChange={(value) => setFilter('status', value === 'all' ? '' : value)}
          onReset={resetAllFilters}
        />
      }
    >
      {error ? (
        <Alert variant="error" message={getErrorMessage(error, TAX_CALENDAR_ERROR_MESSAGES.clientTab.load)} />
      ) : (
        <>
          <ClientTaxCalendarList groups={groups} isLoading={isPending} clientRecordId={clientId} />

          {!isPending && total > TAX_CALENDAR_GROUP_PAGE_SIZE ? (
            <PaginationCard
              page={page}
              totalPages={getTotalPages(total, TAX_CALENDAR_GROUP_PAGE_SIZE)}
              total={total}
              label={TAX_CALENDAR_MESSAGES.clientTab.linkedLabel}
              onPageChange={setUrlPage}
            />
          ) : null}
        </>
      )}
    </DetailTabPanel>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
