import { type FC, useMemo } from 'react'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_GROUP_PAGE_SIZE,
  readTaxCalendarCommonFilters,
  taxCalendarYearResetDefaults,
  toTaxCalendarCommonParams,
} from '../utils'
import { type TaxCalendarGroupsParams } from '../api'
import { TaxCalendarFiltersBar } from './TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from './TaxCalendarGroupsContent'
import { TaxCalendarStatsSection } from './TaxCalendarStatsSection'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

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
    <div className="space-y-4" dir="rtl">
      <TaxCalendarStatsSection
        summary={groupsSummary ?? { groups: 0, linked: 0, open: 0, overdue: 0, done: 0 }}
        linkedLabel="מועדים"
      />

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

      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת מועדי המס"
        clientRecordId={clientId}
        page={page}
        pageSize={TAX_CALENDAR_GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setUrlPage}
      />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
