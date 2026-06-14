import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { notificationsApi, notificationsQK } from '../api'
import type { ListNotificationsParams } from '../api'

export const useNotifications = (params: ListNotificationsParams = {}, enabled = true) => {
  return useQuery({
    enabled,
    queryKey: notificationsQK.list(params),
    queryFn: () => notificationsApi.listPaginated(params),
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME.short,
  })
}
