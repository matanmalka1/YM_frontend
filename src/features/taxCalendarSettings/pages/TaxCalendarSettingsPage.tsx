import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { formatCount, formatDate, getErrorMessage, getHttpStatus } from '@/utils/utils'
import { useTaxCalendarSettings } from '../hooks/useTaxCalendarSettings'
import { TaxCalendarSettingsStatsSection } from '../components/TaxCalendarSettingsStatsSection'
import type { TaxCalendarDeadlineRule, TaxCalendarSettingsEntry } from '../api'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'
import { TAX_CALENDAR_SETTINGS_ERROR_MESSAGES } from '../errorMessages'

const currentYear = new Date().getFullYear()
const MIN_YEAR = 2000
const MAX_YEAR = 2100

const RULE_TYPE_LABELS: Record<string, string> = {
  vat_monthly: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.vatMonthly,
  vat_bimonthly: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.vatBimonthly,
  advance_monthly: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.advanceMonthly,
  advance_bimonthly: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.advanceBimonthly,
  annual_report: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.annualReport,
}

const OBLIGATION_TYPE_LABELS: Record<string, string> = {
  vat: TAX_CALENDAR_SETTINGS_MESSAGES.obligationTypes.vat,
  advance_payment: TAX_CALENDAR_SETTINGS_MESSAGES.obligationTypes.advancePayment,
  annual_report: TAX_CALENDAR_SETTINGS_MESSAGES.obligationTypes.annualReport,
}

const SUMMARY_LABELS: Record<string, string> = {
  vat_1m: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.vatMonthly,
  vat_2m: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.vatBimonthly,
  advance_payment_1m: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.advanceMonthly,
  advance_payment_2m: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.advanceBimonthly,
  annual_report_annual: TAX_CALENDAR_SETTINGS_MESSAGES.ruleTypes.annualReport,
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
  if (!trimmed) return { value: null, error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.required(label) }

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed))
    return { value: null, error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidYear(label) }
  if (parsed < MIN_YEAR || parsed > MAX_YEAR) {
    return { value: null, error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.yearRange(label, MIN_YEAR, MAX_YEAR) }
  }

  return { value: parsed, error: null }
}

const translateWarning = (warning: string): string => {
  const countWarning = /^Year (\d+): ([\w_]+) — expected (\d+), found (\d+)\.$/.exec(warning)
  if (countWarning) {
    const [, year, key, expected, found] = countWarning
    const label = SUMMARY_LABELS[key] ?? key
    return TAX_CALENDAR_SETTINGS_MESSAGES.warnings.countMismatch(year, label, expected, found)
  }

  const fallbackWarning =
    /^Year (\d+) uses fallback DeadlineRule dates because official tax calendar registry data is missing\.$/.exec(
      warning,
    )
  if (fallbackWarning) {
    return TAX_CALENDAR_SETTINGS_MESSAGES.warnings.fallbackDates(fallbackWarning[1])
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
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.ruleType,
    render: (rule) => <span className="font-medium text-gray-900">{getRuleTypeLabel(rule.rule_type)}</span>,
  },
  {
    key: 'due_day_of_month',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.dueDayOfMonth,
    render: (rule) => <span className="font-mono tabular-nums">{formatCount(rule.due_day_of_month)}</span>,
  },
  {
    key: 'offset_months',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.offsetMonths,
    render: (rule) => <span className="font-mono tabular-nums">{formatCount(rule.offset_months)}</span>,
  },
  {
    key: 'effective_from',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.effectiveFrom,
    render: (rule) => <span className="font-mono tabular-nums">{formatDate(rule.effective_from)}</span>,
  },
  {
    key: 'effective_to',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.effectiveTo,
    render: (rule) => <span className="font-mono tabular-nums">{formatDate(rule.effective_to)}</span>,
  },
]

const groupedEntriesColumns: Column<TaxCalendarSettingsEntry>[] = [
  {
    key: 'period',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.period,
    render: (entry) => <span className="font-mono tabular-nums">{formatText(entry.period)}</span>,
  },
  {
    key: 'period_months_count',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.periodMonthsCount,
    render: (entry) => <span className="font-mono tabular-nums">{formatCount(entry.period_months_count)}</span>,
  },
  {
    key: 'due_date',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.dueDate,
    render: (entry) => <span className="font-mono tabular-nums">{formatDate(entry.due_date)}</span>,
  },
]

