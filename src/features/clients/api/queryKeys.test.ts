import { describe, expect, it } from 'vitest'
import { CLIENT_ENDPOINTS } from './endpoints'
import { clientsQK } from './queryKeys'

describe('clients API helpers', () => {
  it('encodes id number path segments in conflict endpoints', () => {
    expect(CLIENT_ENDPOINTS.clientConflictByIdNumber('12/34 56')).toBe('/clients/conflict/12%2F34%2056')
  })

  it('includes every impact preview input in the cache key', () => {
    expect(
      clientsQK.creationImpact({
        entity_type: 'osek_murshe',
        vat_reporting_frequency: 'monthly',
        advance_payment_frequency: 'monthly',
        advance_rate: '10.00',
      }),
    ).toEqual(['clients', 'creation-impact', 'osek_murshe', 'monthly', 'monthly', '10.00'])
  })

  it('keeps business list keys prefixed by client for targeted invalidation', () => {
    const rootKey = clientsQK.businesses(42)
    const pageKey = clientsQK.businesses(42, { page: 2, page_size: 50 })

    expect(pageKey).toEqual(['clients', 'businesses', 42, { page: 2, page_size: 50 }])
    expect(pageKey.slice(0, rootKey.length)).toEqual(rootKey)
  })
})
