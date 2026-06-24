import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, ExternalLink, Link2, Loader2, Play, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Tooltip } from '@/components/ui/primitives/Tooltip'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import { formatDate } from '@/utils/utils'
import { taskPriorityLabels, taskRoleLabels } from '@/features/tasks'
import type { WorkQueueAction, WorkQueueItem, WorkQueueSourceType, WorkQueueWarning } from '../api/contracts'
import { getWorkQueueUrgencyVariant, workQueueSourceTypeLabels, workQueueUrgencyLabels } from '../constants'

const typeLabel = (sourceType: WorkQueueSourceType): string => workQueueSourceTypeLabels[sourceType] ?? sourceType

const warningVariant = (warning: WorkQueueWarning) => {
  if (warning.severity === 'danger') return 'negative'
  if (warning.severity === 'warning') return 'warning'
  return 'info'
}

const actionIcon = (action: WorkQueueAction) => {
  if (action.type === 'link') return <ExternalLink className="h-4 w-4" />
  if (action.key.includes('link')) return <Link2 className="h-4 w-4" />
  if (action.key.includes('complete') || action.key.includes('paid') || action.key.includes('return')) {
    return <CheckCircle2 className="h-4 w-4" />
  }
  if (action.key.includes('cancel')) return <XCircle className="h-4 w-4" />
  return <Play className="h-4 w-4" />
}

const actionVariant = (action: WorkQueueAction): 'ghost' | 'danger' =>
  action.variant === 'danger' ? 'danger' : 'ghost'

const metadataValue = (item: WorkQueueItem, key: string): unknown =>
  item.metadata && typeof item.metadata === 'object' ? (item.metadata as Record<string, unknown>)[key] : undefined

const taskPriorityLabel = (item: WorkQueueItem): string | null => {
  const priority =
    item.source_type === 'task'
      ? metadataValue(item, 'priority')
      : item.linked_tasks.length === 1
        ? item.linked_tasks[0].priority
        : null
  if (typeof priority !== 'string') return null
  return taskPriorityLabels[priority] ?? priority
}

const assignedRoleLabel = (item: WorkQueueItem): string | null => {
  const role =
    item.source_type === 'task'
      ? metadataValue(item, 'assigned_role')
      : item.linked_tasks.length === 1
        ? item.linked_tasks[0].assigned_role
        : null
  if (typeof role !== 'string' || !role) return null
  return taskRoleLabels[role] ?? role
}

interface BuildColumnsParams {
  activeActionKey?: string | null
  onAction: (item: WorkQueueItem, action: WorkQueueAction, focusTarget?: HTMLElement | null) => void
  showLinkedTasks: boolean
  showWarnings: boolean
}

