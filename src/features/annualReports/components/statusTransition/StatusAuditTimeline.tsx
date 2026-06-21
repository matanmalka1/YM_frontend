import { Clock, ArrowLeft } from 'lucide-react'
import { formatAuditTimestamp } from '../../../../utils/utils'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import type { AnnualReportAuditEntry } from '../../api'
import { getStatusLabel, getStatusVariant } from '../../api'
import { staggerDelay } from '../../../../utils/animation'

interface StatusAuditTimelineProps {
  audit: AnnualReportAuditEntry[]
}

export const StatusAuditTimeline: React.FC<StatusAuditTimelineProps> = ({ audit }) => {
  if (audit.length === 0) {
    return <p className="text-sm text-gray-500">אין רשומות היסטוריה</p>
  }

  const reversed = [...audit].reverse()

  return (
    <Timeline>
      {reversed.map((entry, index) => (
        <TimelineEntry key={entry.id} animationDelay={staggerDelay(index, 40)}>
          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-sm">
            {entry.from_status && (
              <>
                <Badge variant={getStatusVariant(entry.from_status)}>{getStatusLabel(entry.from_status)}</Badge>
                <ArrowLeft className="h-3 w-3 text-gray-400" />
              </>
            )}
            <Badge variant={getStatusVariant(entry.to_status)}>{getStatusLabel(entry.to_status)}</Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">משתמש #{entry.changed_by}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatAuditTimestamp(entry.occurred_at)}
            </div>
          </div>

          {entry.note && <p className="mt-1.5 text-xs text-gray-600 border-t border-gray-100 pt-1.5">{entry.note}</p>}
        </TimelineEntry>
      ))}
    </Timeline>
  )
}
