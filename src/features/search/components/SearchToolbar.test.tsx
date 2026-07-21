import { renderToStaticMarkup } from 'react-dom/server'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { CLIENT_SEARCH_PLACEHOLDER, GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { SearchToolbar } from './SearchToolbar'

const render = () =>
  renderToStaticMarkup(
    <SearchToolbar inputRef={createRef<HTMLInputElement>()} queryDraft="" onQueryDraftChange={() => undefined} />,
  )

describe('SearchToolbar', () => {
  it('offers exactly one place to type', () => {
    const html = render()

    expect(html.match(/type="text"/g)).toHaveLength(1)
    expect(html).toContain(GLOBAL_SEARCH_PLACEHOLDER)
  })

  it('does not carry a second client search beside the one the page is', () => {
    expect(render()).not.toContain(CLIENT_SEARCH_PLACEHOLDER)
  })
})
