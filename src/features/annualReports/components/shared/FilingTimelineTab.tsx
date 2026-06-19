import React from 'react'
import { CalendarCheck } from 'lucide-react'
import type { AnnualReportListItem } from '../../api'
import { TimelineEvent } from '../statusTransition/TimelineEvent'
import { cn } from '../../../../utils/utils'
import { UpcomingDeadlinesList } from './UpcomingDeadlinesList'
import { buildTimelineEvents, getFilingStats } from '../../utils/sharedHelpers'

interface Props {
  reports: AnnualReportListItem[]
}

interface ProgressBarProps {
  label: string
  count: number
  pct: number
  color: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, count, pct, color }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
      <span className="font-medium">{label}</span>
      <span className="text-gray-400">
        {count} ({pct}%)
      </span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  </div>
)

export const FilingTimelineTab: React.FC<Props> = ({ reports }) => {
  const timelineEvents = buildTimelineEvents(reports)
  const filingStats = getFilingStats(reports)

  return (
    <div dir="rtl" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <UpcomingDeadlinesList reports={reports} />
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">סטטוס הגשות</h3>
          <div className="space-y-4">
            {filingStats.map((stat) => (
              <ProgressBar key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
          <CalendarCheck className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">היסטוריית אירועים</h3>
        </div>
        <div className="p-4">
          {timelineEvents.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">אין אירועים להצגה</p>
          ) : (
            <div>
              {timelineEvents.map((ev) => (
                <TimelineEvent
                  key={`${ev.title}-${ev.date}`}
                  title={ev.title}
                  description={ev.description}
                  date={ev.date}
                  status={ev.status}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

FilingTimelineTab.displayName = 'FilingTimelineTab'