export const TaxCalendarSettingsPage = () => {
  const [startYear, setStartYear] = useState(String(currentYear))
  const [endYear, setEndYear] = useState(String(currentYear))
  const yearOptions = useMemo(getYearOptions, [])

  const startYearState = useMemo(
    () => parseYearInput(startYear, TAX_CALENDAR_SETTINGS_MESSAGES.labels.startYear),
    [startYear],
  )
  const endYearState = useMemo(() => parseYearInput(endYear, TAX_CALENDAR_SETTINGS_MESSAGES.labels.endYear), [endYear])
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
      <PageContent>
        <PageHeader
          title={TAX_CALENDAR_SETTINGS_MESSAGES.labels.pageTitle}
          description={TAX_CALENDAR_SETTINGS_MESSAGES.labels.limitedAccessDescription}
        />
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_MESSAGES.labels.accessDenied} />
      </PageContent>
    )
  }

  return (
    <PageContent>
      <PageHeader
        title={TAX_CALENDAR_SETTINGS_MESSAGES.labels.pageTitle}
        description={TAX_CALENDAR_SETTINGS_MESSAGES.labels.description}
      />

      <ToolbarContainer>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto_auto]">
          <Select
            label={TAX_CALENDAR_SETTINGS_MESSAGES.labels.startYearField}
            value={startYear}
            options={yearOptions}
            onChange={(event) => setStartYear(event.target.value)}
            error={startYearState.error ?? undefined}
          />
          <Select
            label={TAX_CALENDAR_SETTINGS_MESSAGES.labels.endYearField}
            value={endYear}
            options={yearOptions}
            onChange={(event) => setEndYear(event.target.value)}
            error={endYearState.error ?? undefined}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              {TAX_CALENDAR_SETTINGS_MESSAGES.labels.resetYears}
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              size="sm"
              icon={<Play className="h-4 w-4" />}
              onClick={handleBootstrap}
              disabled={params === null || hasInvalidRange}
              isLoading={bootstrapMutation.isPending}
              loadingLabel={TAX_CALENDAR_SETTINGS_MESSAGES.labels.initializing}
            >
              {TAX_CALENDAR_SETTINGS_MESSAGES.labels.initializeCalendar}
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {hasInvalidRange ? (
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidRange} />
      ) : null}
      {!hasInvalidRange && params === null ? (
        <Alert variant="warning" message={TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidRangeToLoad} />
      ) : null}

      {summaryQuery.isError && !hasInvalidRange ? (
        <Alert
          variant="error"
            message={getErrorMessage(summaryQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.summary)}
        />
      ) : null}

      <TaxCalendarSettingsStatsSection
        yearRange={`${formatYear(startYearState.value)}–${formatYear(endYearState.value)}`}
        totalEntries={summary?.total_entries ?? 0}
        warningsCount={warnings.length}
        isLoading={summaryQuery.isPending}
      />

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
          message={TAX_CALENDAR_SETTINGS_MESSAGES.bootstrap.complete(
            formatCount(bootstrapMutation.data.entries_created),
            formatCount(bootstrapMutation.data.entries_skipped),
            formatCount(bootstrapMutation.data.total_entries_for_range),
          )}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">
          {TAX_CALENDAR_SETTINGS_MESSAGES.labels.deadlineRulesTitle}
        </h2>
        {rulesQuery.isError ? (
          <Alert
            variant="error"
            message={getErrorMessage(rulesQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.rules)}
          />
        ) : null}
        <DataTable
          data={rules}
          columns={rulesColumns}
          getRowKey={(rule) => rule.id}
          isLoading={rulesQuery.isPending}
          emptyState={{
            title: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noRulesTitle,
            message: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noRulesMessage,
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">
          {TAX_CALENDAR_SETTINGS_MESSAGES.labels.calendarEntriesTitle}
        </h2>
        {entriesQuery.isError ? (
          <Alert
            variant="error"
            message={getErrorMessage(entriesQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.entries)}
          />
        ) : null}
        {entriesQuery.isPending || entryGroups.length === 0 ? (
          <DataTable
            data={[]}
            columns={groupedEntriesColumns}
            getRowKey={(entry) => entry.id}
            isLoading={entriesQuery.isPending}
            emptyState={{
              title: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noEntriesTitle,
              message: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noEntriesMessage,
            }}
          />
        ) : (
          <div className="space-y-5">
            {Array.from(new Set(entryGroups.map((group) => group.taxYear))).map((taxYear) => (
              <div key={taxYear} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  {TAX_CALENDAR_SETTINGS_MESSAGES.labels.taxYear(formatYear(taxYear))}
                </h3>
                {entryGroups
                  .filter((group) => group.taxYear === taxYear)
                  .map((group) => (
                    <div key={group.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getObligationLabel(group.obligationType)}
                        </h4>
                        <span className="text-xs font-medium text-gray-500">
                          {TAX_CALENDAR_SETTINGS_MESSAGES.labels.entriesCount(formatCount(group.entries.length))}
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
    </PageContent>
  )
}

TaxCalendarSettingsPage.displayName = 'TaxCalendarSettingsPage'
