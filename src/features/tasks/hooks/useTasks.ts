import { useQuery } from '@tanstack/react-query'
import { tasksApi, tasksQK, type TaskListParams } from '../api'

export const useTasks = (params?: TaskListParams, enabled = true) =>
  useQuery({
    queryKey: tasksQK.list(params),
    queryFn: () => tasksApi.list(params),
    enabled,
  })
