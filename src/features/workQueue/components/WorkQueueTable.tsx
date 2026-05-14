import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ExternalLink, Loader2, Play, XCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/table/DataTable'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import { formatDate } from '@/utils/utils'
import type { WorkQueueAction, WorkQueueItem, WorkQueueSourceType, WorkQueueWarning } from '../api/contracts'
import { workQueueSourceTypeLabels, workQueueUrgencyLabels, workQueueUrgencyVariant } from '../constants'

interface WorkQueueTableProps {
  items: WorkQueueItem[]
  isLoading?: boolean
  activeActionKey?: string | null
  onAction: (item: WorkQueueItem, action: WorkQueueAction) => void
}

const typeLabel = (sourceType: WorkQueueSourceType): string => workQueueSourceTypeLabels[sourceType] ?? sourceType

const warningVariant = (warning: WorkQueueWarning) => {
  if (warning.severity === 'danger') return 'error'
  if (warning.severity === 'warning') return 'warning'
  return 'info'
}

const actionIcon = (action: WorkQueueAction) => {
  if (action.type === 'link') return <ExternalLink className="h-4 w-4" />
  if (action.key.includes('complete') || action.key.includes('paid') || action.key.includes('return')) {
    return <CheckCircle2 className="h-4 w-4" />
  }
  if (action.key.includes('cancel')) return <XCircle className="h-4 w-4" />
  return <Play className="h-4 w-4" />
}

const actionVariant = (action: WorkQueueAction): 'ghost' | 'danger' => {
  if (action.variant === 'danger') return 'danger'
  return 'ghost'
}

export const WorkQueueTable: React.FC<WorkQueueTableProps> = ({ items, isLoading, activeActionKey, onAction }) => {
  const { showLinkedTasks, showWarnings } = useMemo(
    () => ({
      showLinkedTasks: items.some((item) => item.linked_tasks_count > 0),
      showWarnings: items.some((item) => item.warnings.length > 0),
    }),
    [items],
  )
  const columns = useMemo(
    () =>
      [
        {
          key: 'type',
          header: 'סוג',
          render: (item: WorkQueueItem) => (
            <Badge variant="neutral">{item.type_label ?? typeLabel(item.source_type)}</Badge>
          ),
        },
        {
          key: 'client',
          header: 'לקוח',
          render: (item: WorkQueueItem) =>
            item.client_record_id != null ? (
              <Link
                to={`/clients/${item.client_record_id}`}
                className="inline-flex max-w-44 flex-col text-center text-sm text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="truncate">{item.client_name ?? 'לפרופיל לקוח'}</span>
                {item.office_client_number != null && (
                  <span className="text-xs text-gray-500">#{item.office_client_number}</span>
                )}
              </Link>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            ),
        },
        {
          key: 'title',
          header: 'מה צריך לעשות',
          className: 'min-w-44 whitespace-normal text-center',
          render: (item: WorkQueueItem) => (
            <div className="space-y-1 text-right">
              <div className="font-medium text-center text-gray-900">{item.title}</div>
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
          render: (item: WorkQueueItem) => (
            <span className="text-sm tabular-nums text-gray-700">{formatDate(item.due_date)}</span>
          ),
        },
        {
          key: 'urgency',
          header: 'דחיפות',
          render: (item: WorkQueueItem) => (
            <Badge variant={workQueueUrgencyVariant[item.urgency]}>{workQueueUrgencyLabels[item.urgency]}</Badge>
          ),
        },
        {
          key: 'status',
          header: 'סטטוס',
          render: (item: WorkQueueItem) => <span className="text-sm text-gray-600">{item.status_label ?? '—'}</span>,
        },
        {
          key: 'linked_tasks',
          header: 'משימות קשורות',
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
          render: (item: WorkQueueItem) => {
            const actions = item.available_actions
            if (actions.length === 0) return <span className="text-sm text-gray-400">—</span>
            const [primary, ...secondary] = actions
            const primaryKey = `${item.id}:${primary.key}`
            return (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={actionVariant(primary)}
                  size="sm"
                  disabled={primary.disabled || activeActionKey === primaryKey}
                  isLoading={activeActionKey === primaryKey}
                  onClick={(event) => {
                    event.stopPropagation()
                    onAction(item, primary)
                  }}
                >
                  {primary.label}
                </Button>
                {secondary.length > 0 && (
                  <RowActionsMenu menuClassName="w-50">
                    {secondary.map((action) => {
                      const key = `${item.id}:${action.key}`
                      return (
                        <RowActionItem
                          key={action.key}
                          label={activeActionKey === key ? 'מבצע פעולה...' : action.label}
                          icon={
                            activeActionKey === key ? <Loader2 className="h-4 w-4 animate-spin" /> : actionIcon(action)
                          }
                          danger={action.variant === 'danger'}
                          disabled={action.disabled || activeActionKey === key}
                          onClick={() => onAction(item, action)}
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
      }),
    [showLinkedTasks, showWarnings, activeActionKey, onAction],
  )

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="אין משימות להצגה"
    />
  )
}
