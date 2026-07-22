export const NOTIFICATION_ENDPOINTS = {
  notifications: '/notifications',
  metadata: '/notifications/metadata',
  notificationById: (notificationId: number) => `/notifications/${notificationId}`,
  notificationsPreview: '/notifications/preview',
  notificationsSend: '/notifications/send',
} as const
