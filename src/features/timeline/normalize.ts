import { parseISO } from 'date-fns'
import type { TimelineEvent, TimelineEventMetadata } from './api'
import { getTimelineStatusLabel } from './labels'
import { getEventTypeLabel } from './utils'

export type TimelineFilterKey = 'all' | 'past' | 'future' | 'finance' | 'binders' | 'documents' | 'tax'

export interface NormalizedTimelineEvent extends TimelineEvent {
  title: string
  secondary: string | null
  displayTimestamp: string
  isDateOnly: boolean
  filterKeys: TimelineFilterKey[]
  importance: 'strong' | 'quiet'
  relatedEntity: string | null
}

const FILTER_BY_EVENT_TYPE: Record<string, TimelineFilterKey[]> = {
  charge_created: ['past', 'finance'],
  charge_issued: ['past', 'finance'],
  charge_paid: ['past', 'finance'],
  invoice_attached: ['past', 'finance'],
  binder_received: ['past', 'binders'],
  binder_handed_over: ['past', 'binders'],
  binder_lifecycle_change: ['past', 'binders'],
  document_uploaded: ['past', 'documents'],
  annual_report_status_changed: ['past', 'tax'],
  signature_request_sent: ['past', 'documents'],
  signature_request_signed: ['past', 'documents'],
  signature_request_declined: ['past', 'documents'],
  signature_request_canceled: ['past', 'documents'],
  signature_request_expired: ['past', 'documents'],
}

const STRONG_EVENTS = new Set([
  'charge_created',
  'charge_issued',
  'charge_paid',
  'annual_report_status_changed',
  'binder_lifecycle_change',
  'document_uploaded',
  'signature_request_sent',
  'signature_request_signed',
  'signature_request_declined',
])

const getMetadataString = (metadata: TimelineEventMetadata | null | undefined, keys: string[]): string | null => {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

const shouldHideEvent = (event: TimelineEvent): boolean =>
  event.event_type === 'binder_lifecycle_change' &&
  event.metadata?.old_value != null &&
  event.metadata?.new_value != null &&
  event.metadata.old_value === event.metadata.new_value &&
  !event.metadata.notes

const getRelatedEntity = (event: TimelineEvent): string | null => {
  if (event.charge_id != null) return `חיוב #${event.charge_id}`
  if (event.binder_id != null) return `קלסר #${event.binder_id}`
  const documentName = getMetadataString(event.metadata, ['document_name', 'filename'])
  if (documentName) return `מסמך ${documentName}`
  const taxYear = event.metadata?.tax_year
  if (taxYear != null) return `דוח שנתי ${String(taxYear)}`
  return null
}

const buildTitle = (event: TimelineEvent): string => {
  if (event.event_type === 'annual_report_status_changed') {
    const { tax_year, form_type } = event.metadata ?? {}
    if (tax_year != null) {
      const typeLabel = form_type ? ` (${String(form_type)})` : ''
      return `דוח שנתי ${String(tax_year)}${typeLabel}`
    }
  }
  return getEventTypeLabel(event.event_type)
}

const buildSecondary = (event: TimelineEvent): string | null => {
  if (event.event_type === 'binder_lifecycle_change') {
    if (event.metadata?.old_value === event.metadata?.new_value && event.metadata?.notes) {
      return String(event.metadata.notes)
    }
    const oldLabel = getTimelineStatusLabel(String(event.metadata?.old_value ?? ''))
    const newLabel = getTimelineStatusLabel(String(event.metadata?.new_value ?? ''))
    return `${oldLabel} ← ${newLabel}`
  }

  return event.description || null
}

const normalizeEvent = (event: TimelineEvent): NormalizedTimelineEvent => {
  const filterKeys = FILTER_BY_EVENT_TYPE[event.event_type] ?? ['past']

  return {
    ...event,
    title: buildTitle(event),
    secondary: buildSecondary(event),
    displayTimestamp: event.timestamp,
    isDateOnly: false,
    filterKeys,
    importance: STRONG_EVENTS.has(event.event_type) ? 'strong' : 'quiet',
    relatedEntity: getRelatedEntity(event),
  }
}

export const normalizeTimelineEvents = (events: TimelineEvent[]) => {
  const historicalEvents = events
    .flatMap((event) => (shouldHideEvent(event) ? [] : [normalizeEvent(event)]))
    .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())

  return { historicalEvents, upcomingDeadlines: [] as NormalizedTimelineEvent[] }
}
