import { Eye, Send } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import type { Column } from '@/components/ui/table'
import { formatDateTime } from '@/utils/utils'
import { TRIGGER_LABELS, type NotificationItem } from '@/features/notifications/api'
import {
  NOTIFICATION_DOMAIN_LABELS,
  NOTIFICATION_STATUS_LABELS,
  getNotificationStatusVariant,
} from '../../pages/NotificationsPage.constants'

const ENGLISH_TEXT_PATTERN = /[A-Za-z]/

export const getTriggerLabel = (item: Pick<NotificationItem, 'trigger' | 'trigger_label'>) =>
  item.trigger_label || TRIGGER_LABELS[item.trigger] || 'הודעה'

export const getDomainLabel = (domain: string | null | undefined) => {
  if (!domain) return 'כללי'
  if (NOTIFICATION_DOMAIN_LABELS[domain]) return NOTIFICATION_DOMAIN_LABELS[domain]
  return ENGLISH_TEXT_PATTERN.test(domain) ? 'כללי' : domain
}

interface BuildNotificationColumnsParams {
  isAdvisor: boolean
  onView: (id: number) => void
  onSend: (client: { id: number; name: string }) => void
}

export const buildNotificationColumns = ({
  isAdvisor,
  onView,
  onSend,
}: BuildNotificationColumnsParams): Column<NotificationItem>[] => [
  {
    key: 'created_at',
    header: 'תאריך',
    render: (item) => <span className="text-sm text-gray-700">{formatDateTime(item.created_at)}</span>,
  },
  {
    key: 'trigger',
    header: 'סוג',
    render: (item) => (
      <div className="min-w-0 text-right">
        <div className="text-sm font-medium text-gray-900">{getTriggerLabel(item)}</div>
        <div className="text-xs text-gray-400">{getDomainLabel(item.domain_label)}</div>
      </div>
    ),
  },
  {
    key: 'client',
    header: 'לקוח',
    render: (item) => <span className="text-sm text-gray-700">{item.client_name ?? `#${item.client_record_id}`}</span>,
  },
  {
    key: 'status',
    header: 'סטטוס',
    render: (item) => (
      <Badge variant={getNotificationStatusVariant(item.status)} size="sm">
        {NOTIFICATION_STATUS_LABELS[item.status]}
      </Badge>
    ),
  },
  {
    key: 'recipient',
    header: 'נמען',
    render: (item) => <span className="text-sm text-gray-600">{item.recipient ?? '—'}</span>,
  },
  {
    key: 'actions',
    header: '',
    align: 'center',
    render: (item) => (
      <RowActionsMenu ariaLabel="פעולות הודעה">
        <RowActionItem label="צפייה בפרטים" icon={<Eye className="h-4 w-4" />} onClick={() => onView(item.id)} />
        {isAdvisor && (
          <RowActionItem
            label="שליחת הודעה ללקוח"
            icon={<Send className="h-4 w-4" />}
            onClick={() => onSend({ id: item.client_record_id, name: item.client_name ?? `#${item.client_record_id}` })}
          />
        )}
      </RowActionsMenu>
    ),
  },
]
