import { useCallback, useState } from 'react'
import { Send } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { Button } from '../../../../components/ui/primitives/Button'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { useNotifications } from '../../hooks/useNotifications'
import { useRole } from '../../../../hooks/useRole'
import { DrawerNotificationListItem } from '../list/NotificationListItem'
import { SendNotificationModal } from '../form/SendNotificationModal'
import { CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS } from '../../api'
import type { NotificationDrawerProps } from '../../types'

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

  return (
    <>
      <DetailDrawer
        open={open}
        title="התראות"
        onClose={handleClose}
        className="sm:max-w-sm"
        footer={
          isAdvisor || hasMore ? (
            <div className="space-y-3">
              {isAdvisor && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSendOpen(true)}
                  className="w-full justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Send className="h-3.5 w-3.5" />
                  שלח הודעה
                </Button>
              )}
              {hasMore && (
                <p className="text-center text-xs text-gray-400">
                  מוצגות {PAGE_SIZE_SM} ההתראות שנשלחו לאחרונה מתוך {total}
                </p>
              )}
            </div>
          ) : undefined
        }
      >
        <div className="-mx-6 -my-5 divide-y divide-gray-100">
          {notifications.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-400">אין התראות</p>}
          {notifications.map((item) => (
            <DrawerNotificationListItem key={item.id} item={item} />
          ))}
        </div>
      </DetailDrawer>

      {isAdvisor && (
        <SendNotificationModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          clientRecordId={clientRecordId}
          allowedTriggers={CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS}
        />
      )}
    </>
  )
}

NotificationDrawer.displayName = 'NotificationDrawer'
