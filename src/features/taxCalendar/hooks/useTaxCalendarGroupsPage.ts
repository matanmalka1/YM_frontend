import { useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { type TaxCalendarGroupsParams, type TaxCalendarGroupsSummary } from '../api'
import {
  TAX_CALENDAR_GROUP_PAGE_SIZE,
  readTaxCalendarCommonFilters,
  taxCalendarYearResetDefaults,
  toTaxCalendarCommonParams,
} from '../utils'
import { useTaxCalendarGroups } from './useTaxCalendarGroups'

const EMPTY_SUMMARY: TaxCalendarGroupsSummary = { groups: 0, linked: 0, open: 0, overdue: 0, done: 0 }

export const useTaxCalendarGroupsPage = () => {
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

  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])

  return {
    status: {
      isLoading: groupsQuery.isPending,
      isFetching: groupsQuery.isFetching,
      error: groupsQuery.error,
      errorFallback: 'שגיאה בטעינת יומן המס',
    },
    headerProps: {
      title: 'יומן מס',
      size: 'lg' as const,
    },
    stats: {
      summary: groupsQuery.data?.summary ?? EMPTY_SUMMARY,
      linkedLabel: 'לקוחות מקושרים',
      showGroupsCount: true,
    },
    filters: {
      startYear,
      endYear,
      obligationType: obligationType ?? '',
      status,
      onStartYearChange: (value: string) => setFilter('tax_year_after', value),
      onEndYearChange: (value: string) => setFilter('tax_year_before', value),
      onObligationTypeChange: (value: string) => setFilter('obligation_type', value),
      onStatusChange: (value: string) => setFilter('status', value === 'all' ? '' : value),
      onReset: () => resetFilters(taxCalendarYearResetDefaults()),
      clientSearchText,
      onClientSearchTextChange: (value: string) => setFilter('client_search', value),
      includeEmpty,
      onIncludeEmptyChange: (value: boolean) => setFilter('include_empty', value ? 'true' : ''),
    },
    table: {
      groups,
      isLoading: groupsQuery.isPending,
      error: groupsQuery.error,
      errorFallback: 'שגיאה בטעינת יומן המס',
      clientSearchText,
      page,
      pageSize: TAX_CALENDAR_GROUP_PAGE_SIZE,
      total: groupsQuery.data?.total ?? 0,
      onPageChange: setUrlPage,
    },
  }
}
