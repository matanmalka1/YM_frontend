import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchApi } from './search.api'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(api.get)

describe('searchApi', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({ data: { results: [], documents: [], page: 1, page_size: 20, total: 0 } })
    mockedGet.mockClear()
  })

  it('sends broad text search as search', async () => {
    await searchApi.search({ search: 'רפאל', page: 1, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('רפאל')
    expect(params.has('query')).toBe(false)
    expect(params.has('client_name')).toBe(false)
    expect(params.has('client_search')).toBe(false)
  })

  it('sends selected client scope as client_id', async () => {
    await searchApi.search({ search: 'audit_report', client_id: 42 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('audit_report')
    expect(params.get('client_id')).toBe('42')
    expect(params.has('client_name')).toBe(false)
  })
})
