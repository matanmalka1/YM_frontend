import { describe, expect, it } from 'vitest'
import { receiveBinderSchema } from '../schemas'
import { buildReceiveBinderPayload, getReceiveBinderDefaultValues } from './receiveBinder'

describe('binder intake form and payload', () => {
  it('models an unselected client without an unsafe cast and rejects submit', () => {
    const defaults = getReceiveBinderDefaultValues()
    expect(defaults.client_record_id).toBeUndefined()
    expect(receiveBinderSchema.safeParse(defaults).success).toBe(false)
  })

  it('builds distinct annual, VAT, and salary material periods', () => {
    const parsed = receiveBinderSchema.parse({
      ...getReceiveBinderDefaultValues(42),
      business_id: 7,
      binder_types: ['vat', 'salary', 'annual_report'],
      annual_report_id: 9,
      period_year: 2026,
      period_month_start: 3,
      period_month_end: 4,
      salary_month: 4,
    })
    const payload = buildReceiveBinderPayload(parsed, 5, 11)
    expect(payload.materials).toEqual([
      expect.objectContaining({
        material_type: 'vat',
        business_id: 7,
        vat_report_id: 11,
        period_month_start: 3,
        period_month_end: 4,
      }),
      expect.objectContaining({ material_type: 'salary', business_id: null, period_month_start: 3, period_month_end: 4 }),
      expect.objectContaining({
        material_type: 'annual_report',
        annual_report_id: 9,
        period_month_start: 1,
        period_month_end: 12,
      }),
    ])
  })
})
