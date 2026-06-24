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
import { TaxCalendarGroupsContent } from '../list/TaxCalendarGroupsContent'
import { TaxCalendarStatsSection } from '../list/TaxCalendarStatsSection'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { DetailTabPanel } from '@/components/ui/layout'
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

  const groupsQuery = useTaxCalendarGroups(params)
  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])
  const groupsSummary = groupsQuery.data?.summary

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
      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback={TAX_CALENDAR_ERROR_MESSAGES.clientTab.load}
        clientRecordId={clientId}
        page={page}
        pageSize={TAX_CALENDAR_GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setUrlPage}
      />
    </DetailTabPanel>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
