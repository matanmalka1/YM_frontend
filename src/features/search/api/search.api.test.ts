import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchApi } from './search.api'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(api.get)

const emptyGroup = { items: [], total: 0 }

describe('searchApi.search', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({
      data: {
        clients: { items: [], page: 1, page_size: 20, total: 0 },
        matches: {
          binders: emptyGroup,
          documents: emptyGroup,
          vat_work_items: emptyGroup,
          annual_reports: emptyGroup,
          advance_payments: emptyGroup,
          charges: emptyGroup,
          tasks: emptyGroup,
          notifications: emptyGroup,
        },
      },
    })
    mockedGet.mockClear()
  })

  it('sends the term as search with the clients-list page', async () => {
    await searchApi.search({ search: 'רפאל', page: 2, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('רפאל')
    expect(params.get('page')).toBe('2')
    expect(params.get('page_size')).toBe('20')
  })

  it('sends nothing beyond the contract — the filter and selection params are gone', async () => {
    await searchApi.search({ search: '2026-03', page: 1, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect([...params.keys()].sort()).toEqual(['page', 'page_size', 'search'])
  })
})

describe('searchApi.listMatches', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({ data: { items: [], page: 1, page_size: 20, total: 0 } })
    mockedGet.mockClear()
  })

  it('expands one type of the term, paginated', async () => {
    await searchApi.listMatches({ search: '2026-03', result_type: 'vat_work_item', page: 2, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('2026-03')
    expect(params.get('result_type')).toBe('vat_work_item')
    expect(params.get('page')).toBe('2')
    expect(params.has('client_record_id')).toBe(false)
  })
})
