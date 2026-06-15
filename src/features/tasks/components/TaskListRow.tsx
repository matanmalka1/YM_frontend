import { CalendarClock, CheckCircle2, Eye, Pencil, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import { cn } from '@/utils/utils'
import { workQueueSourceTypeLabels } from '@/features/workQueue'
import { taskPriorityLabels, taskStatusLabels } from '../constants'
import { formatTaskDueDate, isTaskTerminal } from '../utils/taskFormatters'
import {
  taskPriorityBadgeClasses,
  taskPriorityRailClasses,
  getTaskStatusBadgeVariant,
  taskStatusDotClass,
} from './taskDisplay'
import type { Task } from '../api/contracts'
import type { WorkQueueSourceType } from '@/features/workQueue'

interface TaskListRowProps {
  task: Task
  isActionBusy: boolean
  onView: (taskId: number) => void
  onEdit: (taskId: number) => void
  onComplete: (taskId: number) => void
  onCancel: (taskId: number) => void
  onDelete: (taskId: number) => void
}

export const TaskListRow: React.FC<TaskListRowProps> = ({
  task,
  isActionBusy,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}) => {
  const terminal = isTaskTerminal(task.status)

  return (
    <div className="group relative grid gap-3 px-4 py-3 text-right transition hover:bg-gray-50/70 lg:grid-cols-[minmax(16rem,1fr)_7rem_7rem_8rem_9rem] lg:items-center">
      <span className={cn('absolute inset-y-3 right-0 w-1 rounded-s-full', taskPriorityRailClasses[task.priority])} />
      <div className="min-w-0 space-y-2 pe-2">
        <button
          type="button"
          className="focus-ring block max-w-full truncate rounded text-right text-sm font-semibold text-gray-950 transition hover:text-primary-700"
          onClick={() => onView(task.id)}
        >
          {task.title}
        </button>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-gray-600">
            משימה #{task.id}
          </span>
          {task.source_domain ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
              {workQueueSourceTypeLabels[task.source_domain as WorkQueueSourceType] ?? task.source_domain}
            </span>
          ) : null}
        </div>
      </div>

      <TaskMobileField label="סטטוס">
        <Badge
          variant={getTaskStatusBadgeVariant(task.status)}
          size="sm"
          dot={taskStatusDotClass[task.status]}
          ring
          className="whitespace-nowrap"
        >
          {taskStatusLabels[task.status] ?? task.status}
        </Badge>
      </TaskMobileField>

      <TaskMobileField label="עדיפות">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold',
            taskPriorityBadgeClasses[task.priority],
          )}
        >
          {taskPriorityLabels[task.priority] ?? task.priority}
        </span>
      </TaskMobileField>

      <TaskMobileField label="תאריך יעד">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
          <CalendarClock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          {formatTaskDueDate(task.due_date)}
        </span>
      </TaskMobileField>

      <TaskRowActions
        taskId={task.id}
        isTerminal={terminal}
        isActionBusy={isActionBusy}
        onView={onView}
        onEdit={onEdit}
        onComplete={onComplete}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}

const TaskMobileField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-2 lg:justify-center">
    <span className="text-xs font-semibold text-gray-400 lg:hidden">{label}</span>
    {children}
  </div>
)

interface TaskRowActionsProps {
  taskId: number
  isTerminal: boolean
  isActionBusy: boolean
  onView: (taskId: number) => void
  onEdit: (taskId: number) => void
  onComplete: (taskId: number) => void
  onCancel: (taskId: number) => void
  onDelete: (taskId: number) => void
}

const TaskRowActions: React.FC<TaskRowActionsProps> = ({
  taskId,
  isTerminal,
  isActionBusy,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}) => (
  <RowActionsMenu ariaLabel={`פעולות למשימה ${taskId}`}>
    <RowActionItem label="צפה בפרטי המשימה" icon={<Eye className="h-4 w-4" />} onClick={() => onView(taskId)} />
    {!isTerminal ? (
      <>
        <RowActionItem
          label="עריכת משימה"
          icon={<Pencil className="h-4 w-4" />}
          onClick={() => onEdit(taskId)}
          disabled={isActionBusy}
        />
        <RowActionItem
          label="סמן כהושלמה"
          icon={<CheckCircle2 className="h-4 w-4" />}
          onClick={() => onComplete(taskId)}
          disabled={isActionBusy}
        />
        <RowActionItem
          label="בטל משימה"
          icon={<XCircle className="h-4 w-4" />}
          onClick={() => onCancel(taskId)}
          disabled={isActionBusy}
          danger
        />
      </>
    ) : (
      <RowActionItem
        label="מחק משימה"
        icon={<Trash2 className="h-4 w-4" />}
        onClick={() => onDelete(taskId)}
        disabled={isActionBusy}
        danger
      />
    )}
  </RowActionsMenu>
)

TaskListRow.displayName = 'TaskListRow'
