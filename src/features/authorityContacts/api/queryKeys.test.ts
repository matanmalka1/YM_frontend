import { describe, expect, it } from 'vitest'
import { authorityContactsQK } from './queryKeys'

describe('authorityContactsQK', () => {
  it('keeps list keys prefixed by client for targeted invalidation', () => {
    const rootKey = authorityContactsQK.forClient(42)
    const listKey = authorityContactsQK.list(42, {
      contact_type: 'vat_branch',
      page: 2,
      page_size: 50,
    })

    expect(listKey).toEqual([
      'authority-contacts',
      'client',
      42,
      'list',
      {
        contact_type: 'vat_branch',
        page: 2,
        page_size: 50,
      },
    ])
    expect(listKey.slice(0, rootKey.length)).toEqual(rootKey)
  })
})
