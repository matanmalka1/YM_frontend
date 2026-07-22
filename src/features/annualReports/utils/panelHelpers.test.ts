import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnnualReportFull } from '../api'
import { getAlertBanners } from './panelHelpers'

const report = (overrides: Partial<AnnualReportFull> = {}): AnnualReportFull => ({
  id: 1,
  client_record_id: 2,
  tax_year: 2025,
  client_type: 'individual',
  form_type: '1301',
  status: 'in_preparation',
  deadline_type: 'standard',
  filing_deadline: '2025-06-30',
  is_overdue: true,
  days_until_deadline: -387,
  custom_deadline_note: null,
  submitted_at: null,
  ita_reference: null,
  assessment_amount: null,
  refund_due: null,
  tax_due: null,
  has_rental_income: false,
  has_capital_gains: false,
  has_foreign_income: false,
  has_depreciation: false,
  submission_method: null,
  extension_reason: null,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  assigned_to: null,
  created_by: 1,
  ...overrides,
})

describe('annual report alert banners', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-22T12:00:00Z'))
  })

  afterEach(() => vi.useRealTimers())

  it.each(['submitted', 'closed', 'canceled'] as const)('does not show an overdue banner for terminal status %s', (status) => {
    const banners = getAlertBanners(
      report({
        status,
        is_overdue: false,
        submitted_at: status === 'submitted' ? '2025-06-01T00:00:00Z' : null,
      }),
    )

    expect(banners.some((banner) => banner.variant === 'error' && banner.message.includes('חלף'))).toBe(false)
  })

  it('still shows an overdue banner for an open report', () => {
    expect(getAlertBanners(report()).some((banner) => banner.message.includes('חלף'))).toBe(true)
  })
})
