import { useState } from 'react'
import { cn } from '../../../../utils/utils'
import type { ScheduleEntry, AnnualReportScheduleKey } from '../../api'
import { getScheduleLabel } from '../../constants/display'
import { AnnexHeader } from './AnnexHeader'
import { AnnexDataPanel } from './AnnexDataPanel'

interface AnnexCardProps {
  reportId: number
  entry: ScheduleEntry
  onComplete: (schedule: AnnualReportScheduleKey) => void
  isCompleting: boolean
}

export const AnnexCard: React.FC<AnnexCardProps> = ({ reportId, entry, onComplete, isCompleting }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <li
      className={cn(
        'overflow-hidden rounded-lg border transition-colors',
        entry.is_complete ? 'border-positive-200 bg-positive-50/40' : 'border-gray-200 bg-white hover:border-gray-300',
      )}
    >
      <AnnexHeader
        entry={entry}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
        onComplete={onComplete}
        isCompleting={isCompleting}
      />

      {isExpanded && (
        <div className="border-t border-gray-100 bg-white/70 px-3 py-3">
          <AnnexDataPanel
            reportId={reportId}
            schedule={entry.schedule as AnnualReportScheduleKey}
            scheduleLabel={getScheduleLabel(entry.schedule)}
          />
        </div>
      )}
    </li>
  )
}

AnnexCard.displayName = 'AnnexCard'
