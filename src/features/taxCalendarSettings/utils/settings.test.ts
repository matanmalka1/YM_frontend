import { describe, expect, it } from 'vitest'
import { getDefaultYearRange, groupTaxCalendarEntries, parseYearInput } from './settings'

describe('tax calendar settings utilities', () => {
  it('uses the same one-year range for initialization and reset', () => {
    expect(getDefaultYearRange(new Date('2026-07-22T00:00:00Z'))).toEqual({ startYear: '2026', endYear: '2026' })
  })

  it('rejects missing, fractional, and reversed-range inputs before querying', () => {
    expect(parseYearInput('', 'שנה').value).toBeNull()
    expect(parseYearInput('2026.5', 'שנה').value).toBeNull()
    expect(parseYearInput('2026', 'שנה')).toEqual({ value: 2026, error: null })
  })

  it('groups entries by tax year and obligation and sorts periods', () => {
    const base = {
      id: 1,
      tax_year: 2026,
      obligation_type: 'vat',
      due_date: '2026-03-15',
      period_months_count: 1,
      deadline_rule_id: 10,
    }
    const groups = groupTaxCalendarEntries([
      { ...base, id: 2, period: '02' },
      { ...base, id: 1, period: '01' },
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0]?.entries.map((entry) => entry.period)).toEqual(['01', '02'])
  })
})
