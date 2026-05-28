import { useQuery } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'
import type { ListNotificationsParams } from '../api'

export const useNotifications = (clientId?: number, enabled = true) => {
  const params: ListNotificationsParams = clientId != null ? { client_record_id: clientId } : {}
  const { data, isLoading } = useQuery({
    enabled,
    queryKey: notificationsQK.list(params),
    queryFn: () => notificationsApi.listPaginated(params),
  })

  return { notifications: data?.items ?? [], isLoading }
}

export const useNotificationsPaginated = (params: ListNotificationsParams) => {
  return useQuery({
    queryKey: notificationsQK.list(params),
    queryFn: () => notificationsApi.listPaginated(params),
  })
}
