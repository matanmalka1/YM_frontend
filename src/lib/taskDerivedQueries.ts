import type { QueryClient } from '@tanstack/react-query'

const WORK_QUEUE_DERIVED_ROOT = ['work-queue'] as const

/** Refresh read models whose rows are derived from task state. */
export const invalidateTaskDerivedQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: WORK_QUEUE_DERIVED_ROOT })
