import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, ListChecks, Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { cn, formatDate, getErrorMessage, getHttpStatus } from '@/utils/utils'
import { useTaxCalendarSettings } from '../hooks/useTaxCalendarSettings'
import type { TaxCalendarDeadlineRule, TaxCalendarSettingsEntry } from '../api'

const currentYear = new Date().getFullYear()
const MIN_YEAR = 2000
const MAX_YEAR = 2100

const RULE_TYPE_LABELS: Record<string, string> = {
  vat_monthly: 'מע״מ חודשי',
  vat_bimonthly: 'מע״מ דו־חודשי',
  advance_monthly: 'מקדמות חודשיות',
  advance_bimonthly: 'מקדמות דו־חודשיות',
  annual_report: 'דוח שנתי',
}

const OBLIGATION_TYPE_LABELS: Record<string, string> = {
  vat: 'מע״מ',
  advance_payment: 'מקדמות מס הכנסה',
  annual_report: 'דוח שנתי',
}

const SUMMARY_LABELS: Record<string, string> = {
  vat_1m: 'מע״מ חודשי',
  vat_2m: 'מע״מ דו־חודשי',
  advance_payment_1m: 'מקדמות חודשיות',
  advance_payment_2m: 'מקדמות דו־חודשיות',
  annual_report_annual: 'דוח שנתי',
}

const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '—'
  return value.toLocaleString('he-IL')
}

const formatYear = (value: number | null | undefined): string => {
  if (value == null) return '—'
  return String(value)
}

const formatText = (value: string | null | undefined): string => value || '—'

const getRuleTypeLabel = (value: string): string => RULE_TYPE_LABELS[value] ?? value

const getObligationLabel = (value: string): string => OBLIGATION_TYPE_LABELS[value] ?? value

const getYearOptions = () => {
  const nextYear = String(currentYear + 1)
  const options = getOperationalYearOptions()
  if (options.some((option) => option.value === nextYear)) return options
  return [{ value: nextYear, label: nextYear }, ...options]
}

const isForbidden = (...errors: unknown[]): boolean => errors.some((error) => getHttpStatus(error) === 403)

const parseYearInput = (value: string, label: string): { value: number | null; error: string | null } => {
  const trimmed = value.trim()
  if (!trimmed) return { value: null, error: `${label} היא שדה חובה` }

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed)) return { value: null, error: `${label} חייבת להיות שנה תקינה` }
  if (parsed < MIN_YEAR || parsed > MAX_YEAR) {
    return { value: null, error: `${label} חייבת להיות בין ${MIN_YEAR} ל-${MAX_YEAR}` }
  }

  return { value: parsed, error: null }
}

const translateWarning = (warning: string): string => {
  const countWarning = /^Year (\d+): ([\w_]+) — expected (\d+), found (\d+)\.$/.exec(warning)
  if (countWarning) {
    const [, year, key, expected, found] = countWarning
    const label = SUMMARY_LABELS[key] ?? key
    return `שנת ${year}: ${label} — צפויות ${expected} רשומות, נמצאו ${found}.`
  }

  const fallbackWarning =
    /^Year (\d+) uses fallback DeadlineRule dates because official tax calendar registry data is missing\.$/.exec(
      warning,
    )
  if (fallbackWarning) {
    return `שנת ${fallbackWarning[1]} משתמשת בתאריכי ברירת מחדל משום שחסרים נתוני יומן מס רשמיים.`
  }

  return warning
}

type EntryGroup = {
  key: string
  taxYear: number
  obligationType: string
  entries: TaxCalendarSettingsEntry[]
}

const groupEntries = (entries: TaxCalendarSettingsEntry[]): EntryGroup[] => {
  const groups = new Map<string, EntryGroup>()

  entries.forEach((entry) => {
    const key = `${entry.tax_year}-${entry.obligation_type}`
    const group = groups.get(key)
    if (group) {
      group.entries.push(entry)
      return
    }

    groups.set(key, {
      key,
      taxYear: entry.tax_year,
      obligationType: entry.obligation_type,
      entries: [entry],
    })
  })

  return Array.from(groups.values())
    .sort(
      (a, b) =>
        a.taxYear - b.taxYear ||
        getObligationLabel(a.obligationType).localeCompare(getObligationLabel(b.obligationType), 'he'),
    )
    .map((group) => ({
      ...group,
      entries: group.entries.slice().sort((a, b) => {
        const periodCompare = formatText(a.period).localeCompare(formatText(b.period), 'he')
        if (periodCompare !== 0) return periodCompare
        return a.due_date.localeCompare(b.due_date)
      }),
    }))
}

