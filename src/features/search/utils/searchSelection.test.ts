import { describe, expect, it } from 'vitest'
import { nextFilterParams, resetFilterParams } from '@/hooks/useSearchParamFilters'
import type { PaginatedClientMatches, SearchClientMatch } from '../api/contracts'
import {
  SEARCH_RESOLUTION_FILTER_KEYS,
  clientSelectionUpdate,
  isResolutionFilterKey,
  resolutionFilterUpdate,
  resolveSelectedClient,
} from './searchSelection'

const match = (id: number, name: string): SearchClientMatch => ({
  id,
  office_client_number: id,
  name,
  id_number: `ID-${id}`,
  status: 'active',
  matched_binder_numbers: [],
  href: `/clients/${id}`,
})

const matches = (items: SearchClientMatch[], total = items.length): PaginatedClientMatches => ({
  items,
  page: 1,
  page_size: 20,
  total,
})

/** The URL a transition produces, as the page writes it: one atomic `setFilters` call. */
const urlAfter = (current: string, updates: Record<string, string>) =>
  nextFilterParams(new URLSearchParams(current), updates).toString()

describe('resolveSelectedClient', () => {
  it('selects the single client the filters resolved to', () => {
    expect(resolveSelectedClient(matches([match(7, 'לקוח א')]), null)?.id).toBe(7)
    expect(resolveSelectedClient(matches([match(7, 'לקוח א')]), 7)?.id).toBe(7)
  })

  it('selects nothing while the response still answers a different requested client', () => {
    expect(resolveSelectedClient(matches([match(7, 'לקוח א')]), 8)).toBeNull()
  })

  it('selects nothing while several clients match', () => {
    expect(resolveSelectedClient(matches([match(7, 'לקוח א'), match(8, 'לקוח ב')]), null)).toBeNull()
  })

  it('selects nothing when the filters resolved to no client', () => {
    expect(resolveSelectedClient(matches([], 0), null)).toBeNull()
  })

  it('selects nothing before the first response', () => {
    expect(resolveSelectedClient(undefined, null)).toBeNull()
  })

  it('never selects a client it cannot name, so no feed can be shown anonymously', () => {
    expect(resolveSelectedClient(matches([], 1), 7)).toBeNull()
  })
})

describe('client selection transitions', () => {
  it('picking a client keeps the term, adds the selection and restarts paging', () => {
    expect(urlAfter('search=רפאל&page=3', clientSelectionUpdate(7))).toBe(
      new URLSearchParams({ search: 'רפאל', page: '1', client_record_id: '7' }).toString(),
    )
  })

  it('switching client drops the previous client expanded type', () => {
    const url = urlAfter('search=רפאל&client_record_id=7&type=task&page=4', clientSelectionUpdate(8))

    expect(new URLSearchParams(url).get('client_record_id')).toBe('8')
    expect(new URLSearchParams(url).has('type')).toBe(false)
    expect(new URLSearchParams(url).get('page')).toBe('1')
  })

  it('clearing the client leaves the resolution filters alone', () => {
    const url = new URLSearchParams(urlAfter('search=רפאל&client_record_id=7&type=task', clientSelectionUpdate(null)))

    expect(url.has('client_record_id')).toBe(false)
    expect(url.has('type')).toBe(false)
    expect(url.get('search')).toBe('רפאל')
  })
})

describe('resolution filter transitions', () => {
  it('changing the term clears the selection, its type and its page in one write', () => {
    const url = new URLSearchParams(
      urlAfter('search=רפאל&client_record_id=7&type=task&page=4&page_size=20', resolutionFilterUpdate('search', 'משה')),
    )

    expect(url.get('search')).toBe('משה')
    expect(url.has('client_record_id')).toBe(false)
    expect(url.has('type')).toBe(false)
    expect(url.get('page')).toBe('1')
    expect(url.get('page_size')).toBe('20')
  })

  it('changing an advanced filter clears the selection too', () => {
    const url = new URLSearchParams(
      urlAfter('search=רפאל&client_record_id=7&type=task', resolutionFilterUpdate('client_status', 'frozen')),
    )

    expect(url.get('client_status')).toBe('frozen')
    expect(url.has('client_record_id')).toBe(false)
  })

  it('every filter that narrows client resolution invalidates the selection', () => {
    for (const key of SEARCH_RESOLUTION_FILTER_KEYS) {
      const url = new URLSearchParams(urlAfter('client_record_id=7&type=task', resolutionFilterUpdate(key, 'x')))

      expect(url.has('client_record_id'), key).toBe(false)
      expect(url.has('type'), key).toBe(false)
    }
  })

  it('writes a whitespace-only term as no term at all', () => {
    const url = new URLSearchParams(urlAfter('client_record_id=7', resolutionFilterUpdate('search', '   ')))

    expect(url.has('search')).toBe(false)
  })

  it('trims the term it writes', () => {
    const url = new URLSearchParams(urlAfter('', resolutionFilterUpdate('search', '  רפאל  ')))

    expect(url.get('search')).toBe('רפאל')
  })

  it('clearing a filter value clears the selection as well', () => {
    const url = new URLSearchParams(urlAfter('search=רפאל&client_record_id=7', resolutionFilterUpdate('search', '')))

    expect(url.has('search')).toBe(false)
    expect(url.has('client_record_id')).toBe(false)
  })

  it('treats the selection itself as a selection, not as a resolution filter', () => {
    expect(isResolutionFilterKey('client_record_id')).toBe(false)
    expect(isResolutionFilterKey('search')).toBe(true)
  })

  it('reset leaves no selection behind', () => {
    const url = new URLSearchParams(resetFilterParams().toString())

    expect(url.has('client_record_id')).toBe(false)
    expect(url.has('type')).toBe(false)
    expect(url.get('page')).toBe('1')
    expect(url.has('search')).toBe(false)
  })
})

describe('deep links and history navigation', () => {
  /** Selection is read from the response for the current URL only — nothing is remembered. */
  it('grants the feed to a deep-linked client the filters resolve to', () => {
    const client = resolveSelectedClient(matches([match(7, 'לקוח א')]), 7)

    expect(client?.name).toBe('לקוח א')
  })

  it('refuses the feed to a deep-linked client the filters exclude', () => {
    expect(resolveSelectedClient(matches([], 0), 7)).toBeNull()
  })

  it('re-derives the selection from each response, so going back cannot revive an old client', () => {
    const first = resolveSelectedClient(matches([match(7, 'לקוח א')]), 7)
    const second = resolveSelectedClient(matches([], 0), 7)
    const back = resolveSelectedClient(matches([match(7, 'לקוח א')]), 7)

    expect(first?.id).toBe(7)
    expect(second).toBeNull()
    expect(back?.id).toBe(7)
  })
})
