import { describe, it, expect } from 'vitest'
import { buildTimelineFilterStats, getTimelineFilterCount } from '../lib/timelineStats'
import { eventMatchesSearch, eventMatchesImportance, eventMatchesTypeFilters } from '../lib/timelineSearch'
import { getAnnualReportStatusLabel } from '../labels'
import { getEventTypeLabel } from '../utils'
import type { NormalizedTimelineEvent, TimelineFilterKey } from '../normalize'

// ── Factories ─────────────────────────────────────────────────────────────────

const makeEvent = (
  filterKeys: TimelineFilterKey[],
  overrides: Partial<NormalizedTimelineEvent> = {},
): NormalizedTimelineEvent => ({
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
  ...overrides,
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

// ── Two-step filtering: stats reflect base (search+importance), not category ──

describe('two-step filtering', () => {
  const finance = makeEvent(['past', 'finance'], { title: 'חיוב', description: 'חיוב ראשוני' })
  const binders = makeEvent(['past', 'binders'], { title: 'קלסר', description: 'קלסר חדש' })
  const tax = makeEvent(['past', 'tax'], { title: 'דוח שנתי', description: 'הגשת דוח', importance: 'quiet' })

  it('stats built from base (search only) keep all category counts visible when category is active', () => {
    // Simulate: search="חיוב", category=finance active
    const query = 'חיוב'
    const base = [finance, binders, tax].filter((e) => eventMatchesSearch(e, query))
    // base = [finance] since only finance title/description contains "חיוב"
    const stats = buildTimelineFilterStats(base)
    // finance chip shows 1; other chips show 0 but not collapsed due to category selection
    expect(getTimelineFilterCount(stats, 'all')).toBe(1)
    expect(getTimelineFilterCount(stats, 'finance')).toBe(1)
    // binders and tax are not in base after search, so 0 — correct, not "collapsed by category"
    expect(getTimelineFilterCount(stats, 'binders')).toBe(0)
  })

  it('selecting a category does not collapse other chip counts when no search is active', () => {
    // No search — base = all events. Category = finance.
    const allEvents = [finance, binders, tax]
    const base = allEvents // no search/importance filter
    const stats = buildTimelineFilterStats(base)
    // Category filter only affects filteredEvents, not stats
    expect(getTimelineFilterCount(stats, 'finance')).toBe(1)
    expect(getTimelineFilterCount(stats, 'binders')).toBe(1)
    expect(getTimelineFilterCount(stats, 'tax')).toBe(1)
    expect(getTimelineFilterCount(stats, 'all')).toBe(3)
  })

  it('stats change after search — chip counts reflect matching events only', () => {
    const allEvents = [finance, binders, tax]
    const query = 'דוח'
    const base = allEvents.filter((e) => eventMatchesSearch(e, query))
    const stats = buildTimelineFilterStats(base)
    expect(getTimelineFilterCount(stats, 'all')).toBe(1)
    expect(getTimelineFilterCount(stats, 'tax')).toBe(1)
    expect(getTimelineFilterCount(stats, 'finance')).toBe(0)
  })

  it('stats change after importantOnly — quiet events excluded from counts', () => {
    const allEvents = [finance, binders, tax] // tax has importance='quiet'
    const base = allEvents.filter((e) => eventMatchesImportance(e, true))
    const stats = buildTimelineFilterStats(base)
    // tax (quiet) excluded; finance and binders (strong) included
    expect(getTimelineFilterCount(stats, 'all')).toBe(2)
    expect(getTimelineFilterCount(stats, 'tax')).toBe(0)
    expect(getTimelineFilterCount(stats, 'finance')).toBe(1)
    expect(getTimelineFilterCount(stats, 'binders')).toBe(1)
  })

  it('header count equals filteredEvents.length after category selection', () => {
    const allEvents = [finance, binders, tax]
    // base = all (no search, no importance)
    // category = finance
    const filtered = allEvents.filter((e) => eventMatchesTypeFilters(e, ['finance'], true))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].event_type).toBe('charge_created')
  })

  it('header count equals base length when no category is active', () => {
    const allEvents = [finance, binders, tax]
    const filtered = allEvents.filter((e) => eventMatchesTypeFilters(e, ['all'], false))
    expect(filtered).toHaveLength(3)
  })
})

// ── eventMatchesSearch ────────────────────────────────────────────────────────

describe('eventMatchesSearch', () => {
  it('matches on title', () => {
    const ev = makeEvent(['past'], { title: 'הנפקת חיוב' })
    expect(eventMatchesSearch(ev, 'חיוב')).toBe(true)
  })

  it('matches on binder_id string', () => {
    const ev = makeEvent(['past'], { binder_id: 42 })
    expect(eventMatchesSearch(ev, '42')).toBe(true)
  })

  it('empty query always matches', () => {
    const ev = makeEvent(['past'])
    expect(eventMatchesSearch(ev, '')).toBe(true)
  })

  it('no match when query not found', () => {
    const ev = makeEvent(['past'], { title: 'שלום', description: 'עולם', secondary: null })
    expect(eventMatchesSearch(ev, 'xyz')).toBe(false)
  })
})

// ── eventMatchesImportance ────────────────────────────────────────────────────

describe('eventMatchesImportance', () => {
  it('importantOnly=false always passes', () => {
    const quiet = makeEvent(['past'], { importance: 'quiet' })
    expect(eventMatchesImportance(quiet, false)).toBe(true)
  })

  it('importantOnly=true passes strong events', () => {
    const strong = makeEvent(['past'], { importance: 'strong' })
    expect(eventMatchesImportance(strong, true)).toBe(true)
  })

  it('importantOnly=true blocks quiet events', () => {
    const quiet = makeEvent(['past'], { importance: 'quiet' })
    expect(eventMatchesImportance(quiet, true)).toBe(false)
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
