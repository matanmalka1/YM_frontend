import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { getErrorMessage } from '@/utils/utils'
import { TaxCalendarGroupsTable } from '../components/TaxCalendarGroupsTable'
import { TaxCalendarSummaryStrip } from '../components/TaxCalendarSummaryStrip'
import { TAX_CALENDAR_OBLIGATION_TYPE_OPTIONS, TAX_CALENDAR_STATUS_OPTIONS } from '../constants'
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

      <ToolbarContainer>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
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
          <Input
            label="חיפוש לקוח"
            value={clientSearchText}
            onChange={(event) => setClientSearchText(event.target.value)}
            placeholder="שם או מספר לקוח"
          />
          <div className="flex items-end">
            <Checkbox
              checked={includeEmpty}
              onChange={(event) => setIncludeEmpty(event.target.checked)}
              label="כולל ריקים"
              description="הצג חובות ללא תיקים מקושרים"
              containerClassName="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              איפוס סינון
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {groupsQuery.isError ? (
        <Alert variant="error" message={getErrorMessage(groupsQuery.error, 'שגיאה בטעינת יומן המס')} />
      ) : null}

      <TaxCalendarSummaryStrip groups={displayedGroups} linkedLabel="לקוחות מקושרים" showGroupsCount />

      <TaxCalendarGroupsTable
        groups={displayedGroups}
        isLoading={groupsQuery.isPending}
        clientSearchText={clientSearchText}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
