import { Eye, Send } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import type { Column } from '@/components/ui/table'
import { formatDateTime } from '@/utils/utils'
import { TRIGGER_LABELS, type NotificationItem } from '../../api'
import { NOTIFICATION_DOMAIN_LABELS, NOTIFICATION_STATUS_LABELS, getNotificationStatusVariant } from '../../constants'
import { NOTIFICATIONS_MESSAGES } from '../../messages'

const ENGLISH_TEXT_PATTERN = /[A-Za-z]/

export const getTriggerLabel = (item: Pick<NotificationItem, 'trigger' | 'trigger_label'>) =>
  item.trigger_label || TRIGGER_LABELS[item.trigger] || NOTIFICATIONS_MESSAGES.columns.fallbackTrigger

export const getDomainLabel = (domain: string | null | undefined) => {
  if (!domain) return NOTIFICATIONS_MESSAGES.columns.fallbackDomain
  if (NOTIFICATION_DOMAIN_LABELS[domain]) return NOTIFICATION_DOMAIN_LABELS[domain]
  return ENGLISH_TEXT_PATTERN.test(domain) ? NOTIFICATIONS_MESSAGES.columns.fallbackDomain : domain
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
    header: NOTIFICATIONS_MESSAGES.columns.date,
    render: (item) => formatDateTime(item.created_at),
  },
  {
    key: 'trigger',
    header: NOTIFICATIONS_MESSAGES.columns.type,
    render: (item) => (
      <div className="min-w-0 text-right">
        <div className="font-semibold text-gray-900">{getTriggerLabel(item)}</div>
        <div className="text-xs text-gray-500">{getDomainLabel(item.domain_label)}</div>
      </div>
    ),
  },
  {
    key: 'client',
    header: NOTIFICATIONS_MESSAGES.columns.client,
    render: (item) => item.client_name ?? `#${item.client_record_id}`,
  },
  {
    key: 'status',
    header: NOTIFICATIONS_MESSAGES.columns.status,
    render: (item) => (
      <Badge variant={getNotificationStatusVariant(item.status)} size="sm">
        {NOTIFICATION_STATUS_LABELS[item.status]}
      </Badge>
    ),
  },
  {
    key: 'recipient',
    header: NOTIFICATIONS_MESSAGES.columns.recipient,
    render: (item) => <span className="text-sm text-gray-600">{item.recipient ?? '—'}</span>,
  },
  {
    key: 'actions',
    header: '',
    render: (item) => (
      <RowActionsMenu ariaLabel={NOTIFICATIONS_MESSAGES.columns.rowActionsAriaLabel}>
        <RowActionItem
          label={NOTIFICATIONS_MESSAGES.actions.viewDetails}
          icon={<Eye className="h-4 w-4" />}
          onClick={() => onView(item.id)}
        />
        {isAdvisor && (
          <RowActionItem
            label={NOTIFICATIONS_MESSAGES.actions.sendToClient}
            icon={<Send className="h-4 w-4" />}
            onClick={() => onSend({ id: item.client_record_id, name: item.client_name ?? `#${item.client_record_id}` })}
          />
        )}
      </RowActionsMenu>
    ),
  },
]
