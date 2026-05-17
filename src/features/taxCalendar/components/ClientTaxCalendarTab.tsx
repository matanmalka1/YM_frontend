import { type FC, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { getErrorMessage } from '@/utils/utils'
import { TaxCalendarGroupsTable } from './TaxCalendarGroupsTable'
import { TaxCalendarSummaryStrip } from './TaxCalendarSummaryStrip'
import { TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS, TAX_CALENDAR_STATUS_OPTIONS } from '../constants'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import { filterGroupsByStatus, type TaxCalendarGroupStatusFilter } from '../utils'
import { type TaxCalendarGroupsParams, type TaxCalendarObligationType } from '../api'

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
      <ToolbarContainer>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            type="number"
            label="משנת מס"
            min={2000}
            max={2100}
            value={startYear}
            onChange={(event) => setStartYear(event.target.value)}
          />
          <Input
            type="number"
            label="עד שנת מס"
            min={2000}
            max={2100}
            value={endYear}
            onChange={(event) => setEndYear(event.target.value)}
          />
          <Select
            label="סוג חובה"
            value={obligationType}
            onChange={(event) => setObligationType(event.target.value)}
            options={TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS}
          />
          <Select
            label="מצב"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaxCalendarGroupStatusFilter)}
            options={TAX_CALENDAR_STATUS_OPTIONS}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              איפוס סינון
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {groupsQuery.isError ? (
        <Alert variant="error" message={getErrorMessage(groupsQuery.error, 'שגיאה בטעינת מועדי המס')} />
      ) : null}

      <TaxCalendarSummaryStrip groups={displayedGroups} linkedLabel="מועדים" />

      <TaxCalendarGroupsTable groups={displayedGroups} isLoading={groupsQuery.isPending} clientRecordId={clientId} />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
