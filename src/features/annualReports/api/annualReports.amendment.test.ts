import { beforeEach, describe, expect, it, vi } from 'vitest'
import { annualReportsApi } from './annualReports.api'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}))

const mockedPost = vi.mocked(api.post)
const mockedGet = vi.mocked(api.get)

describe('annualReportsApi amendment endpoints', () => {
  beforeEach(() => {
    mockedPost.mockReset()
    mockedGet.mockReset()
  })

  it('opens a correction with a POST to the report it corrects', async () => {
    mockedPost.mockResolvedValue({ data: { id: 34, amends_id: 12 } })

    const amendment = await annualReportsApi.createAmendment(12)

    expect(mockedPost).toHaveBeenCalledWith('/annual-reports/12/amend')
    // Returns the amendment, not the original — the caller navigates to it.
    expect(amendment.id).toBe(34)
    expect(amendment.amends_id).toBe(12)
  })

  it('returns the restored original when a correction is withdrawn', async () => {
    mockedPost.mockResolvedValue({ data: { id: 12, amends_id: null, superseded_at: null } })

    const original = await annualReportsApi.withdrawAmendment(34)

    expect(mockedPost).toHaveBeenCalledWith('/annual-reports/34/withdraw')
    expect(original.id).toBe(12)
  })

  it('reads the whole chain, superseded links included', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 12 }, { id: 34 }] })

    const chain = await annualReportsApi.listChain(12)

    expect(mockedGet).toHaveBeenCalledWith('/annual-reports/12/chain')
    expect(chain.map((record) => record.id)).toEqual([12, 34])
  })
})
