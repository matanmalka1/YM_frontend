import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import type { SearchClientMatch, SearchItem } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'
import { SearchResultsSection } from './SearchResultsSection'

const client: SearchClientMatch = {
  id: 7,
  office_client_number: 7,
  name: 'לקוח נבחר',
  id_number: '123456782',
  status: 'active',
  matched_binder_numbers: [],
  href: '/clients/7',
}

const item: SearchItem = {
  result_type: 'task',
  id: 1,
  title: 'משימה פתוחה',
  detail: null,
  status: 'open',
  amount: null,
  occurred_on: null,
  href: '/tasks/1',
}

const baseProps = {
  status: { isLoading: false, isFetching: false, error: null },
  prompt: { visible: false },
  emptyState: { visible: false, onReset: () => undefined },
  clientMatches: { visible: false, clients: [], total: 0, onSelect: () => undefined, pagination: null },
}

const feed = {
  chips: [{ type: 'task' as const, count: 1 }],
  activeType: null,
  onTypeChange: () => undefined,
  items: [item],
  isLoading: false,
  pagination: null,
}

/** Rows and the client heading link out, so the markup needs a router around it. */
const render = (element: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>)

describe('SearchResultsSection', () => {
  it('shows the resolved client above its feed', () => {
    const html = render(<SearchResultsSection {...baseProps} selected={{ client, onChange: null, feed }} />)

    expect(html).toContain(client.name)
    expect(html).toContain(item.title)
    expect(html).not.toContain(SEARCH_MESSAGES.page.emptyTitle)
  })

  it('shows the empty state alone when the filters resolved to no client', () => {
    const html = render(
      <SearchResultsSection {...baseProps} emptyState={{ visible: true, onReset: () => undefined }} selected={null} />,
    )

    expect(html).toContain(SEARCH_MESSAGES.page.emptyTitle)
    expect(html).not.toContain(item.title)
    expect(html).not.toContain(client.name)
  })

  it('offers page navigation while more matches exist than one page holds', () => {
    const html = render(
      <SearchResultsSection
        {...baseProps}
        clientMatches={{
          visible: true,
          clients: [client],
          total: 61,
          onSelect: () => undefined,
          pagination: { page: 1, totalPages: 4, total: 61, onPageChange: () => undefined },
        }}
        selected={null}
      />,
    )

    expect(html).toContain(GLOBAL_UI_MESSAGES.pagination.nav)
    expect(html).toContain('עמוד 1 מתוך 4')
  })

  it('offers no page navigation when every match is already on screen', () => {
    const html = render(
      <SearchResultsSection
        {...baseProps}
        clientMatches={{
          visible: true,
          clients: [client],
          total: 2,
          onSelect: () => undefined,
          pagination: { page: 1, totalPages: 1, total: 2, onPageChange: () => undefined },
        }}
        selected={null}
      />,
    )

    expect(html).not.toContain(GLOBAL_UI_MESSAGES.pagination.nav)
  })

  it('renders no feed without the client it belongs to', () => {
    const html = render(<SearchResultsSection {...baseProps} selected={null} />)

    expect(html).not.toContain(item.title)
    expect(html).not.toContain(SEARCH_MESSAGES.feed.allTypes)
  })
})
