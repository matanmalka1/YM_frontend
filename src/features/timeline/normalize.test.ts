import { describe, expect, it } from 'vitest'
import { normalizeTimelineEvents } from './normalize'
import type { TimelineEvent } from './api'

describe('normalizeTimelineEvents', () => {
  it('reuses audit field and value labels for change events', () => {
    const event: TimelineEvent = {
      event_type: 'client_record_changed',
      timestamp: '2026-06-30T10:00:00Z',
      binder_id: null,
      charge_id: null,
      description: 'שינוי בפרטי לקוח',
      metadata: {
        change_action: 'client.updated',
        change_old: {
          entity_type: 'osek_patur',
          pension_contribution: '10549.10',
        },
        change_new: {
          entity_type: 'company_ltd',
          pension_contribution: '5653',
        },
        performed_by_name: 'דנה לוי',
      },
    }

    const { historicalEvents } = normalizeTimelineEvents([event])

    expect(historicalEvents[0].secondary).toContain('סוג ישות: עוסק פטור → חברה בע"מ')
    expect(historicalEvents[0].secondary).toContain('הפקדות פנסיה: 10549.10 → 5653')
  })
})
