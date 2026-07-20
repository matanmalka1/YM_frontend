import { describe, expect, it } from 'vitest'
import type { TaxCalendarGroupItem, TaxCalendarGroupItemSourceType } from './api'
import { getClientTaxCalendarItemPath, getTaxCalendarItemPath } from './helpers'

const buildItem = (sourceType: TaxCalendarGroupItemSourceType): TaxCalendarGroupItem => ({
  source_type: sourceType,
  source_id: 34,
  client_record_id: 12,
  office_client_number: 120,
  client_name: 'לקוח בדיקה',
  period: '2026-03',
  period_months_count: 1,
  tax_year: 2026,
  status: 'pending',
  regulatory_due_date: '2026-04-15',
  effective_due_date: '2026-04-15',
  done: false,
  overdue: false,
})

describe('tax calendar item paths', () => {
  it.each([
    ['vat_work_item', '/tax/vat/34'],
    ['annual_report', '/tax/reports/34'],
    ['advance_payment', '/tax/advance-payments/12/34'],
  ] as const)('uses the standalone detail route for %s in the global calendar', (sourceType, expected) => {
    expect(getTaxCalendarItemPath(buildItem(sourceType))).toBe(expected)
  })

  it.each([
    ['vat_work_item', '/clients/12/vat/34'],
    ['annual_report', '/clients/12/annual-reports/34'],
    ['advance_payment', '/clients/12/advance-payments/34'],
  ] as const)('uses the client-scoped detail route for %s in the client calendar', (sourceType, expected) => {
    expect(getClientTaxCalendarItemPath(buildItem(sourceType))).toBe(expected)
  })
})
