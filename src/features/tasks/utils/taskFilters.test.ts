import { describe, expect, it } from 'vitest'
import { buildTaskListParams, getTaskFiltersFromSearchParams, hasTaskFilters } from './taskFilters'

describe('task URL filters', () => {
  it('parses search, client, sorting and valid enums', () => {
    const filters = getTaskFiltersFromSearchParams(
      new URLSearchParams('search=מסמכים&client_record_id=12&client_name=ישראל&status=open&sort_by=due_date&order=asc'),
    )

    expect(filters).toMatchObject({
      search: 'מסמכים',
      clientId: '12',
      clientName: 'ישראל',
      status: 'open',
      sortBy: 'due_date',
      order: 'asc',
    })
    expect(buildTaskListParams(2, filters)).toMatchObject({
      page: 2,
      client_record_id: 12,
      search: 'מסמכים',
      sort_by: 'due_date',
      order: 'asc',
    })
  })

  it('normalizes invalid external values and ignores default sorting as a filter', () => {
    const filters = getTaskFiltersFromSearchParams(
      new URLSearchParams('client_record_id=-4&status=invalid&sort_by=unknown&order=sideways'),
    )

    expect(filters).toMatchObject({ clientId: '', status: '', sortBy: 'created_at', order: 'desc' })
    expect(hasTaskFilters(filters)).toBe(false)
  })

  it('keeps a pinned client authoritative over URL state', () => {
    const filters = getTaskFiltersFromSearchParams(new URLSearchParams('client_record_id=12'))
    expect(buildTaskListParams(1, filters, 99).client_record_id).toBe(99)
  })
})
