import type { QueryStatus } from '@tanstack/react-query'
import { InlineEmptyState, StateCard } from '@/components/ui/feedback'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { AlertTriangle, ListChecks } from 'lucide-react'
import { TASK_TABLE_COLUMNS } from '../../constants/pageConstants'
import { TaskListRow } from './TaskListRow'
import type { Task } from '../../api/contracts'

interface TasksListPanelProps {
  tasks: Task[]
  status: QueryStatus
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
  status,
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

    {status === 'pending' ? (
      <div className="space-y-2 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm" aria-label="טוען משימות">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonBlock key={index} height="h-16" width="w-full" className="rounded-2xl bg-gray-50" />
        ))}
      </div>
    ) : null}
    {status === 'error' ? <StateCard icon={AlertTriangle} message="שגיאה בטעינת משימות" variant="error" /> : null}
    {status === 'success' && tasks.length === 0 ? (
      <InlineEmptyState
        title={hasFilters ? 'אין משימות שמתאימות לסינון' : 'אין משימות'}
        description={hasFilters ? 'נסו לשנות את הסינון או לנקות אותו.' : 'אפשר ליצור משימה חדשה ולהתחיל מעקב.'}
        icon={ListChecks}
      />
    ) : null}
    {status === 'success' && tasks.length > 0 ? (
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
