import { useMemo } from 'react'
import { ChevronDown, InboxIcon } from 'lucide-react'
import type { NormalizedTimelineEvent } from '../normalize'
import { TimelineEventItem } from './TimelineEventItem'
import { Button } from '../../../components/ui/primitives/Button'
import { cn } from '../../../utils/utils'
import { groupTimelineEventsByDate } from '../lib/timelineGroups'

// ── Empty state ───────────────────────────────────────────────────────────────

interface EmptyTimelineProps {
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}

const EmptyTimeline: React.FC<EmptyTimelineProps> = ({ hasActiveFilters, onClearFilters }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center animate-fade-in">
    <div className="rounded-full bg-gray-100 p-4">
      <InboxIcon className="h-7 w-7 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-500">
      {hasActiveFilters ? 'אין אירועים התואמים לסינון' : 'אין אירועים בציר הזמן'}
    </p>
    {hasActiveFilters ? (
      <Button type="button" variant="outline" size="sm" onClick={onClearFilters} className="text-xs">
        נקה סינון
      </Button>
    ) : (
      <p className="text-xs text-gray-400">אירועים חדשים יופיעו כאן לאחר פעילות לקוח</p>
    )}
  </div>
)

// ── Date group header ─────────────────────────────────────────────────────────

interface GroupHeaderProps {
  date: string
  count: number
  isFirst: boolean
  expanded: boolean
  controlsId: string
  onToggle: () => void
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ date, count, isFirst, expanded, controlsId, onToggle }) => (
  <div className={cn('flex items-center gap-2 px-1 py-1', !isFirst && 'mt-2')}>
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controlsId}
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-200/70 focus:outline-none focus:ring-2 focus:ring-primary-300"
    >
      <ChevronDown className={cn('h-3 w-3 text-slate-400 transition-transform', !expanded && '-rotate-90')} />
      {date}
      <span className="text-slate-400 font-normal">· {count}</span>
    </button>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────

export interface TimelineCardProps {
  events: NormalizedTimelineEvent[]
  expandedDateKeys: Set<string>
  onToggleDate: (dateKey: string) => void
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  events,
  expandedDateKeys,
  onToggleDate,
  hasActiveFilters,
  onClearFilters,
}) => {
  const groups = useMemo(() => groupTimelineEventsByDate(events), [events])

  if (events.length === 0) return <EmptyTimeline hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />

  return (
    <div className="space-y-1 animate-fade-in">
      {groups.map((group, groupIndex) => {
        const expanded = expandedDateKeys.has(group.date)
        const controlsId = `timeline-date-${groupIndex}`

        return (
          <section key={group.date}>
            <GroupHeader
              date={group.date}
              count={group.items.length}
              isFirst={groupIndex === 0}
              expanded={expanded}
              controlsId={controlsId}
              onToggle={() => onToggleDate(group.date)}
            />

            {expanded && (
              <ul id={controlsId} className="pt-1">
                {group.items.map((event, index) => (
                  <TimelineEventItem
                    key={`${event.timestamp}-${event.event_type}-${index}`}
                    timelineEvent={event}
                    index={index + groupIndex * 1000}
                    isLast={index === group.items.length - 1}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

TimelineCard.displayName = 'TimelineCard'
