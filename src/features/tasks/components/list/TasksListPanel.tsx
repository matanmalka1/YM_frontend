import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { TASK_TABLE_COLUMNS } from '../../constants/pageConstants'
import { TaskListRow } from './TaskListRow'
import { TasksEmptyState, TasksErrorState, TasksLoadingState } from './TaskListStates'
import type { Task } from '../../api/contracts'

interface TasksListPanelProps {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  hasFilters: boolean
  page: number
  total: number
  totalPages: number
  isActionBusy: boolean
  actionError: string | null
  onView: (taskId: number) => void
  onEdit: (taskId: number) => void
  onComplete: (taskId: number) => void
  onCancel: (taskId: number) => void
  onDelete: (taskId: number) => void
  onPageChange: (page: number) => void
}

export const TasksListPanel: React.FC<TasksListPanelProps> = ({
  tasks,
  isLoading,
  isError,
  hasFilters,
  page,
  total,
  totalPages,
  isActionBusy,
  actionError,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  onPageChange,
}) => (
  <section className="space-y-3">
    {actionError ? (
      <div className="rounded-2xl border border-negative-100 bg-negative-50 p-4 text-sm font-semibold text-negative-800">
        {actionError}
      </div>
    ) : null}

    {isLoading ? <TasksLoadingState /> : null}
    {isError ? <TasksErrorState /> : null}
    {!isLoading && !isError && tasks.length === 0 ? <TasksEmptyState hasFilters={hasFilters} /> : null}
    {!isLoading && !isError && tasks.length > 0 ? (
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950">רשימת משימות</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              מוצגות {tasks.length} מתוך {total} משימות
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-gray-600">
            עמוד {page}
          </span>
        </div>

        <div className="hidden grid-cols-[minmax(16rem,1fr)_7rem_7rem_8rem_9rem] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-600 lg:grid">
          {TASK_TABLE_COLUMNS.map((column) => (
            <span key={column} className={column === 'כותרת' ? undefined : 'text-center'}>
              {column}
            </span>
          ))}
        </div>

        <ul className="divide-y divide-gray-100">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskListRow
                task={task}
                isActionBusy={isActionBusy}
                onView={onView}
                onEdit={onEdit}
                onComplete={onComplete}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>

        {totalPages > 1 ? (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <PaginationCard
              page={page}
              totalPages={totalPages}
              total={total}
              label="משימות"
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </div>
    ) : null}
  </section>
)

TasksListPanel.displayName = 'TasksListPanel'
