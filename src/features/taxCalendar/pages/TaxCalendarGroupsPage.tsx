import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { getErrorMessage } from '@/utils/utils'
import { TaxCalendarGroupsTable } from '../components/TaxCalendarGroupsTable'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_OBLIGATION_LABELS,
  type TaxCalendarGroupsParams,
  type TaxCalendarObligationType,
} from '../api'

const currentYear = new Date().getFullYear()

const OBLIGATION_TYPE_OPTIONS = [
  { value: '', label: 'כל סוגי החובות' },
  { value: 'vat', label: TAX_CALENDAR_OBLIGATION_LABELS.vat },
  { value: 'advance_payment', label: TAX_CALENDAR_OBLIGATION_LABELS.advance_payment },
  { value: 'annual_report', label: TAX_CALENDAR_OBLIGATION_LABELS.annual_report },
]

export const TaxCalendarGroupsPage = () => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear + 1))
  const [obligationType, setObligationType] = useState('')
  const [includeEmpty, setIncludeEmpty] = useState(false)

  const params = useMemo<TaxCalendarGroupsParams>(
    () => ({
      start_year: Number(startYear) || currentYear,
      end_year: Number(endYear) || currentYear + 1,
      obligation_type: obligationType ? (obligationType as TaxCalendarObligationType) : undefined,
      include_empty: includeEmpty,
    }),
    [endYear, includeEmpty, obligationType, startYear],
  )

  const groupsQuery = useTaxCalendarGroups(params)

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear + 1))
    setObligationType('')
    setIncludeEmpty(false)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="יומן מס" description="תצוגה מרוכזת לפי חובת דיווח, תקופה ומועד" />

      <Card className="p-4">
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
            options={OBLIGATION_TYPE_OPTIONS}
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
      </Card>

      {groupsQuery.isError ? (
        <Alert variant="error" message={getErrorMessage(groupsQuery.error, 'שגיאה בטעינת יומן המס')} />
      ) : null}

      <TaxCalendarGroupsTable groups={groupsQuery.data ?? []} isLoading={groupsQuery.isPending} />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
