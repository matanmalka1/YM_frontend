export const NOTIFICATION_ENDPOINTS = {
  notifications: '/notifications',
  notificationById: (notificationId: number) => `/notifications/${notificationId}`,
  notificationsPreview: '/notifications/preview',
  notificationsSend: '/notifications/send',
} as const
