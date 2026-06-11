export const notificationsQK = {
  all: ['notifications'] as const,
  list: (params?: object) => ['notifications', 'list', params ?? {}] as const,
  detail: (notificationId: number) => ['notifications', 'detail', notificationId] as const,
  summary: (clientId?: number) => ['notifications', 'summary', clientId ?? 'global'] as const,
} as const
