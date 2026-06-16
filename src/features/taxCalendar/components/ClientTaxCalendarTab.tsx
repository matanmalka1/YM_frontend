import { type FC, useMemo } from 'react'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { parseTaxCalendarGroupStatusFilter, parseTaxCalendarObligationType } from '../utils'
import { type TaxCalendarGroupsParams } from '../api'
import { TaxCalendarFiltersBar } from './TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from './TaxCalendarGroupsContent'
import { TaxCalendarStatsSection } from './TaxCalendarStatsSection'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

interface ClientTaxCalendarTabProps {
  clientId: number
}

const currentYear = new Date().getFullYear()
const GROUP_PAGE_SIZE = 25

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const { searchParams, getParam, getPage, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const startYear = getParam('tax_year_after') || String(currentYear)
  const endYear = getParam('tax_year_before') || String(currentYear)
  const obligationType = parseTaxCalendarObligationType(searchParams.get('obligation_type'))
  const status = parseTaxCalendarGroupStatusFilter(searchParams.get('status'))
  const page = getPage()

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      tax_year_after: Number(startYear) || currentYear,
      tax_year_before: Number(endYear) || currentYear,
      obligation_type: obligationType,
      status,
      client_record_id: clientId,
      page,
      page_size: GROUP_PAGE_SIZE,
    }),
    [clientId, endYear, obligationType, page, startYear, status],
  )

  const groupsQuery = useTaxCalendarGroups(params)
  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])
  const groupsSummary = groupsQuery.data?.summary

  const resetAllFilters = () =>
    resetFilters({
      tax_year_after: String(currentYear),
      tax_year_before: String(currentYear),
    })

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
        onStartYearChange={(value) => setFilter('tax_year_after', value, true)}
        onEndYearChange={(value) => setFilter('tax_year_before', value, true)}
        onObligationTypeChange={(value) => setFilter('obligation_type', value, true)}
        onStatusChange={(value) => setFilter('status', value === 'all' ? '' : value, true)}
        onReset={resetAllFilters}
      />

      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת מועדי המס"
        clientRecordId={clientId}
        page={page}
        pageSize={GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setUrlPage}
      />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
