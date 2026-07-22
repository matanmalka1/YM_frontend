import type { ListNotificationsParams } from './contracts'

export const notificationsQK = {
  all: ['notifications'] as const,
  metadata: ['notifications', 'metadata'] as const,
  lists: () => [...notificationsQK.all, 'list'] as const,
  list: (params: ListNotificationsParams = {}) => [...notificationsQK.lists(), params] as const,
  details: () => [...notificationsQK.all, 'detail'] as const,
  detail: (notificationId: number) => [...notificationsQK.details(), notificationId] as const,
} as const
