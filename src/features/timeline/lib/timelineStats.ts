import type { NormalizedTimelineEvent, TimelineFilterKey } from '../normalize'

export interface EventTypeStat {
  type: TimelineFilterKey
  count: number
}

export const buildTimelineFilterStats = (events: NormalizedTimelineEvent[]): EventTypeStat[] => {
  const counts: Partial<Record<TimelineFilterKey, number>> = {
    all: events.length,
    past: events.length,
  }
  for (const event of events) {
    for (const key of event.filterKeys) {
      if (key === 'past' || key === 'all') continue
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return Object.entries(counts).map(([type, count]) => ({
    type: type as TimelineFilterKey,
    count: count ?? 0,
  }))
}
