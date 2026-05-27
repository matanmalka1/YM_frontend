import type { NotificationItem } from '../api'
import { formatDateTime } from '../../../utils/utils'

interface NotificationListItemBaseProps {
  item: NotificationItem
}

const NotificationRecipient: React.FC<NotificationListItemBaseProps> = ({ item }) =>
  item.recipient ? <span className="text-xs text-gray-500">נשלח ל: {item.recipient}</span> : null

const TriggerLabel: React.FC<NotificationListItemBaseProps> = ({ item }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
    {item.trigger_label}
  </span>
)

export const CompactNotificationListItem: React.FC<NotificationListItemBaseProps> = ({ item }) => (
  <li className="px-4 py-3 flex flex-col gap-1 bg-white">
    <div className="flex items-center gap-2">
      <TriggerLabel item={item} />
    </div>
    <p className="text-sm text-gray-800">{item.content_snapshot}</p>
    <NotificationRecipient item={item} />
    <span className="text-xs text-gray-400">{formatDateTime(item.created_at)}</span>
  </li>
)

export const DrawerNotificationListItem: React.FC<NotificationListItemBaseProps> = ({ item }) => (
  <div className="w-full text-right px-5 py-4 flex flex-row gap-3 items-start">
    <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
      <TriggerLabel item={item} />
    </div>
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      {item.client_name && <span className="text-xs font-semibold text-gray-900">{item.client_name}</span>}
      {item.business_name && <span className="text-xs text-gray-500">{item.business_name}</span>}
      <p className="text-sm text-gray-800 leading-relaxed whitespace-normal break-words">{item.content_snapshot}</p>
      <NotificationRecipient item={item} />
      <span className="text-xs text-gray-400">{formatDateTime(item.created_at)}</span>
    </div>
  </div>
)

CompactNotificationListItem.displayName = 'CompactNotificationListItem'
DrawerNotificationListItem.displayName = 'DrawerNotificationListItem'
