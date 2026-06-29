import { parseISO } from 'date-fns'
import {
  AUDIT_ACTION_LABELS,
  EMPTY_FIELD_VALUE_LABELS,
  makeAuditFormatter,
  type EntityAuditLogEntry,
} from '@/features/audit'
import type { TimelineEvent, TimelineEventMetadata } from './api'
import { getTimelineStatusLabel } from './labels'
import { getEventTypeLabel } from './utils'

export type TimelineFilterKey =
  | 'all'
  | 'past'
  | 'future'
  | 'finance'
  | 'binders'
  | 'documents'
  | 'tax'
  | 'changes'

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
  annual_report_changed: ['past', 'tax', 'changes'],
  charge_changed: ['past', 'finance', 'changes'],
  business_changed: ['past', 'changes'],
  client_record_changed: ['past', 'changes'],
  signature_request_sent: ['past', 'documents'],
  signature_request_signed: ['past', 'documents'],
  signature_request_declined: ['past', 'documents'],
  signature_request_canceled: ['past', 'documents'],
  signature_request_expired: ['past', 'documents'],
}

// Audit-sourced change events — rendered from raw audit fields in metadata.
const CHANGE_EVENT_TYPES = new Set([
  'client_record_changed',
  'business_changed',
  'charge_changed',
  'annual_report_changed',
])

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

// Reuse the audit feature's diff formatter so record changes render identically
// to the standalone audit trail — no field/value formatting duplicated here.
const formatAuditDiff = makeAuditFormatter(EMPTY_FIELD_VALUE_LABELS)

const toAuditEntry = (event: TimelineEvent): EntityAuditLogEntry => ({
  id: 0,
  entity_type: String(event.metadata?.entity_type ?? ''),
  entity_id: Number(event.metadata?.entity_id ?? 0),
  performed_by: 0,
  performed_by_name: event.metadata?.performed_by_name ?? null,
  action: String(event.metadata?.change_action ?? ''),
  old_value: event.metadata?.change_old ?? null,
  new_value: event.metadata?.change_new ?? null,
  note: event.metadata?.note ?? null,
  performed_at: event.timestamp,
})

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

  if (CHANGE_EVENT_TYPES.has(event.event_type)) {
    const action = String(event.metadata?.change_action ?? '')
    const performer = event.metadata?.performed_by_name
    return (
      [AUDIT_ACTION_LABELS[action], performer ? `ע״י ${performer}` : null, formatAuditDiff(toAuditEntry(event))]
        .filter(Boolean)
        .join(' · ') || null
    )
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
