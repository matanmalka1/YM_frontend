import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, ExternalLink, Link2, Play, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { Tooltip } from '@/components/ui/primitives/Tooltip'
import { RowActionItem, RowActionsMenu, actionsColumn, dateColumn, EmptyCell, type Column } from '@/components/ui/table'
import type { WorkQueueAction, WorkQueueItem, WorkQueueSourceType, WorkQueueWarning } from '../api/contracts'
import { getWorkQueueUrgencyVariant, workQueueSourceTypeLabels, workQueueUrgencyLabels } from '../constants'
import { WORK_QUEUE_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import {
  getWorkQueueAssignedRoleLabel,
  getWorkQueueAssignedUserName,
  getWorkQueueMetadataValue,
  getWorkQueueTaskPriority,
  getWorkQueueTaskPriorityLabel,
} from '../utils/workQueueTaskDisplay'

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

const actionVariant = (action: WorkQueueAction): 'ghost' | 'danger' => (action.variant === 'danger' ? 'danger' : 'ghost')

interface BuildColumnsParams {
  activeActionKey?: string | null
  onAction: (item: WorkQueueItem, action: WorkQueueAction, focusTarget?: HTMLElement | null) => void
  showLinkedTasks: boolean
  showWarnings: boolean
}

export const buildWorkQueueColumns = ({ activeActionKey, onAction, showLinkedTasks, showWarnings }: BuildColumnsParams) =>
  (
    [
      {
        key: 'type',
        header: WORK_QUEUE_MESSAGES.columns.type,
        render: (item: WorkQueueItem) =>
          item.source_type === 'task' ? (
            <Badge variant="neutral" icon={<ClipboardCheck className="h-3 w-3" />}>
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
        header: GLOBAL_UI_MESSAGES.common.client,
        render: (item: WorkQueueItem) =>
          item.client_record_id != null ? (
            <Link
              to={`/clients/${item.client_record_id}`}
              className="block max-w-44 text-sm text-primary-600 hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="block truncate">{item.client_name ?? WORK_QUEUE_MESSAGES.columns.clientProfile}</span>
              {item.office_client_number != null && (
                <span className="block text-xs text-gray-500">{item.office_client_number}</span>
              )}
            </Link>
          ) : (
            <EmptyCell />
          ),
      },
      {
        key: 'title',
        header: WORK_QUEUE_MESSAGES.columns.title,
        wrap: true,
        render: (item: WorkQueueItem) => (
          <div className="space-y-1 text-start">
            <div className="font-medium text-gray-900">{item.title}</div>
            {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
            {item.source_type === 'task' && item.source_summary && (
              <div className="text-xs text-gray-500">{WORK_QUEUE_MESSAGES.columns.sourcePrefix(item.source_summary.label)}</div>
            )}
          </div>
        ),
      },
      dateColumn({
        key: 'due_date',
        header: WORK_QUEUE_MESSAGES.columns.dueDate,
        getValue: (item: WorkQueueItem) => item.due_date,
      }),
      {
        key: 'urgency',
        header: WORK_QUEUE_MESSAGES.columns.urgency,
        kind: 'status',
        render: (item: WorkQueueItem) => (
          <Badge variant={getWorkQueueUrgencyVariant(item.urgency)}>{workQueueUrgencyLabels[item.urgency]}</Badge>
        ),
      },
      {
        key: 'task_meta',
        header: WORK_QUEUE_MESSAGES.columns.taskMeta,
        render: (item: WorkQueueItem) => {
          const priorityKey = getWorkQueueTaskPriority(item)
          const priority = getWorkQueueTaskPriorityLabel(item)
          const assignedRole = getWorkQueueAssignedRoleLabel(item)
          const assignedUser = getWorkQueueAssignedUserName(item)
          if (!priority && !assignedRole && !assignedUser) return <EmptyCell />
          return (
            <div className="flex flex-col items-center gap-1">
              <div className="flex flex-wrap justify-center gap-1">
                {priority && <Badge variant={priorityKey === 'urgent' ? 'negative' : 'neutral'}>{priority}</Badge>}
                {assignedRole && <Badge variant="info">{assignedRole}</Badge>}
              </div>
              {assignedUser && <span className="max-w-36 truncate text-xs text-gray-500">{assignedUser}</span>}
            </div>
          )
        },
      },
      {
        key: 'status',
        header: GLOBAL_UI_MESSAGES.common.status,
        tone: 'muted',
        render: (item: WorkQueueItem) => item.status_label ?? '—',
      },
      {
        key: 'linked_tasks',
        header: WORK_QUEUE_MESSAGES.columns.linkedTasks,
        wrap: true,
        render: (item: WorkQueueItem) => {
          const count = item.linked_tasks_count
          if (!count) return <EmptyCell />
          return (
            <div className="space-y-1">
              <Badge variant="info">
                {count === 1 ? WORK_QUEUE_MESSAGES.columns.linkedTask : WORK_QUEUE_MESSAGES.columns.taskCount(count)}
              </Badge>
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
        header: WORK_QUEUE_MESSAGES.columns.warnings,
        wrap: true,
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
            <EmptyCell />
          ),
      },
      actionsColumn({
        key: 'actions',
        header: GLOBAL_UI_MESSAGES.common.actions,
        render: (item: WorkQueueItem) => {
          const actions = item.available_actions
          const isUnlinkedTask =
            item.source_type === 'task' &&
            getWorkQueueMetadataValue(item, 'source_domain') == null &&
            getWorkQueueMetadataValue(item, 'source_id') == null
          if (actions.length === 0 && !isUnlinkedTask) return <EmptyCell />
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
            label: WORK_QUEUE_MESSAGES.columns.linkToItem,
            type: 'modal',
          }
          const secondaryActions = isUnlinkedTask ? [linkAction, ...secondary] : secondary
          const primaryButton = primary ? (
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
              {primaryButton && tooltipText ? <Tooltip text={tooltipText}>{primaryButton}</Tooltip> : primaryButton}
              {secondaryActions.length > 0 && (
                <RowActionsMenu>
                  {secondaryActions.map((action) => {
                    const key = `${item.id}:${action.key}`
                    return (
                      <RowActionItem
                        key={action.key}
                        label={activeActionKey === key ? WORK_QUEUE_MESSAGES.columns.actionRunning : action.label}
                        icon={activeActionKey === key ? <Spinner size="sm" /> : actionIcon(action)}
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
      }),
    ] satisfies Column<WorkQueueItem>[]
  ).filter((column) => {
    if (column.key === 'linked_tasks') return showLinkedTasks
    if (column.key === 'warnings') return showWarnings
    return true
  })
