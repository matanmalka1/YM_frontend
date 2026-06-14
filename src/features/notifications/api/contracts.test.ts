import { describe, expect, it } from 'vitest'
import { isNotificationChannel, isNotificationStatus, isNotificationTrigger } from './contracts'

describe('notification contract guards', () => {
  it('accepts supported enum values', () => {
    expect(isNotificationStatus('sent')).toBe(true)
    expect(isNotificationTrigger('payment_reminder')).toBe(true)
    expect(isNotificationChannel('email')).toBe(true)
  })

  it('rejects missing and unsupported URL values', () => {
    expect(isNotificationStatus(null)).toBe(false)
    expect(isNotificationStatus('unknown')).toBe(false)
    expect(isNotificationTrigger('')).toBe(false)
    expect(isNotificationChannel('sms')).toBe(false)
  })
})
