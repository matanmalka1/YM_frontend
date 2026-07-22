import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { invalidateTaskDerivedQueries } from './taskDerivedQueries'

describe('invalidateTaskDerivedQueries', () => {
  it('invalidates the work queue read model after task mutations', async () => {
    const queryClient = new QueryClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await invalidateTaskDerivedQueries(queryClient)

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['work-queue'] })
  })
})
