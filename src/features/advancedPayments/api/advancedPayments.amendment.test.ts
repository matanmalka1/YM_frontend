import { beforeEach, describe, expect, it, vi } from 'vitest'
import { advancePaymentsApi } from './advancedPayments.api'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}))

const mockedPost = vi.mocked(api.post)
const mockedGet = vi.mocked(api.get)

describe('advancePaymentsApi amendment endpoints', () => {
  beforeEach(() => {
    mockedPost.mockReset()
    mockedGet.mockReset()
  })

  it('opens a correction under the client that owns the payment', async () => {
    // Every advance route is client-scoped; a bare /advance-payments/{id}/amend
    // does not exist.
    mockedPost.mockResolvedValue({ data: { id: 34, amends_id: 12 } })

    const amendment = await advancePaymentsApi.createAmendment(7, 12)

    expect(mockedPost).toHaveBeenCalledWith('/clients/7/advance-payments/12/amend')
    expect(amendment.id).toBe(34)
    expect(amendment.amends_id).toBe(12)
  })

  it('returns the restored original when a correction is withdrawn', async () => {
    mockedPost.mockResolvedValue({ data: { id: 12, amends_id: null, superseded_at: null } })

    const original = await advancePaymentsApi.withdrawAmendment(7, 34)

    expect(mockedPost).toHaveBeenCalledWith('/clients/7/advance-payments/34/withdraw')
    expect(original.id).toBe(12)
  })

  it('reads the whole chain, superseded links included', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 12 }, { id: 34 }] })

    const chain = await advancePaymentsApi.listChain(7, 12)

    expect(mockedGet).toHaveBeenCalledWith('/clients/7/advance-payments/12/chain')
    expect(chain.map((record) => record.id)).toEqual([12, 34])
  })
})
