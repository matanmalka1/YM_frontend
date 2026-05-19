import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { workQueueApi, workQueueQK, type WorkQueueParams } from '../api'

export const useWorkQueue = (params?: WorkQueueParams, enabled = true) =>
  useQuery({
    queryKey: workQueueQK.list(params),
    queryFn: () => workQueueApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  })
