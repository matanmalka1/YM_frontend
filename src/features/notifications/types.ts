export interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  clientRecordId?: number
}

export interface NotificationsTabProps {
  clientRecordId?: number
  businessId?: number
}
