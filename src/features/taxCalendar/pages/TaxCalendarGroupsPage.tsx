import { useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaxCalendarFiltersBar } from '../components/TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from '../components/TaxCalendarGroupsContent'
import { TaxCalendarStatsSection } from '../components/TaxCalendarStatsSection'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_GROUP_PAGE_SIZE,
  readTaxCalendarCommonFilters,
  taxCalendarYearResetDefaults,
  toTaxCalendarCommonParams,
} from '../utils'
import { type TaxCalendarGroupsParams } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

export const TaxCalendarGroupsPage = () => {
  const { searchParams, getParam, getPage, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const { startYear, endYear, obligationType, status, page } = readTaxCalendarCommonFilters(
    searchParams,
    getParam,
    getPage,
  )
  const includeEmpty = searchParams.get('include_empty') === 'true'
  const clientSearchText = getParam('client_search')

  const [debouncedClientSearch] = useDebounce(clientSearchText, 350)

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      ...toTaxCalendarCommonParams({ startYear, endYear, obligationType, status, page }),
      include_empty: includeEmpty,
      client_search: debouncedClientSearch.trim() || undefined,
    }),
    [debouncedClientSearch, endYear, includeEmpty, obligationType, page, startYear, status],
  )

  const groupsQuery = useTaxCalendarGroups(params)

  const resetAllFilters = () => resetFilters(taxCalendarYearResetDefaults())

  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])
  const groupsSummary = groupsQuery.data?.summary

  return (
    <div className="space-y-4" dir="rtl">
      <PageHeader title="יומן מס" size="lg" />

      <TaxCalendarStatsSection
        summary={groupsSummary ?? { groups: 0, linked: 0, open: 0, overdue: 0, done: 0 }}
        linkedLabel="לקוחות מקושרים"
        showGroupsCount
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
        clientSearchText={clientSearchText}
        onClientSearchTextChange={(value) => setFilter('client_search', value)}
        includeEmpty={includeEmpty}
        onIncludeEmptyChange={(value) => setFilter('include_empty', value ? 'true' : '')}
      />

      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת יומן המס"
        clientSearchText={clientSearchText}
        page={page}
        pageSize={TAX_CALENDAR_GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setUrlPage}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
