import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { chargesQK } from '../api'
import type { ChargeResponse, ChargesListResponse } from '../api/contracts'
import { addCreatedChargeToLists } from './chargeCache'

const charge: ChargeResponse = {
  id: 7,
  client_record_id: 12,
  client_name: 'ישראל ישראלי',
  business_name: null,
  annual_report_id: null,
  charge_type: 'monthly_retainer',
  status: 'draft',
  amount: '150.00',
  period: '2026-07',
  months_covered: 1,
  description: null,
  created_at: '2026-07-20T10:00:00Z',
  updated_at: null,
  created_by: 1,
  issued_at: null,
  issued_by: null,
  paid_at: null,
  paid_by: null,
  canceled_at: null,
  canceled_by: null,
  cancellation_reason: null,
}

const emptyList: ChargesListResponse = {
  items: [],
  total: 0,
  page: 1,
  page_size: 20,
  stats: {
    draft: { count: 0, amount: '0.00' },
    issued: { count: 0, amount: '0.00' },
    paid: { count: 0, amount: '0.00' },
    canceled: { count: 0, amount: '0.00' },
  },
}

describe('addCreatedChargeToLists', () => {
  it('adds a created charge immediately to a matching first page', () => {
    const queryClient = new QueryClient()
    const key = chargesQK.list({ client_record_id: 12, page: 1, page_size: 20 })
    queryClient.setQueryData(key, emptyList)

    addCreatedChargeToLists(queryClient, charge)

    expect(queryClient.getQueryData<ChargesListResponse>(key)).toMatchObject({
      items: [{ id: 7 }],
      total: 1,
      stats: { draft: { count: 1, amount: '150.00' } },
    })
  })

  it('does not add a draft charge to a non-matching filtered list', () => {
    const queryClient = new QueryClient()
    const key = chargesQK.list({ status: 'issued', page: 1, page_size: 20 })
    queryClient.setQueryData(key, emptyList)

    addCreatedChargeToLists(queryClient, charge)

    expect(queryClient.getQueryData(key)).toEqual(emptyList)
  })
})
