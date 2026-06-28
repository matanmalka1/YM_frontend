import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Landmark } from 'lucide-react'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup, useTaxCalendarGroups } from '@/features/taxCalendar'
import { formatDate, formatWeekday, getReportingPeriodLabelWithYear } from '@/utils/utils'
import { DASHBOARD_MESSAGES } from '../../messages'

const UPCOMING_DEADLINES_LIMIT = 4

/**
 * Local-midnight epoch for a `YYYY-MM-DD` due date. Parsed in local time (not `new Date(str)`,
 * which is UTC) so it compares correctly against a local start-of-day boundary.
 */
const toLocalDueTime = (value: string): number => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return Number.POSITIVE_INFINITY
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime()
}

const formatObligationTitle = (group: TaxCalendarGroup): string => {
  if (group.obligation_type === 'annual_report') {
    return TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]
  }

  const frequencyLabel =
    group.period_months_count === 2 ? DASHBOARD_MESSAGES.deadlines.bimonthly : DASHBOARD_MESSAGES.deadlines.monthly
  return `${TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]} ${frequencyLabel}`
}

const UpcomingDeadlineRow = ({ group }: { group: TaxCalendarGroup }) => {
  const weekday = formatWeekday(group.effective_due_date_min)
  const Icon = group.obligation_type === 'vat' ? CalendarDays : Landmark
  const countLabel =
    group.obligation_type === 'advance_payment'
      ? DASHBOARD_MESSAGES.deadlines.payments
      : DASHBOARD_MESSAGES.deadlines.reports
  const iconClassName =
    group.obligation_type !== 'vat'
      ? 'bg-positive-50 text-positive-600'
      : group.period_months_count === 2
        ? 'bg-violet-50 text-violet-500'
        : 'bg-primary-50 text-primary-600'

  return (
    <li className="relative grid min-h-[126px] grid-cols-[48px_minmax(0,1fr)] border-b border-slate-100 last:border-b-0">
      <div className="relative flex justify-center pt-4">
        <span className="absolute bottom-0 top-0 left-1/2 w-px -translate-x-1/2 bg-slate-100" />
        <span className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="min-w-0 py-4 text-center">
        <p className="text-md font-bold tabular-nums text-slate-900">{formatDate(group.effective_due_date_min)}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">({weekday})</p>
        <p className="mt-2 truncate text-sm font-bold text-slate-900">{formatObligationTitle(group)}</p>
        <p className="mt-1 truncate text-sm text-slate-400">
          {getReportingPeriodLabelWithYear(group.period, group.period_months_count, group.tax_year)}
        </p>
        <p className="mt-1 truncate text-sm text-slate-400">{`${group.open_count} ${countLabel}`}</p>
      </div>
    </li>
  )
}

export const UpcomingDeadlinesPanel = ({ className = '' }: { className?: string }) => {
  const currentYear = new Date().getFullYear()
  const groupsQuery = useTaxCalendarGroups({
    tax_year_after: currentYear,
    tax_year_before: currentYear + 1,
    include_empty: false,
  })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTodayTime = startOfToday.getTime()

  const groups = (groupsQuery.data?.items ?? [])
    .filter((group) => group.open_count > 0 && toLocalDueTime(group.effective_due_date_min) >= startOfTodayTime)
    .sort((a, b) => toLocalDueTime(a.effective_due_date_min) - toLocalDueTime(b.effective_due_date_min))
    .slice(0, UPCOMING_DEADLINES_LIMIT)

  return (
    <DashboardPanel className={`flex flex-col ${className}`}>
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader title={DASHBOARD_MESSAGES.deadlines.title} icon={CalendarDays} />
      </div>

      <div className="mx-3 mt-3 mb-3 flex-1 overflow-hidden rounded-2xl border border-slate-100">
        {groupsQuery.isPending ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: UPCOMING_DEADLINES_LIMIT }, (_, index) => (
              <SkeletonBlock key={index} height="h-24" width="w-full" rounded="xl" className="rounded-2xl" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <ol>
            {groups.map((group) => (
              <UpcomingDeadlineRow key={group.tax_calendar_entry_id} group={group} />
            ))}
          </ol>
        ) : (
          <InlineState
            title={DASHBOARD_MESSAGES.deadlines.emptyTitle}
            description={DASHBOARD_MESSAGES.deadlines.emptyDescription}
          />
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 text-center">
        <Link
          to="/tax/calendar"
          className="inline-flex items-center justify-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          {DASHBOARD_MESSAGES.deadlines.viewAll}
        </Link>
      </div>
    </DashboardPanel>
  )
}
