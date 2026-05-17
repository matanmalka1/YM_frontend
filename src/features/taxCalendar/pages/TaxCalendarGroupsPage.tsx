import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaxCalendarFiltersBar } from '../components/TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from '../components/TaxCalendarGroupsContent'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { filterGroupsByStatus, type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'

const currentYear = new Date().getFullYear()

export const TaxCalendarGroupsPage = () => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const [obligationType, setObligationType] = useState('')
  const [includeEmpty, setIncludeEmpty] = useState(false)
  const [status, setStatus] = useState<TaxCalendarGroupStatusFilter>('all')
  const [clientSearchText, setClientSearchText] = useState('')

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      start_year: Number(startYear) || currentYear,
      end_year: Number(endYear) || currentYear,
      obligation_type: obligationType ? (obligationType as TaxCalendarObligationType) : undefined,
      include_empty: includeEmpty,
    }),
    [endYear, includeEmpty, obligationType, startYear],
  )

  const groupsQuery = useTaxCalendarGroups(params)

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear))
    setObligationType('')
    setIncludeEmpty(false)
    setStatus('all')
    setClientSearchText('')
  }

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data])
  const displayedGroups = useMemo(() => filterGroupsByStatus(groups, status), [groups, status])

  return (
    <div className="space-y-4" dir="rtl">
      <PageHeader title="יומן מס" size="lg" />

      <TaxCalendarFiltersBar
        startYear={startYear}
        endYear={endYear}
        obligationType={obligationType}
        status={status}
        onStartYearChange={setStartYear}
        onEndYearChange={setEndYear}
        onObligationTypeChange={setObligationType}
        onStatusChange={setStatus}
        onReset={resetFilters}
        clientSearchText={clientSearchText}
        onClientSearchTextChange={setClientSearchText}
        includeEmpty={includeEmpty}
        onIncludeEmptyChange={setIncludeEmpty}
      />

      <TaxCalendarGroupsContent
        groups={displayedGroups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת יומן המס"
        linkedLabel="לקוחות מקושרים"
        showGroupsCount
        clientSearchText={clientSearchText}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
