import { describe, expect, it } from 'vitest'
import {
  TAX_CALENDAR_GROUP_PAGE_SIZE,
  parseTaxCalendarGroupStatusFilter,
  parseTaxCalendarObligationType,
  readTaxCalendarCommonFilters,
  taxCalendarCurrentYear,
  toTaxCalendarCommonParams,
} from './utils'

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

const makeReaders = (params: Record<string, string>, page = 1) => {
  const searchParams = new URLSearchParams(params)
  return {
    searchParams,
    getParam: (key: string) => searchParams.get(key) ?? '',
    getPage: () => page,
  }
}

describe('readTaxCalendarCommonFilters', () => {
  it('reads and normalizes the shared filters', () => {
    const { searchParams, getParam, getPage } = makeReaders(
      {
        tax_year_after: '2024',
        tax_year_before: '2025',
        obligation_type: 'advance_payment',
        status: 'overdue',
      },
      3,
    )

    expect(readTaxCalendarCommonFilters(searchParams, getParam, getPage)).toEqual({
      startYear: '2024',
      endYear: '2025',
      obligationType: 'advance_payment',
      status: 'overdue',
      page: 3,
    })
  })

  it('falls back to the current year and defaults when params are absent or invalid', () => {
    const year = String(taxCalendarCurrentYear())
    const { searchParams, getParam, getPage } = makeReaders({ obligation_type: 'bogus', status: 'bogus' })

    expect(readTaxCalendarCommonFilters(searchParams, getParam, getPage)).toEqual({
      startYear: year,
      endYear: year,
      obligationType: undefined,
      status: 'all',
      page: 1,
    })
  })
})

describe('toTaxCalendarCommonParams', () => {
  it('maps filters into the shared params shape', () => {
    expect(
      toTaxCalendarCommonParams({
        startYear: '2024',
        endYear: '2025',
        obligationType: 'vat',
        status: 'open',
        page: 2,
      }),
    ).toEqual({
      tax_year_after: 2024,
      tax_year_before: 2025,
      obligation_type: 'vat',
      status: 'open',
      page: 2,
      page_size: TAX_CALENDAR_GROUP_PAGE_SIZE,
    })
  })

  it('falls back to the current year for non-numeric year strings', () => {
    const year = taxCalendarCurrentYear()
    const params = toTaxCalendarCommonParams({
      startYear: '',
      endYear: 'abc',
      obligationType: undefined,
      status: 'all',
      page: 1,
    })

    expect(params.tax_year_after).toBe(year)
    expect(params.tax_year_before).toBe(year)
  })
})
