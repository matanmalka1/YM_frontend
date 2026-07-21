import { describe, expect, it } from 'vitest'
import { SEARCH_DROPPED_FILTER_KEYS, isSearchMatchType } from './searchUrlValues'
import { SEARCH_GROUP_TYPES } from '../constants'

describe('SEARCH_DROPPED_FILTER_KEYS', () => {
  it('strips every param the old page wrote — selection, enum filters, identifier inputs', () => {
    expect([...SEARCH_DROPPED_FILTER_KEYS].sort()).toEqual([
      'binder_capacity_status',
      'binder_location_status',
      'binder_number',
      'client_record_id',
      'client_status',
      'entity_type',
      'id_number',
    ])
  })

  it('does not strip the params the page still owns', () => {
    for (const key of ['search', 'type', 'page', 'page_size']) {
      expect(SEARCH_DROPPED_FILTER_KEYS).not.toContain(key)
    }
  })
})

describe('isSearchMatchType', () => {
  it.each(Object.values(SEARCH_GROUP_TYPES))('accepts %s', (type) => {
    expect(isSearchMatchType(type)).toBe(true)
  })

  it.each(['client', 'binders', 'TASK', 'bogus', ''])('rejects %s', (value) => {
    expect(isSearchMatchType(value)).toBe(false)
  })
})
