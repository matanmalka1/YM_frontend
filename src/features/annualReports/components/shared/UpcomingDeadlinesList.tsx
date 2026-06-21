import React from 'react'
import { CalendarClock, CalendarCheck, AlertCircle, Clock } from 'lucide-react'
import type { AnnualReportListItem } from '../../api'
import type { TimelineEventStatus } from '../statusTransition/TimelineEvent'
import { cn, formatDate } from '../../../../utils/utils'
import { STATUS_LABELS } from '../../api'
import { parseAnnualReportCalendarDate } from '../../constants/sharedConstants'
import { getAnnualReportName, getDeadlineStatus } from '../../utils/sharedHelpers'
import { InlineState } from '../../../../components/ui/feedback'
import { Card } from '../../../../components/ui/primitives/Card'

interface Props {
  reports: AnnualReportListItem[]
}

const STATUS_COLORS: Record<TimelineEventStatus, string> = {
  done: 'border-positive-200 bg-positive-50',
  warning: 'border-warning-200 bg-warning-50',
  pending: 'border-gray-200 bg-white',
  overdue: 'border-negative-200 bg-negative-50',
}

const STATUS_ICONS: Record<TimelineEventStatus, React.ReactNode> = {
  done: <CalendarCheck className="h-4 w-4 text-positive-600" />,
  warning: <AlertCircle className="h-4 w-4 text-warning-500" />,
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  overdue: <AlertCircle className="h-4 w-4 text-negative-500" />,
}

export const UpcomingDeadlinesList: React.FC<Props> = ({ reports }) => {
  const upcoming = [...reports]
    .filter((r) => !r.submitted_at && r.filing_deadline)
    .sort(
      (a, b) =>
        (parseAnnualReportCalendarDate(a.filing_deadline)?.getTime() ?? 0) -
        (parseAnnualReportCalendarDate(b.filing_deadline)?.getTime() ?? 0),
    )

  return (
    <Card
      title="מועדי הגשה קרובים"
      icon={<CalendarClock className="h-4 w-4 text-gray-400" />}
      size="compact"
    >
      {upcoming.length === 0 ? (
        <InlineState icon={CalendarCheck} title="אין מועדי הגשה ממתינים" />
      ) : (
        <ul className="space-y-2">
          {upcoming.map((r) => {
            const st = getDeadlineStatus(r)
            return (
              <li key={r.id} className={cn('flex items-center gap-3 rounded-lg border px-4 py-3', STATUS_COLORS[st])}>
                {STATUS_ICONS[st]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getAnnualReportName(r)} — {r.tax_year}
                  </p>
                  <p className="text-xs text-gray-500">{STATUS_LABELS[r.status]}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-600">{formatDate(r.filing_deadline)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

UpcomingDeadlinesList.displayName = 'UpcomingDeadlinesList'
