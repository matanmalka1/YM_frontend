import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Landmark } from 'lucide-react'
import { DashboardPanel } from './DashboardPrimitives'
import { InlineEmptyState } from '@/components/ui/feedback/InlineEmptyState'
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup, useTaxCalendarGroups } from '@/features/taxCalendar'
import { formatDate } from '@/utils/utils'

const UPCOMING_DEADLINES_LIMIT = 4

const toDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const toTime = (value: string): number => toDate(value)?.getTime() ?? Number.POSITIVE_INFINITY

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long' })
const monthFormatter = new Intl.DateTimeFormat('he-IL', { month: 'long' })

const formatPeriod = (group: TaxCalendarGroup): string => {
  if (!group.period) return String(group.tax_year)

  const match = /^(\d{4})-(\d{2})$/.exec(group.period)
  if (!match) return group.period

  const year = Number(match[1])
  const month = Number(match[2])
  const monthLabel = monthFormatter.format(new Date(year, month - 1, 1))

  if (group.period_months_count === 2) {
    const startDate = new Date(year, month - 2, 1)
    const startYear = startDate.getFullYear()
    const startMonthLabel = monthFormatter.format(startDate)
    return startYear !== year
      ? `${startMonthLabel} ${startYear}-${monthLabel} ${year}`
      : `${startMonthLabel}-${monthLabel} ${year}`
  }

  return `${monthLabel} ${year}`
}

const formatObligationTitle = (group: TaxCalendarGroup): string => {
  if (group.obligation_type === 'annual_report') {
    return TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]
  }

  const frequencyLabel = group.period_months_count === 2 ? 'דו-חודשי' : 'חודשי'
  return `${TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]} ${frequencyLabel}`
}

const UpcomingDeadlineRow = ({ group }: { group: TaxCalendarGroup }) => {
  const dueDate = toDate(group.effective_due_date_min)
  const Icon = group.obligation_type === 'vat' ? CalendarDays : Landmark
  const countLabel = group.obligation_type === 'advance_payment' ? 'תשלומים' : 'דוחות'
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
        <p className="text-base font-bold tabular-nums text-slate-900">
          {dueDate ? formatDate(group.effective_due_date_min) : group.effective_due_date_min}
        </p>
        {dueDate && <p className="mt-1 text-xs font-semibold text-slate-400">({weekdayFormatter.format(dueDate)})</p>}
        <p className="mt-2 truncate text-sm font-bold text-slate-900">{formatObligationTitle(group)}</p>
        <p className="mt-1 truncate text-sm text-slate-400">{formatPeriod(group)}</p>
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groups = (groupsQuery.data?.items ?? [])
    .filter((group) => {
      const dueDate = toDate(group.effective_due_date_min)
      return group.open_count > 0 && dueDate !== null && dueDate >= today
    })
    .sort((a, b) => toTime(a.effective_due_date_min) - toTime(b.effective_due_date_min))
    .slice(0, UPCOMING_DEADLINES_LIMIT)

  return (
    <DashboardPanel className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">מועדי מס קרובים</h2>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <CalendarDays className="h-4 w-4" />
        </span>
      </div>

      <div className="mx-3 mt-3 mb-3 flex-1 overflow-hidden rounded-2xl border border-slate-100">
        {groupsQuery.isPending ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: UPCOMING_DEADLINES_LIMIT }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <ol>
            {groups.map((group) => (
              <UpcomingDeadlineRow key={group.tax_calendar_entry_id} group={group} />
            ))}
          </ol>
        ) : (
          <InlineEmptyState title="אין מועדים קרובים" description="כל המועדים הפתוחים רחוקים יותר או הושלמו" />
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 text-center">
        <Link
          to="/tax/calendar"
          className="inline-flex items-center justify-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          צפה בכל מועדי המס
        </Link>
      </div>
    </DashboardPanel>
  )
}
