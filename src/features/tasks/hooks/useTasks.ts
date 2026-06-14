import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { TaskListParams } from '../api/contracts'

export function useTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: tasksQK.list(params),
    queryFn: () => tasksApi.list(params),
  })
}
