import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { TaskListParams } from '../api/contracts'

export const useTasks = (params?: TaskListParams) => {
  return useQuery({
    queryKey: tasksQK.list(params),
    queryFn: () => tasksApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME.short,
  })
}
