import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { notificationsApi, notificationsQK } from '../api'
import type { NotificationSummaryParams } from '../api'

export const useNotificationsSummary = (params: NotificationSummaryParams = {}, enabled = true) => {
  return useQuery({
    enabled,
    queryKey: notificationsQK.summary(params),
    queryFn: () => notificationsApi.getSummary(params),
    staleTime: QUERY_STALE_TIME.short,
  })
}
