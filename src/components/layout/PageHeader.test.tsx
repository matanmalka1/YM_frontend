import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SectionHeader } from '../ui/layout/SectionHeader'
import { PageHeader } from './PageHeader'

describe('PageHeader heading semantics', () => {
  it('renders the page title as h1 even in the compact (md) visual size', () => {
    const html = renderToStaticMarkup(<PageHeader title="כותרת עמוד" />)
    expect(html).toContain('<h1')
    expect(html).toContain('text-xl')
    expect(html).not.toContain('<h2')
  })

  it('renders the comfortable density title as h1 with the lg visuals', () => {
    const html = renderToStaticMarkup(<PageHeader title="כותרת" density="comfortable" />)
    expect(html).toContain('<h1')
    expect(html).toContain('md:text-3xl')
  })
})

describe('SectionHeader default heading levels', () => {
  it('keeps non-page headers below h1', () => {
    expect(renderToStaticMarkup(<SectionHeader title="כרטיס" />)).toContain('<h3')
    expect(renderToStaticMarkup(<SectionHeader title="סקציה" size="md" />)).toContain('<h2')
    expect(renderToStaticMarkup(<SectionHeader title="תווית" size="xs" />)).toContain('<p')
  })
})
