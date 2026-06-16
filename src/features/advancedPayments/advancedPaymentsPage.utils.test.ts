import { describe, expect, it } from 'vitest'
import type { AdvancePaymentDueDateGroup } from './api/contracts'
import {
  getAdvancePaymentBatchKey,
  getAdvancePaymentWorkflowStats,
  mergeAdvancePaymentBatches,
} from './advancedPaymentsPage.utils'

const createBatch = (overrides: Partial<AdvancePaymentDueDateGroup> = {}): AdvancePaymentDueDateGroup => ({
  year: 2026,
  month: 1,
  due_date: '2026-02-15',
  period_months_count: 1,
  client_count: 1,
  missing_turnover_count: 0,
  overdue_count: 0,
  pending_count: 0,
  paid_count: 0,
  not_paid_count: 1,
  total_expected: '100',
  total_paid: '0',
  collection_rate: '0',
  ...overrides,
})

describe('advancedPaymentsPage.utils', () => {
  it('merges batches with the same due date and sums workflow totals', () => {
    const batches = [
      createBatch(),
      createBatch({
        month: 2,
        client_count: 2,
        pending_count: 1,
        overdue_count: 1,
        missing_turnover_count: 1,
        total_expected: '250',
        total_paid: '50',
      }),
    ]

    const result = mergeAdvancePaymentBatches(batches, null)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      client_count: 3,
      pending_count: 1,
      overdue_count: 1,
      missing_turnover_count: 1,
      total_expected: '350',
      total_paid: '50',
      collection_rate: '14.29',
    })
    expect(result[0].source_batches).toHaveLength(2)
  })

  it('keeps no-deadline batches separate by reporting period', () => {
    const january = createBatch({ due_date: undefined, month: 1 })
    const march = createBatch({ due_date: undefined, month: 3 })

    const result = mergeAdvancePaymentBatches([january, march], null)

    expect(result.map(getAdvancePaymentBatchKey)).toEqual(['2026-01-1', '2026-03-1'])
  })

  it('excludes duplicate even-month bimonthly source batches', () => {
    const result = mergeAdvancePaymentBatches(
      [createBatch({ month: 1, period_months_count: 2 }), createBatch({ month: 2, period_months_count: 2 })],
      2,
    )

    expect(result).toHaveLength(1)
    expect(result[0].month).toBe(1)
  })

  it('treats null and invalid aggregate amounts as zero', () => {
    const result = mergeAdvancePaymentBatches(
      [
        createBatch({ total_expected: null, total_paid: 'invalid' }),
        createBatch({ month: 2, total_expected: '125', total_paid: null }),
      ],
      null,
    )

    expect(result[0].total_expected).toBe('125')
    expect(result[0].total_paid).toBe('0')
    expect(result[0].collection_rate).toBe('0.00')
  })

  it('calculates current-period and workflow counters', () => {
    const stats = getAdvancePaymentWorkflowStats(
      [
        createBatch({ pending_count: 2, overdue_count: 1, missing_turnover_count: 3, not_paid_count: 4 }),
        createBatch({ month: 3, due_date: '2026-04-15', pending_count: 1, not_paid_count: 5 }),
      ],
      2026,
      1,
    )

    expect(stats).toEqual({
      dueThisMonthCount: 4,
      pendingCount: 3,
      missingTurnoverCount: 3,
      overdueCount: 1,
    })
  })
})
