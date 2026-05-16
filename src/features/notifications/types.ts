import type { NotificationSeverity } from './api'

export interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  clientRecordId?: number
}

export interface NotificationsTabProps {
  clientRecordId?: number
  businessId?: number
}

export interface SeverityBadgeProps {
  severity: NotificationSeverity
}
