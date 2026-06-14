import { describe, expect, it } from 'vitest'
import { notificationsQK } from './queryKeys'

describe('notifications query keys', () => {
  it('includes every summary filter in the cache key', () => {
    expect(notificationsQK.summary({ business_id: 5 })).not.toEqual(notificationsQK.summary({ client_record_id: 5 }))
  })

  it('exposes stable list and detail invalidation roots', () => {
    expect(notificationsQK.list({ status: 'sent' }).slice(0, 2)).toEqual(notificationsQK.lists())
    expect(notificationsQK.detail(42).slice(0, 2)).toEqual(notificationsQK.details())
  })
})
