import { type FC, useMemo, useState } from 'react'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'
import { TaxCalendarFiltersBar } from './TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from './TaxCalendarGroupsContent'

interface ClientTaxCalendarTabProps {
  clientId: number
}

const currentYear = new Date().getFullYear()
const GROUP_PAGE_SIZE = 25

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const [page, setPage] = useState(1)
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const [obligationType, setObligationType] = useState('')
  const [status, setStatus] = useState<TaxCalendarGroupStatusFilter>('all')

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

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear))
    setObligationType('')
    setStatus('all')
    setPage(1)
  }

  return (
    <div className="space-y-4" dir="rtl">
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
      />

      <TaxCalendarGroupsContent
        groups={groups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת מועדי המס"
        linkedLabel="מועדים"
        clientRecordId={clientId}
        page={page}
        pageSize={GROUP_PAGE_SIZE}
        total={groupsQuery.data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
