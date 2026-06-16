import { describe, expect, it } from 'vitest'
import { getTotalPages } from './paginationUtils'

describe('getTotalPages', () => {
  it('returns 1 when total is 0', () => {
    expect(getTotalPages(0, 20)).toBe(1)
  })

  it('returns 1 when total is less than pageSize', () => {
    expect(getTotalPages(5, 20)).toBe(1)
  })

  it('returns 1 when total equals pageSize', () => {
    expect(getTotalPages(20, 20)).toBe(1)
  })

  it('rounds up when total exceeds pageSize', () => {
    expect(getTotalPages(21, 20)).toBe(2)
    expect(getTotalPages(40, 20)).toBe(2)
    expect(getTotalPages(41, 20)).toBe(3)
  })

  it('clamps a negative total to a single page', () => {
    // canonical guards with Math.max(0, total); negative totals never come from the API
    expect(getTotalPages(-5, 20)).toBe(1)
  })

  it('documents current pageSize=0 behavior (unguarded: division yields Infinity)', () => {
    // No project convention guards pageSize=0; callers always pass a positive constant.
    // Asserting current behavior so a future guard is a deliberate, test-visible change.
    expect(getTotalPages(10, 0)).toBe(Infinity)
  })
})
