import { describe, expect, it } from 'vitest'
import { getTaxDeadlineCoveredPeriodsLabel } from './utils'

describe('getTaxDeadlineCoveredPeriodsLabel', () => {
  it('sorts longer covered periods first and joins period labels with commas', () => {
    const label = getTaxDeadlineCoveredPeriodsLabel('vat', [
      { period: '2026-04', period_months_count: 1 },
      { period: '2026-03', period_months_count: 2 },
    ])

    expect(label).toBe('כולל תקופות: מרץ-אפריל 2026, אפריל 2026')
  })
})
