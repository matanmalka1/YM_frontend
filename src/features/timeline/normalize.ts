import { parseISO } from 'date-fns'
import { mapActions } from '@/lib/actions/mapActions'
import type { ActionCommand } from '@/lib/actions/types'
import type { TimelineEvent, TimelineEventMetadata } from './api'
import { getTimelineStatusLabel, getTimelineTriggerLabel } from './labels'
import { getEventTypeLabel } from './utils'

export type TimelineFilterKey =
  | 'all'
  | 'past'
  | 'future'
  | 'finance'
  | 'binders'
  | 'documents'
  | 'tax'
  | 'communication'

export interface NormalizedTimelineEvent extends TimelineEvent {
  title: string
  secondary: string | null
  displayTimestamp: string
  isDateOnly: boolean
  filterKeys: TimelineFilterKey[]
  importance: 'strong' | 'quiet'
  relatedEntity: string | null
  actionsList: ActionCommand[]
}

const FILTER_BY_EVENT_TYPE: Record<string, TimelineFilterKey[]> = {
  charge_created: ['past', 'finance'],
  charge_issued: ['past', 'finance'],
  charge_paid: ['past', 'finance'],
  invoice_created: ['past', 'finance'],
  invoice_attached: ['past', 'finance'],
  binder_received: ['past', 'binders'],
  binder_returned: ['past', 'binders'],
  binder_status_change: ['past', 'binders'],
  document_uploaded: ['past', 'documents'],
  annual_report_status_changed: ['past', 'tax'],
  reminder_created: ['past', 'communication'],
  notification: ['past', 'communication'],
  notification_sent: ['past', 'communication'],
  signature_request_created: ['past', 'communication', 'documents'],
}

const STRONG_EVENTS = new Set([
  'charge_created',
  'charge_issued',
  'charge_paid',
  'annual_report_status_changed',
  'signature_request_created',
  'binder_status_change',
  'document_uploaded',
])

const getMetadataString = (metadata: TimelineEventMetadata | null | undefined, keys: string[]): string | null => {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

const shouldHideEvent = (event: TimelineEvent): boolean =>
  event.event_type === 'binder_status_change' &&
  event.metadata?.old_status != null &&
  event.metadata?.new_status != null &&
  event.metadata.old_status === event.metadata.new_status

const getRelatedEntity = (event: TimelineEvent): string | null => {
  if (event.charge_id != null) return `חיוב #${event.charge_id}`
  if (event.binder_id != null) return `קלסר #${event.binder_id}`
  const documentName = getMetadataString(event.metadata, ['document_name', 'filename'])
  if (documentName) return `מסמך ${documentName}`
  const reportYear = event.metadata?.report_year
  if (reportYear != null) return `דוח שנתי ${String(reportYear)}`
  return null
}

const buildTitle = (event: TimelineEvent, groupedCount?: number): string => {
  if (event.event_type === 'reminder_created' && groupedCount && groupedCount > 1) {
    return `נוצרו ${groupedCount} תזכורות`
  }
  return getEventTypeLabel(event.event_type)
}

const buildSecondary = (event: TimelineEvent, groupedCount?: number): string | null => {
  if (event.event_type === 'binder_status_change') {
    const oldLabel = getTimelineStatusLabel(String(event.metadata?.old_status ?? ''))
    const newLabel = getTimelineStatusLabel(String(event.metadata?.new_status ?? ''))
    return `${oldLabel} ← ${newLabel}`
  }
  if (event.event_type === 'reminder_created' && groupedCount && groupedCount > 1) {
    const trigger = event.metadata?.trigger ? getTimelineTriggerLabel(String(event.metadata.trigger)) : null
    return trigger ? `סוג תזכורת: ${trigger}` : null
  }
  return event.description || null
}

const normalizeEvent = (event: TimelineEvent, groupedCount?: number): NormalizedTimelineEvent => {
  const filterKeys = FILTER_BY_EVENT_TYPE[event.event_type] ?? ['past']

  return {
    ...event,
    title: buildTitle(event, groupedCount),
    secondary: buildSecondary(event, groupedCount),
    displayTimestamp: event.timestamp,
    isDateOnly: false,
    filterKeys,
    importance: STRONG_EVENTS.has(event.event_type) ? 'strong' : 'quiet',
    relatedEntity: getRelatedEntity(event),
    actionsList: mapActions(event.actions ?? event.available_actions),
  }
}

const reminderGroupKey = (event: TimelineEvent): string =>
  [event.event_type, event.timestamp.slice(0, 10), event.description, event.metadata?.trigger ?? ''].join('|')

const groupReminders = (events: TimelineEvent[]): Array<TimelineEvent & { groupedCount?: number }> => {
  const grouped = new Map<string, TimelineEvent & { groupedCount?: number }>()
  const output: Array<TimelineEvent & { groupedCount?: number }> = []

  for (const event of events) {
    if (event.event_type !== 'reminder_created') {
      output.push(event)
      continue
    }
    const key = reminderGroupKey(event)
    const existing = grouped.get(key)
    if (existing) {
      existing.groupedCount = (existing.groupedCount ?? 1) + 1
    } else {
      const next = { ...event, groupedCount: 1 }
      grouped.set(key, next)
      output.push(next)
    }
  }

  return output
}

export const normalizeTimelineEvents = (events: TimelineEvent[]) => {
  const visible = events.filter((event) => !shouldHideEvent(event))

  const historicalEvents = groupReminders(visible)
    .map((event) => normalizeEvent(event, event.groupedCount))
    .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())

  return { historicalEvents, upcomingDeadlines: [] as NormalizedTimelineEvent[] }
}
