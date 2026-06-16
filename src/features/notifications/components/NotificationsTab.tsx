import { useState } from 'react'
import { Send } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { useNotifications } from '../hooks/useNotifications'
import { useNotificationsSummary } from '../hooks/useNotificationsSummary'
import { useRole } from '../../../hooks/useRole'
import { CompactNotificationListItem } from './NotificationListItem'
import { SendNotificationModal } from './SendNotificationModal'
import { CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS } from '../api'
import { Button } from '../../../components/ui/primitives/Button'
import { Badge } from '../../../components/ui/primitives/Badge'
import type { NotificationsTabProps } from '../types'

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ clientRecordId }) => {
  const { data, isLoading } = useNotifications({
    client_record_id: clientRecordId,
    page: FIRST_PAGE,
    page_size: PAGE_SIZE_MD,
  })
  const { data: summary } = useNotificationsSummary(
    { client_record_id: clientRecordId },
    clientRecordId != null,
  )
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const notifications = data?.items ?? []

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-8 text-center">טוען התראות...</p>
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">התראות לקוח</h3>
        {isAdvisor && clientRecordId != null && (
          <Button type="button" variant="outline" size="sm" onClick={() => setSendOpen(true)} className="gap-1.5">
            <Send className="h-4 w-4" />
            שלח הודעה
          </Button>
        )}
      </div>

      {summary && summary.total > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">נשלחו: {summary.sent}</Badge>
          <Badge variant="warning" size="sm">בהמתנה: {summary.pending}</Badge>
          <Badge variant="error" size="sm">נכשלו: {summary.failed}</Badge>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">אין התראות ללקוח זה</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {notifications.map((item) => (
            <CompactNotificationListItem key={item.id} item={item} />
          ))}
        </ul>
      )}

      {isAdvisor && clientRecordId != null && (
        <SendNotificationModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          clientRecordId={clientRecordId}
          allowedTriggers={CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS}
        />
      )}
    </div>
  )
}
NotificationsTab.displayName = 'NotificationsTab'
