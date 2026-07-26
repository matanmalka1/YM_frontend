import { describe, expect, it } from 'vitest'
import type { AdvancePaymentRow } from '../api/contracts'
import { buildAdvancePaymentPeriodNavigation } from './useAdvancePaymentPeriodNavigation'

const payment = (id: number, period: string): AdvancePaymentRow =>
  ({
    id,
    period,
    period_months_count: 1,
  }) as AdvancePaymentRow

describe('buildAdvancePaymentPeriodNavigation', () => {
  it('sorts siblings chronologically and resolves both adjacent records', () => {
    const result = buildAdvancePaymentPeriodNavigation([payment(3, '2026-03'), payment(1, '2026-01'), payment(2, '2026-02')], 2)

    expect(result.options.map((option) => option.id)).toEqual([1, 2, 3])
    expect(result.previousPaymentId).toBe(1)
    expect(result.nextPaymentId).toBe(3)
  })

  it('disables the missing edge and both arrows when the current record is absent', () => {
    expect(buildAdvancePaymentPeriodNavigation([payment(1, '2026-01')], 1)).toMatchObject({
      previousPaymentId: null,
      nextPaymentId: null,
    })
    expect(buildAdvancePaymentPeriodNavigation([payment(1, '2026-01')], 9)).toMatchObject({
      previousPaymentId: null,
      nextPaymentId: null,
    })
  })
})
