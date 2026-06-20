import { Send } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { formatDateTime } from '@/utils/utils'
import type { NotificationDetail } from '../../api'
import { NOTIFICATION_STATUS_LABELS } from '../../constants'
import { getDomainLabel, getTriggerLabel } from '../list/NotificationsColumns'

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
    title={notification?.subject_snapshot || notification?.trigger_label || 'הודעה'}
    subtitle={notification ? formatDateTime(notification.created_at) : undefined}
    onClose={onClose}
    footer={
      notification && onSend ? (
        <div className="flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={onSend}>
            שליחת הודעה ללקוח
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : undefined
    }
  >
    {isLoading && <Alert variant="info" message="טוען את פרטי ההודעה..." />}
    {error ? <Alert variant="error" message="שגיאה בטעינת פרטי ההודעה" /> : null}
    {notification && (
      <div className="space-y-4">
        <DrawerSection title="פרטים">
          <DrawerField label="סוג" value={getTriggerLabel(notification)} />
          <DrawerField label="תחום" value={getDomainLabel(notification.domain_label)} />
          <DrawerField label="לקוח" value={notification.client_name ?? `#${notification.client_record_id}`} />
          <DrawerField label="נמען" value={notification.recipient ?? '—'} />
          <DrawerField label="סטטוס" value={NOTIFICATION_STATUS_LABELS[notification.status]} />
        </DrawerSection>
        <DrawerSection title="תוכן">
          <div className="whitespace-pre-wrap py-3 text-sm leading-7 text-gray-800">
            {notification.content_snapshot || 'תוכן ההודעה לא זמין'}
          </div>
        </DrawerSection>
      </div>
    )}
  </DetailDrawer>
)

NotificationDetailDrawer.displayName = 'NotificationDetailDrawer'