const rulesColumns: Column<TaxCalendarDeadlineRule>[] = [
  {
    key: 'rule_type',
    header: 'סוג כלל',
    render: (rule) => <span className="font-medium text-gray-900">{getRuleTypeLabel(rule.rule_type)}</span>,
  },
  {
    key: 'due_day_of_month',
    header: 'יום בחודש',
    render: (rule) => <span className="font-mono tabular-nums">{formatNumber(rule.due_day_of_month)}</span>,
  },
  {
    key: 'offset_months',
    header: 'היסט חודשים',
    render: (rule) => <span className="font-mono tabular-nums">{formatNumber(rule.offset_months)}</span>,
  },
  {
    key: 'effective_from',
    header: 'בתוקף מ',
    render: (rule) => <span className="font-mono tabular-nums">{formatDate(rule.effective_from)}</span>,
  },
  {
    key: 'effective_to',
    header: 'בתוקף עד',
    render: (rule) => <span className="font-mono tabular-nums">{formatDate(rule.effective_to)}</span>,
  },
]

const groupedEntriesColumns: Column<TaxCalendarSettingsEntry>[] = [
  {
    key: 'period',
    header: 'תקופה',
    render: (entry) => <span className="font-mono tabular-nums">{formatText(entry.period)}</span>,
  },
  {
    key: 'period_months_count',
    header: 'מספר חודשים',
    render: (entry) => <span className="font-mono tabular-nums">{formatNumber(entry.period_months_count)}</span>,
  },
  {
    key: 'due_date',
    header: 'תאריך יעד',
    render: (entry) => <span className="font-mono tabular-nums">{formatDate(entry.due_date)}</span>,
  },
]

