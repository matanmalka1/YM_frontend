import { describe, expect, it } from 'vitest'
import { SEARCH_ENUM_FILTER_KEYS, parseSearchEnumFilters, type SearchEnumFilterKey } from './searchUrlValues'

const raw = (overrides: Partial<Record<SearchEnumFilterKey, string>> = {}) => ({
  client_status: '',
  entity_type: '',
  binder_location_status: '',
  binder_capacity_status: '',
  ...overrides,
})

describe('parseSearchEnumFilters', () => {
  it('passes every supported value through', () => {
    const { values, invalidKeys } = parseSearchEnumFilters(
      raw({
        client_status: 'frozen',
        entity_type: 'company_ltd',
        binder_location_status: 'handed_over',
        binder_capacity_status: 'full',
      }),
    )

    expect(values).toEqual({
      client_status: 'frozen',
      entity_type: 'company_ltd',
      binder_location_status: 'handed_over',
      binder_capacity_status: 'full',
    })
    expect(invalidKeys).toEqual([])
  })

  it('reads an absent filter as "all" without calling it invalid', () => {
    const { values, invalidKeys } = parseSearchEnumFilters(raw())

    expect(values.client_status).toBe('')
    expect(invalidKeys).toEqual([])
  })

  it.each(SEARCH_ENUM_FILTER_KEYS)('drops an unsupported %s instead of sending it', (key) => {
    const { values, invalidKeys } = parseSearchEnumFilters(raw({ [key]: 'bogus' }))

    expect(values[key]).toBe('')
    expect(invalidKeys).toEqual([key])
  })

  it('reports every unsupported value, so one write can clean them all', () => {
    const { invalidKeys } = parseSearchEnumFilters(raw({ client_status: 'bogus', binder_capacity_status: 'archived', entity_type: 'osek_patur' }))

    expect(invalidKeys).toEqual(['client_status', 'binder_capacity_status'])
  })

  it('does not accept a value that differs only in case', () => {
    const { values, invalidKeys } = parseSearchEnumFilters(raw({ client_status: 'ACTIVE' }))

    expect(values.client_status).toBe('')
    expect(invalidKeys).toEqual(['client_status'])
  })

  it('keeps the valid filters when another one is unsupported', () => {
    const { values } = parseSearchEnumFilters(raw({ client_status: 'active', entity_type: 'bogus' }))

    expect(values.client_status).toBe('active')
    expect(values.entity_type).toBe('')
  })
})
