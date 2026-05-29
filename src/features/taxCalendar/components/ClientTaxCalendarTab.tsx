import { type FC, useMemo } from 'react'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'
import { TaxCalendarFiltersBar } from './TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from './TaxCalendarGroupsContent'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parsePositiveInt } from '@/utils/utils'

interface ClientTaxCalendarTabProps {
  clientId: number
}

const currentYear = new Date().getFullYear()
const GROUP_PAGE_SIZE = 25

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const { searchParams, setFilter, setPage: setUrlPage, resetFilters } = useSearchParamFilters()

  const startYear = searchParams.get('start_year') ?? String(currentYear)
  const endYear = searchParams.get('end_year') ?? String(currentYear)
  const obligationType = searchParams.get('obligation_type') ?? ''
  const status = (searchParams.get('status') as TaxCalendarGroupStatusFilter) || 'all'
  const page = parsePositiveInt(searchParams.get('page'), 1)

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      start_year: Number(startYear) || currentYear,
      end_year: Number(endYear) || currentYear,
      obligation_type: obligationType ? (obligationType as TaxCalendarObligationType) : undefined,
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
      start_year: String(currentYear),
      end_year: String(currentYear),
    })

  return (
    <div className="space-y-4" dir="rtl">
      <TaxCalendarFiltersBar
        startYear={startYear}
        endYear={endYear}
        obligationType={obligationType}
        status={status}
        onStartYearChange={(value) => setFilter('start_year', value, true)}
        onEndYearChange={(value) => setFilter('end_year', value, true)}
        onObligationTypeChange={(value) => setFilter('obligation_type', value, true)}
        onStatusChange={(value) => setFilter('status', value === 'all' ? '' : value, true)}
        onReset={resetAllFilters}
      />

      <TaxCalendarGroupsContent
        groups={groups}
        summary={groupsSummary}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת מועדי המס"
        linkedLabel="מועדים"
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
