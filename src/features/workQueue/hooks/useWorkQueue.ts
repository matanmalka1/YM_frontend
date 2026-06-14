import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { workQueueApi, workQueueQK, type WorkQueueParams } from '../api'

export const useWorkQueue = (params?: WorkQueueParams, enabled = true) =>
  useQuery({
    queryKey: workQueueQK.list(params),
    queryFn: () => workQueueApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
    staleTime: QUERY_STALE_TIME.short,
  })
