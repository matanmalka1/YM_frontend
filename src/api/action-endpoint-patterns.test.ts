import { describe, expect, it } from 'vitest'
import { ACTION_ENDPOINT_PATTERNS } from './action-endpoint-patterns'

const isAllowed = (endpoint: string) => ACTION_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint))

describe('ACTION_ENDPOINT_PATTERNS', () => {
  it('allows binder lifecycle action endpoints without API prefix', () => {
    expect(isAllowed('/binders/7/mark-ready-for-handover')).toBe(true)
    expect(isAllowed('/binders/7/handover-to-client')).toBe(true)
  })

  it('blocks removed auto-send endpoints', () => {
    expect(isAllowed('/annual-reports/144/client-reminder')).toBe(false)
    expect(isAllowed('/binders/7/handover-reminder')).toBe(false)
  })
})
