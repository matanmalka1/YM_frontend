import { useQuery } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'

export const useNotificationDetail = (notificationId: number | null) => {
  return useQuery({
    enabled: notificationId != null,
    queryKey: notificationsQK.detail(notificationId ?? 0),
    queryFn: () => notificationsApi.getById(notificationId as number),
  })
}
