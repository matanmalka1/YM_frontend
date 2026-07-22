import { useMemo } from 'react'
import { ListChecks } from 'lucide-react'
import { PaginatedDataTable, type DataTableProps } from '@/components/ui/table'
import type { Task } from '../../api/contracts'
import { TASKS_PAGE_SIZE } from '../../constants/pageConstants'
import { buildTaskListColumns, type TaskSelectionConfig } from './TaskListColumns'
import { TASKS_MESSAGES } from '../../messages'

interface TasksListPanelProps {
  tasks: Task[]
  isLoading: boolean
  isFetching: boolean
  error: string | null
  hasFilters: boolean
  page: number
  total: number
  isActionBusy: boolean
  selection?: TaskSelectionConfig
  emptyState?: DataTableProps<Task>['emptyState']
  onView: (taskId: number) => void
  onEdit: (taskId: number) => void
  onComplete: (taskId: number) => void
  onCancel: (taskId: number) => void
  onDelete: (taskId: number) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

export const TasksListPanel: React.FC<TasksListPanelProps> = ({
  tasks,
  isLoading,
  isFetching,
  error,
  hasFilters,
  page,
  total,
  isActionBusy,
  selection,
  emptyState,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  onPageChange,
  onRetry,
}) => {
  const columns = useMemo(
    () => buildTaskListColumns({ isActionBusy, selection, onView, onEdit, onComplete, onCancel, onDelete }),
    [isActionBusy, selection, onView, onEdit, onComplete, onCancel, onDelete],
  )
  return (
    <section aria-label={TASKS_MESSAGES.list.ariaLabel}>
      <PaginatedDataTable
        columns={columns}
        data={tasks}
        getRowKey={(task) => task.id}
        error={error}
        onRetry={onRetry}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        pageSize={TASKS_PAGE_SIZE}
        total={total}
        label={TASKS_MESSAGES.list.label}
        onPageChange={onPageChange}
        emptyState={
          emptyState ?? {
            icon: ListChecks,
            title: hasFilters ? TASKS_MESSAGES.list.emptyFilteredTitle : TASKS_MESSAGES.list.emptyTitle,
            message: hasFilters ? TASKS_MESSAGES.list.emptyFilteredMessage : TASKS_MESSAGES.list.emptyMessage,
          }
        }
      />
    </section>
  )
}

TasksListPanel.displayName = 'TasksListPanel'
