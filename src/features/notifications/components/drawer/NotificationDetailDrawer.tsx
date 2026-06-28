import { Send } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { formatDateTime } from '@/utils/utils'
import type { NotificationDetail } from '../../api'
import { NOTIFICATION_STATUS_LABELS } from '../../constants'
import { getDomainLabel, getTriggerLabel } from '../list/NotificationsColumns'
import { NOTIFICATIONS_MESSAGES } from '../../messages'
import { NOTIFICATIONS_ERROR_MESSAGES } from '../../errorMessages'

interface NotificationDetailDrawerProps {
  open: boolean
  notification: NotificationDetail | undefined
  isLoading: boolean
  error: unknown
  onClose: () => void
  /** Pre-bound to the open notification's client; advisor-only (undefined hides the footer button). */
  onSend?: () => void
}

export const NotificationDetailDrawer = ({
  open,
  notification,
  isLoading,
  error,
  onClose,
  onSend,
}: NotificationDetailDrawerProps) => (
  <DetailDrawer
    open={open}
    title={notification?.subject_snapshot || notification?.trigger_label || NOTIFICATIONS_MESSAGES.detail.fallbackTitle}
    subtitle={notification ? formatDateTime(notification.created_at) : undefined}
    onClose={onClose}
    footer={
      notification && onSend ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Send className="h-4 w-4" />}
            iconPosition="end"
            onClick={onSend}
          >
            {NOTIFICATIONS_MESSAGES.actions.sendToClient}
          </Button>
        </div>
      ) : undefined
    }
  >
    {isLoading && <Alert variant="info" message={NOTIFICATIONS_MESSAGES.detail.loading} />}
    {error ? <Alert variant="error" message={NOTIFICATIONS_ERROR_MESSAGES.detail.loadError} /> : null}
    {notification && (
      <div className="space-y-4">
        <DrawerSection title={NOTIFICATIONS_MESSAGES.detail.sectionDetails}>
          <DefinitionList
            layout="stacked"
            items={[
              { label: NOTIFICATIONS_MESSAGES.detail.type, value: getTriggerLabel(notification) },
              { label: NOTIFICATIONS_MESSAGES.detail.domain, value: getDomainLabel(notification.domain_label) },
              {
                label: NOTIFICATIONS_MESSAGES.detail.client,
                value: notification.client_name ?? `#${notification.client_record_id}`,
              },
              { label: NOTIFICATIONS_MESSAGES.detail.recipient, value: notification.recipient ?? '—' },
              { label: NOTIFICATIONS_MESSAGES.detail.status, value: NOTIFICATION_STATUS_LABELS[notification.status] },
            ]}
          />
        </DrawerSection>
        <DrawerSection title={NOTIFICATIONS_MESSAGES.detail.sectionContent}>
          <div className="whitespace-pre-wrap py-3 text-sm leading-7 text-gray-800">
            {notification.content_snapshot || NOTIFICATIONS_MESSAGES.detail.contentUnavailable}
          </div>
        </DrawerSection>
      </div>
    )}
  </DetailDrawer>
)

NotificationDetailDrawer.displayName = 'NotificationDetailDrawer'
