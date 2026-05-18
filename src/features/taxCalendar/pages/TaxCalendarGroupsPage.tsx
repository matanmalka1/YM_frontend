import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaxCalendarFiltersBar } from '../components/TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from '../components/TaxCalendarGroupsContent'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'

const currentYear = new Date().getFullYear()
const GROUP_PAGE_SIZE = 25

export const TaxCalendarGroupsPage = () => {
  const [page, setPage] = useState(1)
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
      status,
      include_empty: includeEmpty,
      client_search: clientSearchText.trim() || undefined,
      page,
      page_size: GROUP_PAGE_SIZE,
    }),
    [clientSearchText, endYear, includeEmpty, obligationType, page, startYear, status],
  )

  const groupsQuery = useTaxCalendarGroups(params)

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear))
    setObligationType('')
    setIncludeEmpty(false)
    setStatus('all')
    setClientSearchText('')
    setPage(1)
  }

  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data])

  return (
    <div className="space-y-4" dir="rtl">
      <PageHeader title="יומן מס" size="lg" />

      <TaxCalendarFiltersBar
        startYear={startYear}
        endYear={endYear}
        obligationType={obligationType}
        status={status}
        onStartYearChange={(value) => {
          setStartYear(value)
          setPage(1)
        }}
        onEndYearChange={(value) => {
          setEndYear(value)
          setPage(1)
        }}
        onObligationTypeChange={(value) => {
          setObligationType(value)
          setPage(1)
        }}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        onReset={resetFilters}
        clientSearchText={clientSearchText}
        onClientSearchTextChange={(value) => {
          setClientSearchText(value)
          setPage(1)
        }}
        includeEmpty={includeEmpty}
        onIncludeEmptyChange={(value) => {
          setIncludeEmpty(value)
          setPage(1)
        }}
      />

      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת יומן המס"
        linkedLabel="לקוחות מקושרים"
        showGroupsCount
        clientSearchText={clientSearchText}
        page={page}
        pageSize={GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
