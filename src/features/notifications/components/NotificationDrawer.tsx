import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { cn } from '../../../utils/utils'
import { Button } from '../../../components/ui/primitives/Button'
import { useNotifications } from '../hooks/useNotifications'
import { useEscapeToClose } from '../../../components/ui/overlays/useEscapeToClose'
import { useRole } from '../../../hooks/useRole'
import { DrawerNotificationListItem } from './NotificationListItem'
import { SendNotificationModal } from './SendNotificationModal'
import { ENABLED_NOTIFICATION_TRIGGERS } from '../api'
import type { NotificationDrawerProps } from '../types'

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose, clientRecordId }) => {
  const { data } = useNotifications(
    {
      client_record_id: clientRecordId,
      status: 'sent',
      page: FIRST_PAGE,
      page_size: PAGE_SIZE_SM,
    },
    open,
  )
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const notifications = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = total > PAGE_SIZE_SM

  const handleClose = useCallback(() => {
    setSendOpen(false)
    onClose()
  }, [onClose])

  useEscapeToClose({ open, onClose: handleClose })

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  if (typeof document === 'undefined') return null
  if (!open && !sendOpen) return null

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-sm',
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
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} aria-label="סגירה" className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">אין התראות</p>}
          {notifications.map((item) => (
            <DrawerNotificationListItem key={item.id} item={item} />
          ))}
        </div>
        {hasMore && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-2 text-center text-xs text-gray-400">
            מוצגות {PAGE_SIZE_SM} ההתראות שנשלחו לאחרונה מתוך {total}
          </div>
        )}
      </div>

      {isAdvisor && (
        <SendNotificationModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          clientRecordId={clientRecordId}
          allowedTriggers={ENABLED_NOTIFICATION_TRIGGERS}
        />
      )}
    </>,
    document.body,
  )
}

NotificationDrawer.displayName = 'NotificationDrawer'
