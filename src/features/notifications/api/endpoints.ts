export const NOTIFICATION_ENDPOINTS = {
  notifications: '/notifications',
  notificationById: (notificationId: number) => `/notifications/${notificationId}`,
  notificationsSummary: '/notifications/summary',
  notificationsPreview: '/notifications/preview',
  notificationsSend: '/notifications/send',
} as const
