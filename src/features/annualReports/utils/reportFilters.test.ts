import { describe, expect, it } from 'vitest'
import { ALL_ANNUAL_REPORT_YEARS, getAnnualReportResetFilters, getInitializedAnnualReportYear } from './reportFilters'

describe('annual report URL year initialization', () => {
  it('initializes a missing year from the backend default', () => {
    expect(getInitializedAnnualReportYear('', 2025)).toBe('2025')
  })

  it('preserves an explicit year and the all-years sentinel', () => {
    expect(getInitializedAnnualReportYear('2024', 2025)).toBeNull()
    expect(getInitializedAnnualReportYear(ALL_ANNUAL_REPORT_YEARS, 2025)).toBeNull()
  })

  it('resets to the backend default only when it is known', () => {
    expect(getAnnualReportResetFilters(2025)).toEqual({ year: '2025' })
    expect(getAnnualReportResetFilters()).toEqual({})
  })
})
