import { describe, expect, it, vi } from 'vitest'
import { formatRelativeDueLabel } from './groupedPeriodRow.utils'

describe('formatRelativeDueLabel', () => {
  it('suppresses a past-due label when the caller has no overdue business items', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-20T12:00:00Z'))

    expect(formatRelativeDueLabel('2026-07-19', { showPastDue: false })).toBeNull()
    expect(formatRelativeDueLabel('2026-07-19', { showPastDue: true })).toBe('באיחור 1 ימים')

    vi.useRealTimers()
  })
})
