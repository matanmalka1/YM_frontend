import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import { invalidateTaskDerivedQueries } from '@/lib/taskDerivedQueries'

export const useBulkCompleteTasks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskIds, idempotencyKey }: { taskIds: number[]; idempotencyKey: string }) =>
      tasksApi.bulkComplete(taskIds, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQK.all })
      void invalidateTaskDerivedQueries(queryClient)
    },
  })
}
