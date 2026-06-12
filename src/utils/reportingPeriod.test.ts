import { describe, expect, it } from 'vitest'

import { isCurrentReportingPeriod, reportingPeriodIncludesMonth } from './reportingPeriod'

describe('reporting period utilities', () => {
  it('detects months in reporting periods that cross year boundaries', () => {
    expect(reportingPeriodIncludesMonth(2026, 12, 2, 2026, 12)).toBe(true)
    expect(reportingPeriodIncludesMonth(2026, 12, 2, 2027, 1)).toBe(true)
    expect(reportingPeriodIncludesMonth(2026, 12, 2, 2027, 2)).toBe(false)
  })

  it('falls back to a one-month period for invalid month counts', () => {
    expect(reportingPeriodIncludesMonth(2026, 6, Number.NaN, 2026, 6)).toBe(true)
    expect(reportingPeriodIncludesMonth(2026, 6, Number.NaN, 2026, 7)).toBe(false)
  })

  it('checks the current reporting period using the provided date', () => {
    const now = new Date(2027, 0, 15)

    expect(isCurrentReportingPeriod('2026-12', 2, now)).toBe(true)
    expect(isCurrentReportingPeriod('2026-11', 1, now)).toBe(false)
  })
})
