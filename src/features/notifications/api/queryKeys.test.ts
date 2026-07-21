import { describe, expect, it } from 'vitest'
import { notificationsQK } from './queryKeys'

describe('notifications query keys', () => {
  it('exposes stable list and detail invalidation roots', () => {
    expect(notificationsQK.list({ status: 'sent' }).slice(0, 2)).toEqual(notificationsQK.lists())
    expect(notificationsQK.detail(42).slice(0, 2)).toEqual(notificationsQK.details())
  })
})
