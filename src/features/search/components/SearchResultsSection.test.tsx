import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import type { SearchClientMatch, SearchMatch, SearchMatchGroups } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'
import { SearchResultsSection } from './SearchResultsSection'

const client: SearchClientMatch = {
  id: 7,
  office_client_number: 7,
  name: 'לקוח תואם',
  id_number: '123456782',
  status: 'active',
  matched_binder_numbers: [],
  href: '/clients/7',
}

const item: SearchMatch = {
  result_type: 'task',
  id: 1,
  title: 'משימה פתוחה',
  detail: null,
  status: null,
  amount: null,
  occurred_on: null,
  href: '/tasks/1',
  client_record_id: 7,
  client_name: 'לקוח תואם',
  client_office_number: 7,
}

const emptyGroup = { items: [], total: 0 }
const groups: SearchMatchGroups = {
  binders: emptyGroup,
  documents: emptyGroup,
  vat_work_items: emptyGroup,
  annual_reports: emptyGroup,
  advance_payments: emptyGroup,
  charges: emptyGroup,
  tasks: { items: [item], total: 1 },
  notifications: emptyGroup,
}

const baseProps: React.ComponentProps<typeof SearchResultsSection> = {
  status: { isLoading: false, isFetching: false, error: null },
  prompt: { visible: false },
  emptyState: { visible: false, onReset: () => undefined },
  clientMatches: { visible: false, clients: [], total: 0, pagination: null },
  matches: {
    visible: false,
    chips: [],
    activeType: null,
    onTypeChange: () => undefined,
    groups,
    expanded: null,
  },
}

const matchesProps = {
  visible: true,
  chips: [{ type: 'task' as const, count: 1 }],
  activeType: null,
  onTypeChange: () => undefined,
  groups,
  expanded: null,
}

/** Rows link out, so the markup needs a router around it. */
const render = (element: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>)

describe('SearchResultsSection', () => {
  it('shows both labelled sections at once — that is the point of the page', () => {
    const html = render(
      <SearchResultsSection
        {...baseProps}
        clientMatches={{ visible: true, clients: [client], total: 1, pagination: null }}
        matches={matchesProps}
      />,
    )

    expect(html).toContain(SEARCH_MESSAGES.clients.title)
    expect(html).toContain(SEARCH_MESSAGES.matches.title)
    expect(html).toContain(client.name)
    expect(html).toContain(item.title)
    expect(html).not.toContain(SEARCH_MESSAGES.page.emptyTitle)
  })

  it('shows record matches even when no client resolved', () => {
    const html = render(<SearchResultsSection {...baseProps} matches={matchesProps} />)

    expect(html).toContain(SEARCH_MESSAGES.matches.title)
    expect(html).not.toContain(SEARCH_MESSAGES.clients.title)
    expect(html).not.toContain(SEARCH_MESSAGES.page.emptyTitle)
  })

  it('shows the one no-match state when the term matched nothing at all', () => {
    const html = render(<SearchResultsSection {...baseProps} emptyState={{ visible: true, onReset: () => undefined }} />)

    expect(html).toContain(SEARCH_MESSAGES.page.emptyTitle)
    expect(html).toContain(SEARCH_MESSAGES.page.resetSearch)
    expect(html).not.toContain(item.title)
    expect(html).not.toContain(client.name)
  })

  it('shows the prompt while nothing is typed', () => {
    const html = render(<SearchResultsSection {...baseProps} prompt={{ visible: true }} />)

    expect(html).toContain(SEARCH_MESSAGES.page.promptTitle)
  })

  it('offers page navigation while more client matches exist than one page holds', () => {
    const html = render(
      <SearchResultsSection
        {...baseProps}
        clientMatches={{
          visible: true,
          clients: [client],
          total: 61,
          pagination: { page: 1, totalPages: 4, total: 61, onPageChange: () => undefined },
        }}
      />,
    )

    expect(html).toContain(GLOBAL_UI_MESSAGES.pagination.nav)
    expect(html).toContain('עמוד 1 מתוך 4')
  })

  it('offers no client pager while a type is expanded — page belongs to the expanded list', () => {
    const html = render(
      <SearchResultsSection {...baseProps} clientMatches={{ visible: true, clients: [client], total: 61, pagination: null }} />,
    )

    expect(html).not.toContain(GLOBAL_UI_MESSAGES.pagination.nav)
  })
})
