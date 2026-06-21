import React from 'react'
import { CalendarCheck } from 'lucide-react'
import type { AnnualReportListItem } from '../../api'
import { TimelineEvent } from '../statusTransition/TimelineEvent'
import { Card } from '../../../../components/ui/primitives/Card'
import { ProgressBar } from '../../../../components/ui/primitives/ProgressBar'
import { UpcomingDeadlinesList } from './UpcomingDeadlinesList'
import { buildTimelineEvents, getFilingStats } from '../../utils/sharedHelpers'

interface Props {
  reports: AnnualReportListItem[]
}

interface ProgressRowProps {
  label: string
  count: number
  pct: number
  color: string
}

const ProgressRow: React.FC<ProgressRowProps> = ({ label, count, pct, color }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
      <span className="font-medium">{label}</span>
      <span className="text-gray-400">
        {count} ({pct}%)
      </span>
    </div>
    <ProgressBar value={pct} fillClassName={color} />
  </div>
)

export const FilingTimelineTab: React.FC<Props> = ({ reports }) => {
  const timelineEvents = buildTimelineEvents(reports)
  const filingStats = getFilingStats(reports)

  return (
    <div dir="rtl" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <UpcomingDeadlinesList reports={reports} />
        <Card title="סטטוס הגשות" size="compact">
          <div className="space-y-4">
            {filingStats.map((stat) => (
              <ProgressRow key={stat.label} {...stat} />
            ))}
          </div>
        </Card>
      </div>

      <Card title="היסטוריית אירועים" icon={<CalendarCheck className="h-4 w-4 text-gray-400" />} size="compact">
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
      </Card>
    </div>
  )
}

FilingTimelineTab.displayName = 'FilingTimelineTab'