export const TaxCalendarSettingsPage = () => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const yearOptions = useMemo(getYearOptions, [])

  const startYearState = useMemo(() => parseYearInput(startYear, 'שנת ההתחלה'), [startYear])
  const endYearState = useMemo(() => parseYearInput(endYear, 'שנת הסיום'), [endYear])
  const hasInvalidRange =
    startYearState.value !== null && endYearState.value !== null && startYearState.value > endYearState.value
  const params = useMemo(() => {
    if (startYearState.value === null || endYearState.value === null || hasInvalidRange) return null
    return {
      tax_year_after: startYearState.value,
      tax_year_before: endYearState.value,
    }
  }, [endYearState.value, hasInvalidRange, startYearState.value])

  const { rulesQuery, entriesQuery, summaryQuery, bootstrapMutation } = useTaxCalendarSettings(params, params !== null)
  const hasForbiddenError = isForbidden(rulesQuery.error, entriesQuery.error, summaryQuery.error)
  const rules = rulesQuery.data ?? []
  const entryGroups = useMemo(() => groupEntries(entriesQuery.data ?? []), [entriesQuery.data])
  const summary = summaryQuery.data
  const warnings = useMemo(() => (summary?.warnings ?? []).map(translateWarning), [summary?.warnings])

  const resetFilters = () => {
    setStartYear(String(currentYear))
    setEndYear(String(currentYear + 1))
  }

  const handleBootstrap = () => {
    if (!params) return
    bootstrapMutation.mutate({
      tax_year_after: params.tax_year_after,
      tax_year_before: params.tax_year_before,
    })
  }

  if (hasForbiddenError) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader title="הגדרות יומן מס" description="צפייה בכללי תאריכי יעד וברשומות יומן מס" />
        <Alert variant="warning" message="גישה להגדרות יומן מס זמינה ליועצים בלבד." />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="הגדרות יומן מס" description="צפייה בכללי תאריכי יעד וברשומות שנוצרו ליומן המס" />

      <ToolbarContainer>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto_auto]">
          <Select
            label="משנת מס"
            value={startYear}
            options={yearOptions}
            onChange={(event) => setStartYear(event.target.value)}
            error={startYearState.error ?? undefined}
          />
          <Select
            label="עד שנת מס"
            value={endYear}
            options={yearOptions}
            onChange={(event) => setEndYear(event.target.value)}
            error={endYearState.error ?? undefined}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              איפוס שנים
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              onClick={handleBootstrap}
              disabled={params === null || hasInvalidRange}
              isLoading={bootstrapMutation.isPending}
              loadingLabel="מאתחל..."
            >
              <Play className="h-4 w-4" />
              אתחול יומן מס
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {hasInvalidRange ? <Alert variant="warning" message="שנת ההתחלה חייבת להיות קטנה או שווה לשנת הסיום." /> : null}
      {!hasInvalidRange && params === null ? (
        <Alert variant="warning" message="יש להזין טווח שנים תקין כדי לטעון תקציר ורשומות יומן מס." />
      ) : null}

      {summaryQuery.isError && !hasInvalidRange ? (
        <Alert variant="error" message={getErrorMessage(summaryQuery.error, 'שגיאה בטעינת תקציר יומן המס')} />
      ) : null}

      <Card className="border-r-4 border-r-primary-500">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">טווח שנים</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-gray-900">
                {formatYear(startYearState.value)}–{formatYear(endYearState.value)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-700">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">רשומות</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-gray-900">
                {summaryQuery.isPending ? '...' : formatNumber(summary?.total_entries ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                warnings.length > 0 ? 'bg-warning-100 text-warning-700' : 'bg-positive-50 text-positive-700',
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">אזהרות</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-gray-900">
                {summaryQuery.isPending ? '...' : formatNumber(warnings.length)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {warnings.length > 0 ? (
        <div className="space-y-2">
          {warnings.map((warning) => (
            <Alert key={warning} variant="warning" message={warning} className="border-warning-300 bg-warning-50" />
          ))}
        </div>
      ) : null}

      {bootstrapMutation.data ? (
        <Alert
          variant={bootstrapMutation.data.warnings.length > 0 ? 'warning' : 'success'}
          message={`אתחול הושלם: ${formatNumber(bootstrapMutation.data.entries_created)} רשומות נוצרו, ${formatNumber(
            bootstrapMutation.data.entries_skipped,
          )} רשומות דולגו, ${formatNumber(bootstrapMutation.data.total_entries_for_range)} רשומות קיימות בטווח.`}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">כללי תאריכי יעד</h2>
        {rulesQuery.isError ? (
          <Alert variant="error" message={getErrorMessage(rulesQuery.error, 'שגיאה בטעינת כללי יומן המס')} />
        ) : null}
        <DataTable
          data={rules}
          columns={rulesColumns}
          getRowKey={(rule) => rule.id}
          isLoading={rulesQuery.isPending}
          emptyState={{
            title: 'אין כללים להצגה',
            message: 'לא נמצאו כללי תאריכי יעד.',
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">רשומות יומן מס</h2>
        {entriesQuery.isError ? (
          <Alert variant="error" message={getErrorMessage(entriesQuery.error, 'שגיאה בטעינת רשומות יומן המס')} />
        ) : null}
        {entriesQuery.isPending ? (
          <DataTable data={[]} columns={groupedEntriesColumns} getRowKey={(entry) => entry.id} isLoading />
        ) : entryGroups.length === 0 ? (
          <DataTable
            data={[]}
            columns={groupedEntriesColumns}
            getRowKey={(entry) => entry.id}
            emptyState={{
              title: 'אין רשומות להצגה',
              message: 'לא נמצאו רשומות יומן מס בטווח השנים שנבחר.',
            }}
          />
        ) : (
          <div className="space-y-5">
            {Array.from(new Set(entryGroups.map((group) => group.taxYear))).map((taxYear) => (
              <div key={taxYear} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">שנת מס {formatYear(taxYear)}</h3>
                {entryGroups
                  .filter((group) => group.taxYear === taxYear)
                  .map((group) => (
                    <div key={group.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getObligationLabel(group.obligationType)}
                        </h4>
                        <span className="text-xs font-medium text-gray-500">
                          {formatNumber(group.entries.length)} רשומות
                        </span>
                      </div>
                      <DataTable data={group.entries} columns={groupedEntriesColumns} getRowKey={(entry) => entry.id} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

TaxCalendarSettingsPage.displayName = 'TaxCalendarSettingsPage'
