import { describe, expect, it } from 'vitest'
import { advancedPaymentsQK } from './queryKeys'

describe('advancedPaymentsQK', () => {
  it('normalizes client list params with defaults', () => {
    expect(
      advancedPaymentsQK.list({
        client_record_id: 12,
        year: 2026,
        status: ['pending'],
      }),
    ).toEqual([
      'tax',
      'advance-payments',
      'list',
      'client',
      12,
      'year',
      2026,
      {
        status: ['pending'],
        page: 1,
        page_size: 20,
      },
    ])
  })

  it('makes clientYear a prefix of client list keys for targeted invalidation', () => {
    const clientYearKey = advancedPaymentsQK.clientYear(12, 2026)
    const listKey = advancedPaymentsQK.list({
      client_record_id: 12,
      year: 2026,
      page: 1,
      page_size: 20,
    })

    expect(listKey.slice(0, clientYearKey.length)).toEqual(clientYearKey)
  })

  it('normalizes overview params with every response-changing input', () => {
    expect(
      advancedPaymentsQK.overview({
        year: 2026,
        month: 3,
        due_date: '2026-04-15',
        period_months_count: 2,
        client_record_id: 45,
        client_search: 'acme',
        status: ['partial'],
        page: 2,
        page_size: 50,
      }),
    ).toEqual([
      'tax',
      'advance-payments',
      'overview',
      {
        year: 2026,
        month: 3,
        due_date: '2026-04-15',
        period_months_count: 2,
        client_record_id: 45,
        client_search: 'acme',
        status: ['partial'],
        page: 2,
        page_size: 50,
      },
    ])
  })
})
