import { Alert } from '@/components/ui/overlays/Alert'
import { DataTable, type Column } from '@/components/ui/table'
import { formatCount, formatDate } from '@/utils/utils'
import type { TaxCalendarDeadlineRule, TaxCalendarSettingsEntry } from '../api'
import { TAX_CALENDAR_DEADLINE_RULE_TYPE_LABELS } from '../constants'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'
import { getTaxCalendarObligationLabel, type TaxCalendarEntryGroup } from '../utils/settings'

const ruleColumns: Column<TaxCalendarDeadlineRule>[] = [
  {
    key: 'rule_type',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.ruleType,
    render: (rule) => (
      <span className="font-semibold text-gray-900">
        {TAX_CALENDAR_DEADLINE_RULE_TYPE_LABELS[rule.rule_type as keyof typeof TAX_CALENDAR_DEADLINE_RULE_TYPE_LABELS] ??
          rule.rule_type}
      </span>
    ),
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

const entryColumns: Column<TaxCalendarSettingsEntry>[] = [
  {
    key: 'period',
    header: TAX_CALENDAR_SETTINGS_MESSAGES.columns.period,
    render: (entry) => <span className="font-mono tabular-nums">{entry.period || '—'}</span>,
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

export const TaxCalendarRulesTable = ({
  rules,
  isLoading,
  error,
}: {
  rules: TaxCalendarDeadlineRule[]
  isLoading: boolean
  error: string | null
}) => (
  <section className="space-y-3">
    <h2 className="text-base font-semibold text-gray-900">{TAX_CALENDAR_SETTINGS_MESSAGES.labels.deadlineRulesTitle}</h2>
    {error ? (
      <Alert variant="error" message={error} />
    ) : (
      <DataTable
        data={rules}
        columns={ruleColumns}
        getRowKey={(rule) => rule.id}
        isLoading={isLoading}
        emptyState={{
          title: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noRulesTitle,
          message: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noRulesMessage,
        }}
      />
    )}
  </section>
)

export const TaxCalendarEntriesTables = ({
  groups,
  isLoading,
  error,
}: {
  groups: TaxCalendarEntryGroup[]
  isLoading: boolean
  error: string | null
}) => (
  <section className="space-y-3">
    <h2 className="text-base font-semibold text-gray-900">{TAX_CALENDAR_SETTINGS_MESSAGES.labels.calendarEntriesTitle}</h2>
    {error ? (
      <Alert variant="error" message={error} />
    ) : isLoading || groups.length === 0 ? (
      <DataTable
        data={[]}
        columns={entryColumns}
        getRowKey={(entry) => entry.id}
        isLoading={isLoading}
        emptyState={{
          title: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noEntriesTitle,
          message: TAX_CALENDAR_SETTINGS_MESSAGES.emptyStates.noEntriesMessage,
        }}
      />
    ) : (
      <div className="space-y-5">
        {[...new Set(groups.map((group) => group.taxYear))].map((taxYear) => (
          <div key={taxYear} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {TAX_CALENDAR_SETTINGS_MESSAGES.labels.taxYear(String(taxYear))}
            </h3>
            {groups
              .filter((group) => group.taxYear === taxYear)
              .map((group) => (
                <div key={group.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{getTaxCalendarObligationLabel(group.obligationType)}</h4>
                    <span className="text-xs font-medium text-gray-500">
                      {TAX_CALENDAR_SETTINGS_MESSAGES.labels.entriesCount(formatCount(group.entries.length))}
                    </span>
                  </div>
                  <DataTable data={group.entries} columns={entryColumns} getRowKey={(entry) => entry.id} />
                </div>
              ))}
          </div>
        ))}
      </div>
    )}
  </section>
)
