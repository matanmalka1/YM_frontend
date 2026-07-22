import { describe, expect, it } from 'vitest'
import { parseReportDate, parseReportMonth, parseReportYear } from './urlState'

describe('report URL filters', () => {
  it('accepts valid shareable values', () => {
    expect(parseReportYear('2025', 2026)).toBe(2025)
    expect(parseReportMonth('12')).toBe(12)
    expect(parseReportDate('2026-02-28', '2026-07-22')).toBe('2026-02-28')
  })

  it('falls back for invalid values', () => {
    expect(parseReportYear('oops', 2026)).toBe(2026)
    expect(parseReportMonth('13')).toBeUndefined()
    expect(parseReportDate('2026-02-31', '2026-07-22')).toBe('2026-07-22')
  })
})
