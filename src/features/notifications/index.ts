// Public surface of the notifications feature
export { notificationsApi, notificationsQK } from './api'
export { NotificationDrawer } from './components/NotificationDrawer'
export { NotificationsTab } from './components/NotificationsTab'
export { SendNotificationModal } from './components/SendNotificationModal'
export { useNotificationBell } from './hooks/useNotificationBell'
export { useSendNotification } from './hooks/useSendNotification'
export type {
  NotificationSeverity,
  NotificationItem,
  ListNotificationsParams,
  NotificationChannel,
  ManualSendPayload,
  ManualSendResponse,
} from './api'
