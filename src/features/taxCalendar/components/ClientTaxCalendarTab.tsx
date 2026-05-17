import { type FC, useMemo, useState } from 'react'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { filterGroupsByStatus, type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'
import { TaxCalendarFiltersBar } from './TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from './TaxCalendarGroupsContent'

interface ClientTaxCalendarTabProps {
  clientId: number
}

const currentYear = new Date().getFullYear()

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const [obligationType, setObligationType] = useState('')
  const [status, setStatus] = useState<TaxCalendarGroupStatusFilter>('all')

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      start_year: Number(startYear) || currentYear,
      end_year: Number(endYear) || currentYear,
      obligation_type: obligationType ? (obligationType as TaxCalendarObligationType) : undefined,
      client_record_id: clientId,
    }),
    [clientId, endYear, obligationType, startYear],
  )

  const groupsQuery = useTaxCalendarGroups(params)
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data])
  const displayedGroups = useMemo(() => filterGroupsByStatus(groups, status), [groups, status])

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear))
    setObligationType('')
    setStatus('all')
  }

  return (
    <div className="space-y-4" dir="rtl">
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
      />

      <TaxCalendarGroupsContent
        groups={displayedGroups}
        isLoading={groupsQuery.isPending}
        error={groupsQuery.error}
        errorFallback="שגיאה בטעינת מועדי המס"
        linkedLabel="מועדים"
        clientRecordId={clientId}
      />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
