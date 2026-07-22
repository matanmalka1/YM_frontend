import { describe, expect, it } from 'vitest'
import { buildSeasonStats } from './useSeasonSummary'

describe('buildSeasonStats', () => {
  it('does not classify canceled reports as in progress', () => {
    const stats = buildSeasonStats({
      tax_year: 2025,
      filing_season_year: 2026,
      total: 6,
      not_started: 1,
      collecting_docs: 1,
      in_preparation: 1,
      pending_client: 0,
      submitted: 1,
      closed: 1,
      canceled: 1,
      completion_rate: '33.3',
      overdue_count: 0,
    })

    expect(stats).toMatchObject({ done: 2, canceled: 1, inProgress: 2 })
  })
})
