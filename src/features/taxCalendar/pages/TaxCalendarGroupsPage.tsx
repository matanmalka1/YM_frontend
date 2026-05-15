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
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_OBLIGATION_LABELS,
  type TaxCalendarGroup,
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'כל המצבים' },
  { value: 'open', label: 'פתוחים' },
  { value: 'overdue', label: 'באיחור' },
  { value: 'done', label: 'הושלמו' },
]

const SummaryStrip = ({ groups }: { groups: TaxCalendarGroup[] }) => {
  const summary = groups.reduce(
    (acc, group) => ({
      groups: acc.groups + 1,
      linked: acc.linked + group.linked_count,
      open: acc.open + group.open_count,
      overdue: acc.overdue + group.overdue_count,
      done: acc.done + group.done_count,
    }),
    { groups: 0, linked: 0, open: 0, overdue: 0, done: 0 },
  )

  const items = [
    { label: 'סה״כ קבוצות', value: summary.groups, className: 'text-gray-900' },
    { label: 'לקוחות מקושרים', value: summary.linked, className: 'text-gray-900' },
    { label: 'פתוחים', value: summary.open, className: 'text-warning-700' },
    { label: 'באיחור', value: summary.overdue, className: 'text-negative-700' },
    { label: 'הושלמו', value: summary.done, className: 'text-positive-700' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-baseline gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
        >
          <span className="text-xs font-medium text-gray-500">{item.label}</span>
          <span className={`font-mono font-semibold tabular-nums ${item.className}`}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export const TaxCalendarGroupsPage = () => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const [obligationType, setObligationType] = useState('')
  const [includeEmpty, setIncludeEmpty] = useState(false)
  const [status, setStatus] = useState('all')
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
  const displayedGroups = useMemo(() => {
    if (status === 'open') return groups.filter((group) => group.open_count > 0)
    if (status === 'overdue') return groups.filter((group) => group.overdue_count > 0)
    if (status === 'done') return groups.filter((group) => group.done_count > 0)
    return groups
  }, [groups, status])

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
            options={OBLIGATION_TYPE_OPTIONS}
          />
          <Select
            label="מצב"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
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

      <SummaryStrip groups={displayedGroups} />

      <TaxCalendarGroupsTable
        groups={displayedGroups}
        isLoading={groupsQuery.isPending}
        clientSearchText={clientSearchText}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
