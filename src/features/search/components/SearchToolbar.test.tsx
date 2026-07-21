import { renderToStaticMarkup } from 'react-dom/server'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CLIENT_SEARCH_PLACEHOLDER, GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { SearchFilters } from '../types'
import { SearchToolbar } from './SearchToolbar'

const filters: SearchFilters = {
  search: '',
  client_record_id: '',
  client_status: '',
  entity_type: '',
  binder_location_status: '',
  binder_capacity_status: '',
  page: 1,
  page_size: 20,
}

const render = (advancedFiltersOpen = false) =>
  renderToStaticMarkup(
    <SearchToolbar
      inputRef={createRef<HTMLInputElement>()}
      queryDraft=""
      onQueryDraftChange={() => undefined}
      filters={filters}
      onFilterChange={() => undefined}
      onReset={() => undefined}
      advancedFiltersOpen={advancedFiltersOpen}
      onToggleAdvancedFilters={() => undefined}
    />,
  )

describe('SearchToolbar', () => {
  it('offers exactly one place to type, open or closed', () => {
    for (const html of [render(false), render(true)]) {
      expect(html.match(/type="text"/g)).toHaveLength(1)
      expect(html).toContain(GLOBAL_SEARCH_PLACEHOLDER)
    }
  })

  it('does not carry a second client search beside the one the page is', () => {
    expect(render(true)).not.toContain(CLIENT_SEARCH_PLACEHOLDER)
  })
})
