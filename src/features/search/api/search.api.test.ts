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
        items: {
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

  it('sends broad text search as search', async () => {
    await searchApi.search({ search: 'רפאל', page: 1, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('רפאל')
    expect(params.has('query')).toBe(false)
    expect(params.has('client_name')).toBe(false)
    expect(params.has('client_search')).toBe(false)
  })

  it('sends selected client scope as client_record_id', async () => {
    await searchApi.search({ search: 'audit_report', client_record_id: 42 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('search')).toBe('audit_report')
    expect(params.get('client_record_id')).toBe('42')
    expect(params.has('client_name')).toBe(false)
  })

  it('sends binder capacity status filter', async () => {
    await searchApi.search({ binder_capacity_status: 'full', page: 1, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('binder_capacity_status')).toBe('full')
  })
})

describe('searchApi.listItems', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({ data: { items: [], page: 1, page_size: 20, total: 0 } })
    mockedGet.mockClear()
  })

  it('scopes an expanded group to one client and one type', async () => {
    await searchApi.listItems({ client_record_id: 7, result_type: 'vat_work_item', page: 2, page_size: 20 })

    const params = mockedGet.mock.calls[0]?.[1]?.params as URLSearchParams
    expect(params.get('client_record_id')).toBe('7')
    expect(params.get('result_type')).toBe('vat_work_item')
    expect(params.get('page')).toBe('2')
  })
})
