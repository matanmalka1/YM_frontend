import { useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaxCalendarFiltersBar } from '../components/TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from '../components/TaxCalendarGroupsContent'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parsePositiveInt } from '@/utils/utils'

const currentYear = new Date().getFullYear()
const GROUP_PAGE_SIZE = 25

export const TaxCalendarGroupsPage = () => {
  const { searchParams, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const startYear = searchParams.get('start_year') ?? String(currentYear)
  const endYear = searchParams.get('end_year') ?? String(currentYear)
  const obligationType = searchParams.get('obligation_type') ?? ''
  const includeEmpty = searchParams.get('include_empty') === 'true'
  const status = (searchParams.get('status') as TaxCalendarGroupStatusFilter) || 'all'
  const clientSearchText = searchParams.get('client_search') ?? ''
  const page = parsePositiveInt(searchParams.get('page'), 1)

  const [debouncedClientSearch] = useDebounce(clientSearchText, 350)

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      start_year: Number(startYear) || currentYear,
      end_year: Number(endYear) || currentYear,
      obligation_type: obligationType ? (obligationType as TaxCalendarObligationType) : undefined,
      status,
      include_empty: includeEmpty,
      client_search: debouncedClientSearch.trim() || undefined,
      page,
      page_size: GROUP_PAGE_SIZE,
    }),
    [debouncedClientSearch, endYear, includeEmpty, obligationType, page, startYear, status],
  )

  const groupsQuery = useTaxCalendarGroups(params)

  const resetAllFilters = () =>
    resetFilters({
      start_year: String(currentYear),
      end_year: String(currentYear),
    })

  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])
  const groupsSummary = groupsQuery.data?.summary

  return (
    <div className="space-y-4" dir="rtl">
      <PageHeader title="יומן מס" size="lg" />

      <TaxCalendarFiltersBar
        startYear={startYear}
        endYear={endYear}
        obligationType={obligationType}
        status={status}
        onStartYearChange={(value) => setFilter('start_year', value)}
        onEndYearChange={(value) => setFilter('end_year', value)}
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
        summary={groupsSummary}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת יומן המס"
        linkedLabel="לקוחות מקושרים"
        showGroupsCount
        clientSearchText={clientSearchText}
        page={page}
        pageSize={GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setUrlPage}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
