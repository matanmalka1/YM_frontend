import { describe, expect, it } from 'vitest'
import type { TaxCalendarGroup, TaxCalendarGroupItem, TaxCalendarGroupItemSourceType } from './api'
import {
  getClientTaxCalendarItemPath,
  getTaxCalendarGroupStateLabel,
  getTaxCalendarGroupStateVariant,
  getTaxCalendarItemPath,
} from './helpers'
import { TAX_CALENDAR_MESSAGES } from './messages'

const buildItem = (sourceType: TaxCalendarGroupItemSourceType): TaxCalendarGroupItem => ({
  source_type: sourceType,
  source_id: 34,
  client_record_id: 12,
  office_client_number: 120,
  client_name: 'לקוח בדיקה',
  id_number: '123456789',
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

describe('tax calendar group state', () => {
  const group = (overrides: Partial<TaxCalendarGroup>): TaxCalendarGroup => ({
    tax_calendar_entry_id: 1,
    obligation_type: 'vat',
    period: '2026-03',
    period_months_count: 1,
    tax_year: 2026,
    regulatory_due_date: '2026-04-15',
    effective_due_date_min: '2026-04-15',
    effective_due_date_max: '2026-04-15',
    linked_count: 2,
    open_count: 1,
    done_count: 1,
    overdue_count: 0,
    ...overrides,
  })

  it('keeps a mixed open/done group open', () => {
    expect(getTaxCalendarGroupStateLabel(group({}))).toBe(TAX_CALENDAR_MESSAGES.item.open)
    expect(getTaxCalendarGroupStateVariant(group({}))).toBe('warning')
  })

  it('prioritizes overdue when a mixed group contains an overdue item', () => {
    expect(getTaxCalendarGroupStateLabel(group({ overdue_count: 1 }))).toBe(TAX_CALENDAR_MESSAGES.item.overdue)
    expect(getTaxCalendarGroupStateVariant(group({ overdue_count: 1 }))).toBe('negative')
  })

  it('marks a group done only when no open item remains', () => {
    expect(getTaxCalendarGroupStateLabel(group({ open_count: 0, done_count: 2 }))).toBe(TAX_CALENDAR_MESSAGES.item.done)
    expect(getTaxCalendarGroupStateVariant(group({ open_count: 0, done_count: 2 }))).toBe('positive')
  })
})
