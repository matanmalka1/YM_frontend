import { describe, expect, it } from 'vitest'
import { ACTION_ENDPOINT_PATTERNS } from './action-endpoint-patterns'

const isAllowed = (endpoint: string) => ACTION_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint))

describe('ACTION_ENDPOINT_PATTERNS', () => {
  it('allows dashboard reminder action endpoints without API prefix', () => {
    expect(isAllowed('/annual-reports/144/client-reminder')).toBe(true)
    expect(isAllowed('/binders/7/pickup-reminder')).toBe(true)
  })
})
