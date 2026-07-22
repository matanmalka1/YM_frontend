import { CheckCircle2, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { cn, formatDate } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import type { ScheduleEntry, AnnualReportScheduleKey } from '../../api'
import { getScheduleLabel } from '../../constants/display'
import { ANNEX_TEXT } from '../../constants/annexTextConstants'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface AnnexHeaderProps {
  entry: ScheduleEntry
  isExpanded: boolean
  onToggle: () => void
  onComplete: (schedule: AnnualReportScheduleKey) => void
  isCompleting: boolean
}

export const AnnexHeader: React.FC<AnnexHeaderProps> = ({ entry, isExpanded, onToggle, onComplete, isCompleting }) => (
  <div className="flex items-center justify-between gap-3 px-3 py-2">
    <button
      type="button"
      onClick={onToggle}
      className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
      aria-expanded={isExpanded}
    >
      {entry.is_complete ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-positive-600" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-gray-400" />
      )}
      <span className="truncate text-sm font-semibold text-gray-900">{getScheduleLabel(entry.schedule)}</span>
      <Badge variant={entry.is_complete ? 'positive' : 'neutral'} size="2xs">
        {entry.is_complete ? ANNEX_TEXT.completeStatus : ANNEX_TEXT.openStatus}
      </Badge>
      {entry.is_required && (
        <Badge variant="warning" size="2xs">
          {ANNEX_TEXT.required}
        </Badge>
      )}
      {entry.is_complete && entry.completed_at && (
        <span className={cn('hidden text-xs sm:inline', semanticMonoToneClasses.positive)}>
          {ANNUAL_REPORTS_MESSAGES.scheduleChecklist.completedAt(formatDate(entry.completed_at))}
        </span>
      )}
      {entry.notes && <span className="hidden truncate text-xs text-gray-500 md:inline">{entry.notes}</span>}
    </button>

    <div className="flex shrink-0 items-center gap-2">
      {!entry.is_complete && (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => onComplete(entry.schedule as AnnualReportScheduleKey)}
          isLoading={isCompleting}
        >
          {ANNEX_TEXT.complete}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        shape="square"
        onClick={onToggle}
        className="text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        title={isExpanded ? ANNEX_TEXT.close : ANNEX_TEXT.expandData}
        icon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      />
    </div>
  </div>
)

AnnexHeader.displayName = 'AnnexHeader'
