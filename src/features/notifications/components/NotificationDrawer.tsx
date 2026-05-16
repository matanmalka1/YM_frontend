import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { Button } from '../../../components/ui/primitives/Button'
import { useNotifications } from '../hooks/useNotifications'
import { useEscapeToClose } from '../../../components/ui/overlays/useEscapeToClose'
import { useRole } from '../../../hooks/useRole'
import { SeverityBadge } from './SeverityBadge'
import { SendNotificationModal } from './SendNotificationModal'
import type { NotificationDrawerProps } from '../types'

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose, clientRecordId }) => {
  const { notifications } = useNotifications()
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const limited = notifications.slice(0, 20)

  useEscapeToClose({ open, onClose })

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="התראות"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">התראות</h3>
          <div className="flex items-center gap-3">
            {isAdvisor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSendOpen(true)}
                className="gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-0 hover:bg-transparent"
              >
                <Send className="h-3.5 w-3.5" />
                שלח הודעה
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="סגירה" className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {limited.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">אין התראות</p>}
          {limited.map((item) => (
            <div key={item.id} className="w-full text-right px-5 py-4 flex flex-row gap-3 items-start">
              <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                <SeverityBadge severity={item.severity} />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {item.client_name && <span className="text-xs font-semibold text-gray-900">{item.client_name}</span>}
                {item.business_name && <span className="text-xs text-gray-500">{item.business_name}</span>}
                <p className="text-sm text-gray-800 leading-relaxed whitespace-normal break-words">
                  {item.content_snapshot}
                </p>
                {item.recipient && <span className="text-xs text-gray-500">נשלח ל: {item.recipient}</span>}
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleString('he-IL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdvisor && (
        <SendNotificationModal open={sendOpen} onClose={() => setSendOpen(false)} clientRecordId={clientRecordId} />
      )}
    </>
  )
}

NotificationDrawer.displayName = 'NotificationDrawer'
