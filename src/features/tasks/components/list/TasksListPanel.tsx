import { useMemo } from 'react'
import { ListChecks } from 'lucide-react'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { Alert } from '@/components/ui/overlays/Alert'
import type { Task } from '../../api/contracts'
import { TASKS_PAGE_SIZE } from '../../constants/pageConstants'
import { buildTaskListColumns } from './TaskListColumns'

interface TasksListPanelProps {
  tasks: Task[]
  isLoading: boolean
  isFetching: boolean
  error: string | null
  hasFilters: boolean
  page: number
  total: number
  isActionBusy: boolean
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
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  onPageChange,
  onRetry,
}) => {
  const columns = useMemo(
    () => buildTaskListColumns({ isActionBusy, onView, onEdit, onComplete, onCancel, onDelete }),
    [isActionBusy, onView, onEdit, onComplete, onCancel, onDelete],
  )
  return (
    <section aria-label="רשימת משימות">
      {error ? (
        <Alert variant="error" message={error} onRetry={onRetry} />
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={tasks}
          getRowKey={(task) => task.id}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          pageSize={TASKS_PAGE_SIZE}
          total={total}
          label="משימות"
          onPageChange={onPageChange}
          emptyState={{
            icon: ListChecks,
            title: hasFilters ? 'אין משימות שמתאימות לסינון' : 'אין משימות',
            message: hasFilters ? 'נסו לשנות את הסינון או לנקות אותו.' : 'אפשר ליצור משימה חדשה ולהתחיל מעקב.',
          }}
        />
      )}
    </section>
  )
}

TasksListPanel.displayName = 'TasksListPanel'
