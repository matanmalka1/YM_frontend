import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Landmark } from 'lucide-react'
import { DashboardEmptyState, DashboardPanel } from './DashboardPrimitives'
import { TAX_CALENDAR_OBLIGATION_LABELS, type TaxCalendarGroup, useTaxCalendarGroups } from '@/features/taxCalendar'

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

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
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
  const dueDate = toDate(group.effective_due_date)
  const Icon = group.obligation_type === 'vat' ? CalendarDays : Landmark
  const countLabel = group.obligation_type === 'advance_payment' ? 'תשלומים' : 'דוחות'
  const iconClassName =
    group.obligation_type !== 'vat'
      ? 'bg-emerald-50 text-emerald-700'
      : group.period_months_count === 2
        ? 'bg-purple-50 text-purple-700'
        : 'bg-blue-50 text-blue-700'

  return (
    <li className="relative grid min-h-[126px] grid-cols-[48px_minmax(0,1fr)] border-b border-gray-100 last:border-b-0">
      <div className="relative flex justify-center pt-4">
        <span className="absolute bottom-0 top-0 left-1/2 w-px -translate-x-1/2 bg-gray-200" />
        <span className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="min-w-0 py-4 text-center">
        <p className="text-base font-bold tabular-nums text-gray-950">
          {dueDate ? dateFormatter.format(dueDate).replaceAll('/', '.') : group.effective_due_date}
        </p>
        {dueDate && <p className="mt-1 text-xs font-semibold text-gray-500">({weekdayFormatter.format(dueDate)})</p>}
        <p className="mt-2 truncate text-sm font-bold text-gray-950">{formatObligationTitle(group)}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{formatPeriod(group)}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{`${group.open_count} ${countLabel}`}</p>
      </div>
    </li>
  )
}

export const UpcomingDeadlinesPanel = ({ className = '' }: { className?: string }) => {
  const currentYear = new Date().getFullYear()
  const groupsQuery = useTaxCalendarGroups({
    start_year: currentYear,
    end_year: currentYear + 1,
    include_empty: false,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groups = (groupsQuery.data ?? [])
    .filter((group) => {
      const dueDate = toDate(group.effective_due_date)
      return group.open_count > 0 && dueDate !== null && dueDate >= today
    })
    .sort((a, b) => toTime(a.effective_due_date) - toTime(b.effective_due_date))
    .slice(0, UPCOMING_DEADLINES_LIMIT)

  return (
    <DashboardPanel className={`flex flex-col xl:min-h-[620px] ${className}`}>
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-lg font-bold text-gray-950">מועדי מס קרובים</h2>
        <CalendarDays className="h-5 w-5 text-gray-900" />
      </div>

      <div className="mx-3 mb-3 flex-1 overflow-hidden rounded-xl border border-gray-100">
        {groupsQuery.isPending ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: UPCOMING_DEADLINES_LIMIT }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <ol>
            {groups.map((group) => (
              <UpcomingDeadlineRow key={group.tax_calendar_entry_id} group={group} />
            ))}
          </ol>
        ) : (
          <DashboardEmptyState title="אין מועדים קרובים" description="כל המועדים הפתוחים רחוקים יותר או הושלמו" />
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3 text-center">
        <Link
          to="/tax/calendar"
          className="inline-flex items-center justify-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-900 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          צפה בכל מועדי המס
        </Link>
      </div>
    </DashboardPanel>
  )
}
