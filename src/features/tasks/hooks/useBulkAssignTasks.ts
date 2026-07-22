import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import { invalidateTaskDerivedQueries } from '@/lib/taskDerivedQueries'

export const useBulkAssignTasks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskIds,
      assigneeUserId,
      idempotencyKey,
    }: {
      taskIds: number[]
      assigneeUserId: number | null
      idempotencyKey: string
    }) => tasksApi.bulkAssign(taskIds, assigneeUserId, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQK.all })
      void invalidateTaskDerivedQueries(queryClient)
    },
  })
}
