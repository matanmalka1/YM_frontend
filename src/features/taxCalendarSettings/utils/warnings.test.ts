import { describe, expect, it } from 'vitest'
import { translateTaxCalendarWarning } from './warnings'

describe('translateTaxCalendarWarning', () => {
  it('renders count mismatches from structured fields', () => {
    expect(
      translateTaxCalendarWarning({ code: 'count_mismatch', year: 2026, obligation_type: 'vat', expected: 12, found: 11 }),
    ).toContain('11')
  })

  it('renders missing registry data without parsing backend prose', () => {
    expect(translateTaxCalendarWarning({ code: 'registry_data_missing', year: 2027 })).toContain('2027')
  })

  it('renders bootstrap count mismatches', () => {
    expect(
      translateTaxCalendarWarning({
        code: 'bootstrap_count_mismatch',
        tax_year_after: 2026,
        tax_year_before: 2027,
        expected: 48,
        found: 47,
        expected_per_year: 24,
      }),
    ).toContain('47')
  })
})
