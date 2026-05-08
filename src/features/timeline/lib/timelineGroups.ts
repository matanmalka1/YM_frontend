import { format } from 'date-fns'
import type { NormalizedTimelineEvent } from '../normalize'
import { formatDateHeading } from '../utils'

export interface EventGroup {
  date: string
  items: NormalizedTimelineEvent[]
}

export const groupTimelineEventsByDate = (events: NormalizedTimelineEvent[]): EventGroup[] => {
  const groups = new Map<string, NormalizedTimelineEvent[]>()
  for (const event of events) {
    const key = formatDateHeading(event.displayTimestamp)
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }))
}

export const getDefaultOpenTimelineGroups = (groups: EventGroup[]): Set<string> => {
  if (groups.length === 0) return new Set()
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const defaults = new Set(
    groups
      .filter(
        (group) =>
          group.items.some((e) => e.displayTimestamp.slice(0, 10) === todayKey) ||
          group.items.some((e) => e.filterKeys.includes('future')),
      )
      .map((g) => g.date),
  )
  if (defaults.size === 0) defaults.add(groups[0].date)
  return defaults
}
