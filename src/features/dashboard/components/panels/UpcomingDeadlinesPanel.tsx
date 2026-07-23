import { CalendarDays, Landmark, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup, useTaxCalendarGroups } from '@/features/taxCalendar'
import { formatDate, formatWeekday, getReportingPeriodLabelWithYear } from '@/utils/utils'
import type { IconChipTone } from '@/utils/semanticColors'
import { DASHBOARD_MESSAGES } from '../../messages'

const UPCOMING_DEADLINES_LIMIT = 4

/** Local calendar date as `YYYY-MM-DD` for the server-side `due_after` cutoff. */
const todayIsoDate = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
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
    group.obligation_type === 'advance_payment' ? DASHBOARD_MESSAGES.deadlines.payments : DASHBOARD_MESSAGES.deadlines.reports
  const chipTone: IconChipTone =
    group.obligation_type !== 'vat' ? 'positive' : group.period_months_count === 2 ? 'purple' : 'primary'

  return (
    <li className="flex items-center gap-3.5 rounded-2xl border border-transparent p-3.5 transition-colors hover:border-slate-200/60 hover:bg-slate-50">
      <IconChip icon={Icon} size="lg" tone={chipTone} ring />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="truncate text-sm font-semibold text-slate-900">{formatObligationTitle(group)}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600">
            {group.open_count} {countLabel}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
          {getReportingPeriodLabelWithYear(group.period, group.period_months_count, group.tax_year)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end rounded-xl border border-slate-200/60 bg-slate-50 px-2.5 py-1.5 text-end">
        <span className="text-xs font-bold tabular-nums text-slate-900">{formatDate(group.effective_due_date_min)}</span>
        <span className="text-2xs font-semibold text-slate-400">({weekday})</span>
      </div>
    </li>
  )
}

export const UpcomingDeadlinesPanel = ({ className = '' }: { className?: string }) => {
  const currentYear = new Date().getFullYear()
  // The backend owns "upcoming open, nearest first": status=open + due_after=today + order=due, capped
  // to the limit. The panel just renders what it returns — no client-side filter/sort/slice/TZ math.
  const groupsQuery = useTaxCalendarGroups({
    tax_year_after: currentYear,
    tax_year_before: currentYear + 1,
    include_empty: false,
    status: 'open',
    due_after: todayIsoDate(),
    order: 'due',
    page_size: UPCOMING_DEADLINES_LIMIT,
  })

  const groups = groupsQuery.data?.items ?? []

  return (
    <DashboardPanel className={`flex flex-col ${className}`}>
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader
          title={DASHBOARD_MESSAGES.deadlines.title}
          icon={CalendarDays}
          action={
            <Link
              to="/settings/tax-calendar"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
            >
              <span>{DASHBOARD_MESSAGES.deadlines.viewAll}</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </div>

      <div className="p-3">
        {groupsQuery.isPending ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: UPCOMING_DEADLINES_LIMIT }, (_, index) => (
              <SkeletonBlock key={index} height="h-16" width="w-full" rounded="xl" className="rounded-2xl" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <ol className="space-y-1">
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
    </DashboardPanel>
  )
}

UpcomingDeadlinesPanel.displayName = 'UpcomingDeadlinesPanel'
