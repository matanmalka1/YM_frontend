import { CreditCard, FileText } from 'lucide-react'
import type { NormalizedTimelineEvent } from '../normalize'
import { cn } from '@/utils/utils'
import { getEventColor } from '../constants'
import { formatTimelineDate, formatTimestamp, getEventIcon } from '../utils'
import { TIMELINE_MESSAGES } from '../messages'
import { TimelineMetadata } from './TimelineMetadata'

const IconLabel: React.FC<{ icon: React.ReactNode; label: string; className?: string }> = ({
  icon,
  label,
  className,
}) => (
  <span className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-2xs', className)}>
    {icon}
    <span>{label}</span>
  </span>
)

// ── Related IDs ───────────────────────────────────────────────────────────────

const RelatedIds: React.FC<{
  binderId: number | null
  chargeId: number | null
  relatedEntity: string | null
}> = ({ binderId, chargeId, relatedEntity }) => {
  if (!binderId && !chargeId && !relatedEntity) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {binderId != null && (
        <IconLabel
          icon={<FileText className="h-3 w-3" />}
          label={TIMELINE_MESSAGES.eventItem.binderLabel(binderId)}
          className="bg-slate-50 text-slate-600 border-slate-200"
        />
      )}
      {chargeId != null && (
        <IconLabel
          icon={<CreditCard className="h-3 w-3" />}
          label={TIMELINE_MESSAGES.eventItem.chargeLabel(chargeId)}
          className="bg-warning-50 text-warning-700 border-warning-200"
        />
      )}
      {binderId == null && chargeId == null && relatedEntity && (
        <IconLabel
          icon={<FileText className="h-3 w-3" />}
          label={relatedEntity}
          className="bg-slate-50 text-slate-600 border-slate-200"
        />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TimelineEventItemProps {
  timelineEvent: NormalizedTimelineEvent
  index: number
  isLast: boolean
}

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ timelineEvent: ev, isLast }) => {
  const colors = getEventColor(ev.event_type)
  const displayDate = ev.isDateOnly ? formatTimelineDate(ev.displayTimestamp) : formatTimestamp(ev.displayTimestamp)
  const isQuiet = ev.importance === 'quiet'

  return (
    <li className="relative flex gap-3 animate-fade-in">
      {/* Connector rail */}
      <div className="relative flex w-7 flex-shrink-0 flex-col items-center">
        <span
          className={cn(
            'z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white',
            isQuiet ? 'border-gray-200 text-gray-400' : cn(colors.dotBorder, colors.iconColor),
          )}
        >
          {getEventIcon(ev.event_type)}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'mb-3 flex-1 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 space-y-1.5',
          'transition-shadow duration-150 hover:shadow-elevation-1',
          isQuiet && 'bg-gray-50/60',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm font-semibold', isQuiet ? 'text-gray-500' : 'text-gray-900')}>{ev.title}</span>

          <time dateTime={ev.displayTimestamp} className="text-2xs text-gray-400 tabular-nums flex-shrink-0">
            {displayDate}
          </time>
        </div>

        {ev.secondary && (
          <p className={cn('text-xs leading-snug', isQuiet ? 'text-gray-400' : 'text-gray-600')}>{ev.secondary}</p>
        )}

        <RelatedIds binderId={ev.binder_id} chargeId={ev.charge_id} relatedEntity={ev.relatedEntity} />

        {ev.metadata && <TimelineMetadata metadata={ev.metadata} eventType={ev.event_type} />}
      </div>
    </li>
  )
}

TimelineEventItem.displayName = 'TimelineEventItem'
