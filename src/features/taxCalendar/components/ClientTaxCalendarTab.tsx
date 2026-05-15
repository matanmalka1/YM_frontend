import { type FC, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { getErrorMessage } from '@/utils/utils'
import { TaxCalendarGroupsTable } from './TaxCalendarGroupsTable'
import { useTaxCalendarGroups } from '../hooks/useTaxCalendarGroups'
import {
  TAX_CALENDAR_OBLIGATION_LABELS,
  type TaxCalendarGroup,
  type TaxCalendarGroupsParams,
  type TaxCalendarObligationType,
} from '../api'

interface ClientTaxCalendarTabProps {
  clientId: number
}

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
      linked: acc.linked + group.linked_count,
      open: acc.open + group.open_count,
      overdue: acc.overdue + group.overdue_count,
      done: acc.done + group.done_count,
    }),
    { linked: 0, open: 0, overdue: 0, done: 0 },
  )

  const items = [
    { label: 'מועדים', value: summary.linked, className: 'text-gray-900' },
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

export const ClientTaxCalendarTab: FC<ClientTaxCalendarTabProps> = ({ clientId }) => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const [obligationType, setObligationType] = useState('')
  const [status, setStatus] = useState('all')

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
  const displayedGroups = useMemo(() => {
    if (status === 'open') return groups.filter((group) => group.open_count > 0)
    if (status === 'overdue') return groups.filter((group) => group.overdue_count > 0)
    if (status === 'done') return groups.filter((group) => group.done_count > 0)
    return groups
  }, [groups, status])

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
            options={OBLIGATION_TYPE_OPTIONS}
          />
          <Select
            label="מצב"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
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

      <SummaryStrip groups={displayedGroups} />

      <TaxCalendarGroupsTable groups={displayedGroups} isLoading={groupsQuery.isPending} clientRecordId={clientId} />
    </div>
  )
}

ClientTaxCalendarTab.displayName = 'ClientTaxCalendarTab'
