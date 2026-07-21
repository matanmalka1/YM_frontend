import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { SearchMatch, SearchMatchGroups } from '../api/contracts'
import { SEARCH_MESSAGES } from '../messages'
import { searchMatchChips } from '../utils/searchMatches'
import { SearchMatchesSection } from './SearchMatchesSection'

const emptyGroup = { items: [], total: 0 }

const match = (overrides: Partial<SearchMatch> = {}): SearchMatch => ({
  result_type: 'task',
  id: 1,
  title: 'משימה פתוחה',
  detail: null,
  status: null,
  amount: null,
  occurred_on: null,
  href: '/tasks/1',
  client_record_id: 7,
  client_name: 'ישראל ישראלי',
  client_office_number: 42,
  ...overrides,
})

const groups: SearchMatchGroups = {
  binders: emptyGroup,
  documents: emptyGroup,
  vat_work_items: emptyGroup,
  annual_reports: emptyGroup,
  advance_payments: emptyGroup,
  charges: { items: [match({ result_type: 'charge', id: 3, title: '1204', href: '/charges/3' })], total: 61 },
  tasks: { items: [match()], total: 1 },
  notifications: emptyGroup,
}

const render = (element: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>)

describe('SearchMatchesSection', () => {
  it('previews only the non-empty groups, under their type headings', () => {
    const html = render(
      <SearchMatchesSection
        chips={searchMatchChips(groups)}
        activeType={null}
        onTypeChange={() => undefined}
        groups={groups}
        expanded={null}
      />,
    )

    expect(html).toContain(SEARCH_MESSAGES.matches.title)
    expect(html).toContain(SEARCH_MESSAGES.matches.allTypes)
    expect(html).toContain(SEARCH_MESSAGES.matches.typeLabels.charge)
    expect(html).toContain(SEARCH_MESSAGES.matches.typeLabels.task)
    expect(html).not.toContain(SEARCH_MESSAGES.matches.typeLabels.binder)
    expect(html).toContain('משימה פתוחה')
    expect(html).toContain('1204')
  })

  it('shows the exact total behind a preview, not the preview size', () => {
    const html = render(
      <SearchMatchesSection
        chips={searchMatchChips(groups)}
        activeType={null}
        onTypeChange={() => undefined}
        groups={groups}
        expanded={null}
      />,
    )

    expect(html).toContain('61')
  })

  it('names every row’s client — matches from every client share one list', () => {
    const html = render(
      <SearchMatchesSection
        chips={searchMatchChips(groups)}
        activeType={null}
        onTypeChange={() => undefined}
        groups={groups}
        expanded={null}
      />,
    )

    expect(html).toContain('ישראל ישראלי')
    expect(html).toContain('42')
  })

  it('swaps the previews for the expanded list while a chip is active', () => {
    const html = render(
      <SearchMatchesSection
        chips={searchMatchChips(groups)}
        activeType="charge"
        onTypeChange={() => undefined}
        groups={groups}
        expanded={{
          items: [match({ result_type: 'charge', id: 9, title: '9001', href: '/charges/9' })],
          isLoading: false,
          pagination: null,
        }}
      />,
    )

    expect(html).toContain('9001')
    // The previews' rows and headings are gone — only the expanded type's list remains.
    expect(html).not.toContain('משימה פתוחה')
  })
})
