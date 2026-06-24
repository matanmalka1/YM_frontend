import { useState } from 'react'
import { Send } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { useNotifications } from '../../hooks/useNotifications'
import { useNotificationsSummary } from '../../hooks/useNotificationsSummary'
import { useRole } from '../../../../hooks/useRole'
import { CompactNotificationListItem } from '../list/NotificationListItem'
import { SendNotificationModal } from '../form/SendNotificationModal'
import { CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS } from '../../api'
import { Button } from '../../../../components/ui/primitives/Button'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { DetailTabPanel } from '../../../../components/ui/layout'
import { InlineState } from '../../../../components/ui/feedback'
import type { NotificationsTabProps } from '../../types'
import { NOTIFICATIONS_MESSAGES } from '../../messages'
import { NOTIFICATIONS_ERROR_MESSAGES } from '../../errorMessages'

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ clientRecordId }) => {
  const { data, isLoading } = useNotifications({
    client_record_id: clientRecordId,
    page: FIRST_PAGE,
    page_size: PAGE_SIZE_MD,
  })
  const { data: summary } = useNotificationsSummary({ client_record_id: clientRecordId }, clientRecordId != null)
  const { isAdvisor } = useRole()
  const [sendOpen, setSendOpen] = useState(false)
  const notifications = data?.items ?? []

  return (
    <DetailTabPanel
      title={NOTIFICATIONS_MESSAGES.tab.title}
      subtitle={NOTIFICATIONS_MESSAGES.tab.subtitle}
      actions={
        isAdvisor && clientRecordId != null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Send className="h-4 w-4" />}
            onClick={() => setSendOpen(true)}
          >
            {NOTIFICATIONS_MESSAGES.actions.sendMessageShort}
          </Button>
        ) : null
      }
      summary={
        summary && summary.total > 0 ? (
          <div className="flex items-center gap-2">
            <Badge variant="positive" size="sm">
              {NOTIFICATIONS_MESSAGES.tab.sent(summary.sent)}
            </Badge>
            <Badge variant="warning" size="sm">
              {NOTIFICATIONS_MESSAGES.tab.pending(summary.pending)}
            </Badge>
            <Badge variant="negative" size="sm">
              {NOTIFICATIONS_ERROR_MESSAGES.tab.failed(summary.failed)}
            </Badge>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <p className="py-8 text-center text-sm text-gray-400">{NOTIFICATIONS_MESSAGES.tab.loading}</p>
      ) : notifications.length === 0 ? (
        <InlineState title={NOTIFICATIONS_MESSAGES.tab.emptyClient} />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200">
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
    </DetailTabPanel>
  )
}
NotificationsTab.displayName = 'NotificationsTab'
