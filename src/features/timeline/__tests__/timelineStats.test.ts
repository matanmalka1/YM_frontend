import { describe, it, expect } from 'vitest'
import { buildTimelineFilterStats, getTimelineFilterCount } from '../lib/timelineStats'
import { getAnnualReportStatusLabel } from '../labels'
import { getEventTypeLabel } from '../utils'
import type { NormalizedTimelineEvent, TimelineFilterKey } from '../normalize'

// ── Factories ─────────────────────────────────────────────────────────────────

const makeEvent = (filterKeys: TimelineFilterKey[]): NormalizedTimelineEvent => ({
  event_type: 'charge_created',
  timestamp: '2026-01-01T10:00:00',
  displayTimestamp: '2026-01-01T10:00:00',
  isDateOnly: false,
  binder_id: null,
  charge_id: null,
  description: '',
  metadata: null,
  actions: null,
  available_actions: null,
  filterKeys,
  importance: 'strong',
  relatedEntity: null,
  actionsList: [],
  title: 'יצירת חיוב',
  secondary: null,
})

// ── buildTimelineFilterStats ──────────────────────────────────────────────────

describe('buildTimelineFilterStats', () => {
  it('"all" count equals total unique events', () => {
    const events = [makeEvent(['past', 'finance']), makeEvent(['past', 'binders'])]
    const stats = buildTimelineFilterStats(events)
    expect(getTimelineFilterCount(stats, 'all')).toBe(2)
  })

  it('"past" count equals total unique events and never exceeds "all"', () => {
    const events = [makeEvent(['past', 'finance']), makeEvent(['past', 'tax'])]
    const stats = buildTimelineFilterStats(events)
    const all = getTimelineFilterCount(stats, 'all')
    const past = getTimelineFilterCount(stats, 'past')
    expect(past).toBe(2)
    expect(past).toBeLessThanOrEqual(all)
  })

  it('event with multiple filterKeys counts once per category, not double', () => {
    // Regression: old code incremented 'past' again in the loop, producing 2x
    const events = [makeEvent(['past', 'finance'])]
    const stats = buildTimelineFilterStats(events)
    expect(getTimelineFilterCount(stats, 'past')).toBe(1)
    expect(getTimelineFilterCount(stats, 'finance')).toBe(1)
    expect(getTimelineFilterCount(stats, 'all')).toBe(1)
  })

  it('category counts are independent for each category', () => {
    const events = [
      makeEvent(['past', 'finance']),
      makeEvent(['past', 'binders']),
      makeEvent(['past', 'finance']),
    ]
    const stats = buildTimelineFilterStats(events)
    expect(getTimelineFilterCount(stats, 'finance')).toBe(2)
    expect(getTimelineFilterCount(stats, 'binders')).toBe(1)
    expect(getTimelineFilterCount(stats, 'tax')).toBe(0)
  })

  it('empty list produces zero counts', () => {
    const stats = buildTimelineFilterStats([])
    expect(getTimelineFilterCount(stats, 'all')).toBe(0)
    expect(getTimelineFilterCount(stats, 'past')).toBe(0)
  })
})

// ── getTimelineFilterCount ────────────────────────────────────────────────────

describe('getTimelineFilterCount', () => {
  it('returns 0 for missing key', () => {
    expect(getTimelineFilterCount([], 'finance')).toBe(0)
  })
})

// ── getAnnualReportStatusLabel ────────────────────────────────────────────────

describe('getAnnualReportStatusLabel', () => {
  it('returns Hebrew label for each known status', () => {
    expect(getAnnualReportStatusLabel('submitted')).toBe('הוגש')
    expect(getAnnualReportStatusLabel('not_started')).toBe('טרם התחיל')
    expect(getAnnualReportStatusLabel('collecting_docs')).toBe('איסוף מסמכים')
    expect(getAnnualReportStatusLabel('accepted')).toBe('התקבל')
    expect(getAnnualReportStatusLabel('closed')).toBe('נסגר')
    expect(getAnnualReportStatusLabel('canceled')).toBe('בוטל')
    expect(getAnnualReportStatusLabel('assessment_issued')).toBe('שומה הופקה')
    expect(getAnnualReportStatusLabel('objection_filed')).toBe('הוגשה השגה')
  })

  it('returns raw status string for unknown values', () => {
    expect(getAnnualReportStatusLabel('some_future_status')).toBe('some_future_status')
  })
})

// ── Event registry: stale event types ────────────────────────────────────────

describe('event registry', () => {
  const STALE_EVENT_TYPES = [
    'notification_sent',
    'client_info_updated',
    'reminder_created',
    'signature_request_created',
    'tax_profile_updated',
    'invoice_created',
    'notification',
  ]

  it.each(STALE_EVENT_TYPES)('stale event type "%s" falls back to generic label', (eventType) => {
    expect(getEventTypeLabel(eventType)).toBe('אירוע')
  })
})
