import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { ClientTaskListParams } from '../api/contracts'

export const useClientTasks = (clientRecordId: number, params?: ClientTaskListParams) => {
  return useQuery({
    queryKey: tasksQK.clientList(clientRecordId, params),
    queryFn: () => tasksApi.listClientTasks(clientRecordId, params),
    enabled: !!clientRecordId,
  })
}
