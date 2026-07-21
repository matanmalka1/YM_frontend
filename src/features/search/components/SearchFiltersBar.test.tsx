import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { SearchFilters } from '../types'
import { SearchFiltersBar } from './SearchFiltersBar'

const filters: SearchFilters = {
  search: '',
  client_record_id: '',
  id_number: '',
  binder_number: '',
  client_status: '',
  entity_type: '',
  binder_location_status: '',
  binder_capacity_status: '',
  page: 1,
  page_size: 20,
}

const render = (isOpen: boolean, overrides: Partial<SearchFilters> = {}) =>
  renderToStaticMarkup(
    <SearchFiltersBar
      filters={{ ...filters, ...overrides }}
      textDrafts={{
        id_number: { value: '', onChange: () => undefined },
        binder_number: { value: '', onChange: () => undefined },
      }}
      hydratedClient={null}
      onFilterChange={() => undefined}
      onReset={() => undefined}
      isOpen={isOpen}
      onToggle={() => undefined}
    />,
  )

describe('SearchFiltersBar', () => {
  it('reports the collapsed panel it controls', () => {
    const html = render(false)

    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="search-advanced-filters"')
    expect(html).toContain('id="search-advanced-filters"')
    expect(html).toContain('hidden=""')
  })

  it('reports the panel as expanded once open', () => {
    const html = render(true)

    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('id="search-advanced-filters"')
    expect(html).not.toContain('hidden=""')
  })

  it('keeps the panel a real element while collapsed, so aria-controls resolves', () => {
    const collapsed = render(false)

    // The fields are in the document but hidden — a dangling `aria-controls` target would be
    // worse than rendering them.
    expect(collapsed).toContain('search-advanced-filters')
    expect(collapsed).toContain('סטטוס לקוח')
  })

  it('counts the active advanced filters on the toggle', () => {
    const html = render(false, { client_status: 'active', binder_capacity_status: 'full' })

    expect(html).toContain('>2<')
  })
})