export const buildWorkQueueColumns = ({
  activeActionKey,
  onAction,
  showLinkedTasks,
  showWarnings,
}: BuildColumnsParams) =>
  [
    {
      key: 'type',
      header: 'סוג',
      headerClassName: 'w-28',
      className: 'w-28',
      render: (item: WorkQueueItem) =>
        item.source_type === 'task' ? (
          <Badge
            variant="neutral"
            icon={<ClipboardCheck className="h-3 w-3" />}
            className="justify-center whitespace-nowrap"
          >
            {item.type_label ?? typeLabel(item.source_type)}
          </Badge>
        ) : (
          <Badge variant="neutral" className="inline-flex items-center justify-center whitespace-nowrap">
            {item.type_label ?? typeLabel(item.source_type)}
          </Badge>
        ),
    },
    {
      key: 'client',
      header: 'לקוח',
      headerClassName: 'w-48',
      className: 'w-48',
      render: (item: WorkQueueItem) =>
        item.client_record_id != null ? (
          <Link
            to={`/clients/${item.client_record_id}`}
            className="inline-flex max-w-44 flex-col text-center text-sm text-primary-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{item.client_name ?? 'לפרופיל לקוח'}</span>
            {item.office_client_number != null && (
              <span className="text-xs text-gray-500">{item.office_client_number}</span>
            )}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      key: 'title',
      header: 'מה צריך לעשות',
      headerClassName: 'min-w-64 w-[28rem] text-start',
      className: 'min-w-64 max-w-[30rem] whitespace-normal text-start',
      render: (item: WorkQueueItem) => (
        <div className="space-y-1 text-start">
          <div className="font-medium text-gray-900">{item.title}</div>
          {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
          {item.source_type === 'task' && item.source_summary && (
            <div className="text-xs text-gray-500">קשורה אל: {item.source_summary.label}</div>
          )}
        </div>
      ),
    },
    {
      key: 'due_date',
      header: 'תאריך יעד',
      headerClassName: 'w-32',
      className: 'w-32',
      render: (item: WorkQueueItem) => (
        <span className="text-sm tabular-nums text-gray-700">{formatDate(item.due_date)}</span>
      ),
    },
    {
      key: 'urgency',
      header: 'דחיפות זמן',
      headerClassName: 'w-28',
      className: 'w-28',
      render: (item: WorkQueueItem) => (
        <Badge variant={getWorkQueueUrgencyVariant(item.urgency)}>{workQueueUrgencyLabels[item.urgency]}</Badge>
      ),
    },
    {
      key: 'task_meta',
      header: 'עדיפות/שיוך',
      headerClassName: 'w-36',
      className: 'w-36',
      render: (item: WorkQueueItem) => {
        const priority = taskPriorityLabel(item)
        const assignedRole = assignedRoleLabel(item)
        if (!priority && !assignedRole) return <span className="text-sm text-gray-400">—</span>
        return (
          <div className="flex flex-wrap justify-center gap-1">
            {priority && <Badge variant={priority === 'דחוף' ? 'negative' : 'neutral'}>{priority}</Badge>}
            {assignedRole && <Badge variant="info">{assignedRole}</Badge>}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'סטטוס',
      headerClassName: 'w-28',
      className: 'w-28',
      render: (item: WorkQueueItem) => <span className="text-sm text-gray-600">{item.status_label ?? '—'}</span>,
    },
    {
      key: 'linked_tasks',
      header: 'משימות קשורות',
      headerClassName: 'w-40',
      className: 'w-40 whitespace-normal',
      render: (item: WorkQueueItem) => {
        const count = item.linked_tasks_count
        if (!count) return <span className="text-sm text-gray-400">—</span>
        return (
          <div className="space-y-1">
            <Badge variant="info">{count === 1 ? 'משימה קשורה' : `${count} משימות`}</Badge>
            {item.linked_tasks.slice(0, 2).map((task) => (
              <div key={task.id} className="max-w-40 truncate text-xs text-gray-500">
                {task.title}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      key: 'warnings',
      header: 'אזהרות',
      headerClassName: 'w-44',
      className: 'w-44 whitespace-normal',
      render: (item: WorkQueueItem) =>
        item.warnings.length ? (
          <div className="flex max-w-44 flex-wrap justify-center gap-1">
            {item.warnings.map((warning) => (
              <Badge key={warning.key} variant={warningVariant(warning)}>
                {warning.label}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'פעולות',
      headerClassName: 'w-36',
      className: 'w-36',
      render: (item: WorkQueueItem) => {
        const actions = item.available_actions
        const isUnlinkedTask =
          item.source_type === 'task' &&
          metadataValue(item, 'source_domain') == null &&
          metadataValue(item, 'source_id') == null
        if (actions.length === 0 && !isUnlinkedTask) return <span className="text-sm text-gray-400">—</span>
        const [primary, ...secondary] = actions
        const primaryKey = primary ? `${item.id}:${primary.key}` : ''
        const tooltipText =
          primary?.disabled && primary.disabled_reason
            ? primary.disabled_reason
            : item.source_type === 'task' && item.description
              ? item.description
              : undefined
        const linkAction: WorkQueueAction = {
          key: 'link_task_to_source',
          label: 'קשר לפריט',
          type: 'modal',
        }
        const secondaryActions = isUnlinkedTask ? [linkAction, ...secondary] : secondary
        const primaryBtn = primary ? (
          <Button
            variant={actionVariant(primary)}
            size="sm"
            className="whitespace-nowrap"
            disabled={primary.disabled || activeActionKey === primaryKey}
            isLoading={activeActionKey === primaryKey}
            onClick={(event) => {
              event.stopPropagation()
              onAction(item, primary, event.currentTarget)
            }}
          >
            {primary.label}
          </Button>
        ) : null
        return (
          <div className="flex items-center justify-center gap-2">
            {primaryBtn && tooltipText ? <Tooltip text={tooltipText}>{primaryBtn}</Tooltip> : primaryBtn}
            {secondaryActions.length > 0 && (
              <RowActionsMenu menuClassName="w-50">
                {secondaryActions.map((action) => {
                  const key = `${item.id}:${action.key}`
                  return (
                    <RowActionItem
                      key={action.key}
                      label={activeActionKey === key ? 'מבצע פעולה...' : action.label}
                      icon={activeActionKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : actionIcon(action)}
                      danger={action.variant === 'danger'}
                      disabled={action.disabled || activeActionKey === key}
                      tooltip={action.disabled_reason ?? undefined}
                      onClick={(event) => onAction(item, action, event?.currentTarget ?? null)}
                    />
                  )
                })}
              </RowActionsMenu>
            )}
          </div>
        )
      },
    },
  ].filter((column) => {
    if (column.key === 'linked_tasks') return showLinkedTasks
    if (column.key === 'warnings') return showWarnings
    return true
  })
