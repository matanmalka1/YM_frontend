import { describe, expect, it } from 'vitest'
import type { SearchMatch, SearchMatchGroups } from '../api/contracts'
import { clientsPageFor, searchMatchChips } from './searchMatches'

const emptyGroup = { items: [], total: 0 }

const groups = (overrides: Partial<SearchMatchGroups> = {}): SearchMatchGroups => ({
  binders: emptyGroup,
  documents: emptyGroup,
  vat_work_items: emptyGroup,
  annual_reports: emptyGroup,
  advance_payments: emptyGroup,
  charges: emptyGroup,
  tasks: emptyGroup,
  notifications: emptyGroup,
  ...overrides,
})

const match = (overrides: Partial<SearchMatch> = {}): SearchMatch => ({
  result_type: 'task',
  id: 1,
  title: 'משימה',
  detail: null,
  status: null,
  amount: null,
  occurred_on: null,
  href: '/tasks/1',
  client_record_id: 7,
  client_name: 'לקוח',
  client_office_number: 7,
  ...overrides,
})

describe('searchMatchChips', () => {
  it('offers no chips when nothing matched', () => {
    expect(searchMatchChips(groups())).toEqual([])
  })

  it('offers one chip per type with matches, in display order', () => {
    const chips = searchMatchChips(
      groups({
        tasks: { items: [match()], total: 2 },
        binders: { items: [match({ result_type: 'binder' })], total: 1 },
      }),
    )

    expect(chips).toEqual([
      { type: 'binder', count: 1 },
      { type: 'task', count: 2 },
    ])
  })

  it('counts the exact total behind the preview, not the preview rows on screen', () => {
    const chips = searchMatchChips(groups({ charges: { items: [match({ result_type: 'charge' })], total: 61 } }))

    expect(chips).toEqual([{ type: 'charge', count: 61 }])
  })
})

describe('clientsPageFor', () => {
  it('pages the clients list while no type is expanded', () => {
    expect(clientsPageFor(null, 3)).toBe(3)
  })

  it('pins the clients list to its first page while a type is expanded', () => {
    expect(clientsPageFor('task', 3)).toBe(1)
  })
})
