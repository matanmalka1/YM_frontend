import { useQuery } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'

export const useNotifications = (clientId?: number) => {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationsQK.list(clientId != null ? { client_record_id: clientId } : {}),
    queryFn: () => notificationsApi.list(clientId != null ? { client_record_id: clientId } : undefined),
  })

  return { notifications, isLoading }
}
