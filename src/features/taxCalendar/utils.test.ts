import { describe, expect, it } from 'vitest'
import { parseTaxCalendarGroupStatusFilter, parseTaxCalendarObligationType } from './utils'

describe('tax calendar URL filters', () => {
  it('accepts supported enum values', () => {
    expect(parseTaxCalendarGroupStatusFilter('overdue')).toBe('overdue')
    expect(parseTaxCalendarObligationType('advance_payment')).toBe('advance_payment')
  })

  it('falls back for missing values', () => {
    expect(parseTaxCalendarGroupStatusFilter(null)).toBe('all')
    expect(parseTaxCalendarObligationType(null)).toBeUndefined()
  })

  it('rejects unsupported values', () => {
    expect(parseTaxCalendarGroupStatusFilter('stale-status')).toBe('all')
    expect(parseTaxCalendarObligationType('national_insurance')).toBeUndefined()
  })
})
