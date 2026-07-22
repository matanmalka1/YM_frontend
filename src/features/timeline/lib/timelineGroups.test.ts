import { describe, expect, it, vi } from 'vitest'
import { getDefaultOpenTimelineGroups } from './timelineGroups'
import type { NormalizedTimelineEvent } from '../normalize'

const event = (timestamp: string): NormalizedTimelineEvent => ({
  event_type: 'charge_created',
  timestamp,
  displayTimestamp: timestamp,
  title: 'חיוב',
  secondary: null,
  binder_id: null,
  charge_id: 1,
  description: '',
  metadata: null,
  isDateOnly: false,
  filterKeys: ['past', 'finance'],
  importance: 'strong',
  relatedEntity: null,
})

describe('timeline default groups', () => {
  it('opens today when present and otherwise the first historical group', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-22T10:00:00Z'))
    expect(
      getDefaultOpenTimelineGroups([
        { date: '21.07.2026', items: [event('2026-07-21T10:00:00Z')] },
        { date: '22.07.2026', items: [event('2026-07-22T10:00:00Z')] },
      ]),
    ).toEqual(new Set(['22.07.2026']))
    expect(getDefaultOpenTimelineGroups([{ date: '21.07.2026', items: [event('2026-07-21T10:00:00Z')] }])).toEqual(
      new Set(['21.07.2026']),
    )
    vi.useRealTimers()
  })
})
