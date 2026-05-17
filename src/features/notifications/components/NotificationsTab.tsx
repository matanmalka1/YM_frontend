import { useState } from 'react'
import { Send } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useRole } from '../../../hooks/useRole'
import { CompactNotificationListItem } from './NotificationListItem'
import { SendNotificationModal } from './SendNotificationModal'
import { Button } from '../../../components/ui/primitives/Button'
import type { NotificationsTabProps } from '../types'

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ clientRecordId }) => {
  const { notifications, isLoading } = useNotifications(clientRecordId)
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const limited = notifications.slice(0, 50)

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

      {limited.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">אין התראות ללקוח זה</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {limited.map((item) => (
            <CompactNotificationListItem key={item.id} item={item} />
          ))}
        </ul>
      )}

      {isAdvisor && clientRecordId != null && (
        <SendNotificationModal open={sendOpen} onClose={() => setSendOpen(false)} clientRecordId={clientRecordId} />
      )}
    </div>
  )
}
NotificationsTab.displayName = 'NotificationsTab'
