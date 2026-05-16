import { useState } from 'react'
import { Send } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useRole } from '../../../hooks/useRole'
import { SeverityBadge } from './SeverityBadge'
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
            <li key={item.id} className="px-4 py-3 flex flex-col gap-1 bg-white">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={item.severity} />
              </div>
              <p className="text-sm text-gray-800">{item.content_snapshot}</p>
              {item.recipient && <span className="text-xs text-gray-500">נשלח ל: {item.recipient}</span>}
              <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('he-IL')}</span>
            </li>
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
