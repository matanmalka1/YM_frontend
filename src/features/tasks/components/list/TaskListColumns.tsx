import { CalendarClock, CheckCircle2, Eye, Pencil, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import type { Column } from '@/components/ui/table/DataTable'
import { cn } from '@/utils/utils'
import { workQueueSourceTypeLabels } from '@/features/workQueue'
import type { WorkQueueSourceType } from '@/features/workQueue'
import type { Task } from '../../api/contracts'
import { taskPriorityLabels, taskStatusLabels } from '../../constants/labels'
import { taskPriorityBadgeClasses, getTaskStatusBadgeVariant, taskStatusDotClass } from '../../utils/taskDisplay'
import { formatTaskDueDate, isTaskTerminal } from '../../utils/taskFormatters'

interface TaskColumnActions {
  isActionBusy: boolean
  onView: (taskId: number) => void
  onEdit: (taskId: number) => void
  onComplete: (taskId: number) => void
  onCancel: (taskId: number) => void
  onDelete: (taskId: number) => void
}

export const buildTaskListColumns = ({
  isActionBusy,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}: TaskColumnActions): Array<Column<Task>> => [
  {
    key: 'title',
    header: 'כותרת',
    align: 'right',
    wrap: true,
    render: (task) => (
      <div className="min-w-48 space-y-1">
        <Button
          type="button"
          variant="text"
          truncate
          onClick={() => onView(task.id)}
        >
          {task.title}
        </Button>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral" size="2xs" className="font-semibold tabular-nums text-gray-600">
            משימה #{task.id}
          </Badge>
          {task.source_domain ? (
            <Badge variant="neutral" size="2xs" className="text-gray-600">
              {workQueueSourceTypeLabels[task.source_domain as WorkQueueSourceType] ?? task.source_domain}
            </Badge>
          ) : null}
        </div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'סטטוס',
    render: (task) => (
      <Badge variant={getTaskStatusBadgeVariant(task.status)} size="sm" dot={taskStatusDotClass[task.status]} ring>
        {taskStatusLabels[task.status]}
      </Badge>
    ),
  },
  {
    key: 'priority',
    header: 'עדיפות',
    render: (task) => (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-2xs font-semibold',
          taskPriorityBadgeClasses[task.priority],
        )}
      >
        {taskPriorityLabels[task.priority]}
      </span>
    ),
  },
  {
    key: 'dueDate',
    header: 'תאריך יעד',
    render: (task) => (
      <span className="inline-flex items-center gap-1">
        <CalendarClock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        {formatTaskDueDate(task.due_date)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'פעולות',
    render: (task) => {
      const terminal = isTaskTerminal(task.status)
      return (
        <RowActionsMenu ariaLabel={`פעולות למשימה ${task.id}`}>
          <RowActionItem label="צפה בפרטי המשימה" icon={<Eye className="h-4 w-4" />} onClick={() => onView(task.id)} />
          {!terminal ? (
            <>
              <RowActionItem
                label="עריכת משימה"
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => onEdit(task.id)}
                disabled={isActionBusy}
              />
              <RowActionItem
                label="סמן כהושלמה"
                icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => onComplete(task.id)}
                disabled={isActionBusy}
              />
              <RowActionItem
                label="בטל משימה"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() => onCancel(task.id)}
                disabled={isActionBusy}
                danger
              />
            </>
          ) : (
            <RowActionItem
              label="מחק משימה"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDelete(task.id)}
              disabled={isActionBusy}
              danger
            />
          )}
        </RowActionsMenu>
      )
    },
  },
]
