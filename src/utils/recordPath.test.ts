import { describe, expect, it } from 'vitest'
import { toSiblingRecordPath } from './recordPath'

describe('toSiblingRecordPath', () => {
  it('swaps the record id on the standalone obligation routes', () => {
    expect(toSiblingRecordPath('/tax/vat/12', 34)).toBe('/tax/vat/34')
    expect(toSiblingRecordPath('/tax/reports/12', 34)).toBe('/tax/reports/34')
  })

  it('keeps a client-scoped visitor inside the client tab', () => {
    // Naming a route instead would send them to the standalone screen and drop
    // the tab, its breadcrumbs and its navigation.
    expect(toSiblingRecordPath('/clients/7/vat/12', 34)).toBe('/clients/7/vat/34')
    expect(toSiblingRecordPath('/clients/7/annual-reports/12', 34)).toBe('/clients/7/annual-reports/34')
    expect(toSiblingRecordPath('/clients/7/advance-payments/12', 34)).toBe('/clients/7/advance-payments/34')
  })

  it('keeps the client segment of the standalone advance-payments route', () => {
    // Regression: this path was built as `${backPath}/${id}`, and on this screen
    // backPath is the *list* path — so the client segment was dropped and the
    // route did not exist.
    expect(toSiblingRecordPath('/tax/advance-payments/7/12', 34)).toBe('/tax/advance-payments/7/34')
  })

  it('takes a pathname only, so a list query string cannot end up inside the path', () => {
    // Same regression, second half: appending to a backPath that carried
    // `?year=2026` produced `/tax/advance-payments?year=2026/34`.
    expect(toSiblingRecordPath('/tax/advance-payments/7/12', 34)).not.toContain('?')
  })

  it('replaces a trailing slash rather than appending after it', () => {
    expect(toSiblingRecordPath('/tax/vat/12/', 34)).toBe('/tax/vat/34')
  })
})
