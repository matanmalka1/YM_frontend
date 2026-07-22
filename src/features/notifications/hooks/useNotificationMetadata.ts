import { useQuery } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'

export const useNotificationMetadata = () =>
  useQuery({
    queryKey: notificationsQK.metadata,
    queryFn: notificationsApi.getMetadata,
  })
