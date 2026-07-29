// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { useAdvancePaymentDetailForm } from './useAdvancePaymentDetailForm'

afterEach(cleanup)

const createPayment = (overrides: Partial<AdvancePaymentRow> = {}): AdvancePaymentRow => ({
  id: 1,
  client_record_id: 10,
  period: '2026-01',
  period_months_count: 1,
  expected_amount: '0',
  paid_amount: '0',
  status: 'awaiting_input',
  due_date: '2026-02-15',
  due_date_effective: null,
  paid_at: null,
  payment_method: null,
  payment_reference: null,
  annual_report_id: null,
  notes: null,
  delta: '0',
  turnover_amount: null,
  turnover_source: null,
  turnover_snapshot_at: null,
  advance_rate: '5',
  calculated_amount: '0',
  override_amount: null,
  withheld_amount: null,
  available_turnover: null,
  vat_turnover_mismatch: null,
  missing_turnover: true,
  timing_status: 'on_time',
  assigned_to: null,
  closed_at: null,
  closed_by: null,
  closed_late: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
  ...overrides,
})

/** What the server returns after "קבע לפי מע״מ" snapshots the VAT turnover. */
const snapshotted = (payment: AdvancePaymentRow): AdvancePaymentRow => ({
  ...payment,
  turnover_amount: '120000.00',
  turnover_source: 'vat_filed',
  turnover_snapshot_at: '2026-01-20T10:00:00Z',
  calculated_amount: '6000.00',
  missing_turnover: false,
})

describe('useAdvancePaymentDetailForm', () => {
  // MAT-74: the refresh mutation rewrites turnover server-side. The detail view
  // re-seeds the input from the mutation result; without that, the stale local
  // value vs the new baseline made the form dirty and Save wiped the snapshot.
  it('stays clean when a turnover snapshot is re-seeded into the form', () => {
    const payment = createPayment()
    const { result, rerender } = renderHook(({ row }) => useAdvancePaymentDetailForm({ payment: row, onSave: vi.fn() }), {
      initialProps: { row: payment },
    })
    expect(result.current.isDirty).toBe(false)

    const refreshed = snapshotted(payment)
    act(() => result.current.setTurnoverAmount('120000.00'))
    rerender({ row: refreshed })

    expect(result.current.turnoverAmount).toBe('120000.00')
    expect(result.current.isDirty).toBe(false)
  })

  it('omits turnover_amount from a save that follows a refresh', async () => {
    const onSave = vi.fn<(payload: UpdateAdvancePaymentPayload) => Promise<void>>().mockResolvedValue()
    const payment = createPayment()
    const { result, rerender } = renderHook(({ row }) => useAdvancePaymentDetailForm({ payment: row, onSave }), {
      initialProps: { row: payment },
    })

    act(() => result.current.setTurnoverAmount('120000.00'))
    rerender({ row: snapshotted(payment) })
    act(() => result.current.setNotes('שולם בהמחאה'))
    await act(() => result.current.handleSave())

    expect(onSave).toHaveBeenCalledTimes(1)
    const payload = onSave.mock.calls[0][0]
    expect(payload).toEqual({ notes: 'שולם בהמחאה' })
    expect('turnover_amount' in payload).toBe(false)
  })

  it('treats a server-echoed amount as unchanged', () => {
    const { result, rerender } = renderHook(({ row }) => useAdvancePaymentDetailForm({ payment: row, onSave: vi.fn() }), {
      initialProps: { row: createPayment({ paid_amount: '0' }) },
    })

    act(() => result.current.setPaidAmount('50'))
    rerender({ row: createPayment({ paid_amount: '50.00' }) })

    expect(result.current.isDirty).toBe(false)
  })
})
