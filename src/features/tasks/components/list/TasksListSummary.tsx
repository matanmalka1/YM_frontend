import { ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { taskPriorityLabels, taskStatusLabels } from '../../constants/labels'
import { formatTaskDueDate } from '../../utils/taskFormatters'
import type { Task } from '../../api/contracts'

interface TasksListSummaryProps {
  total: number
  visibleCount: number
  featuredTask: Task | null
}

export const TasksListSummary: React.FC<TasksListSummaryProps> = ({ total, visibleCount, featuredTask }) => (
  <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile border border-gray-200 bg-gray-100 text-gray-700">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-950">רשימת משימות</p>
          <p className="mt-1 text-xs text-gray-500">
            מוצגות {visibleCount} מתוך {total} משימות לפי הסינון הנוכחי
          </p>
        </div>
      </div>
    </div>

    <aside className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500">מיקוד נוכחי</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-gray-950">
            {featuredTask?.title ?? 'אין משימות להצגה'}
          </p>
        </div>
        <Badge variant="neutral" size="2xs" className="shrink-0 tabular-nums shadow-sm">
          {featuredTask ? `#${featuredTask.id}` : '—'}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-2xs">
        <TaskFocusPill label="סטטוס" value={featuredTask ? taskStatusLabels[featuredTask.status] : '—'} />
        <TaskFocusPill label="עדיפות" value={featuredTask ? taskPriorityLabels[featuredTask.priority] : '—'} />
        <TaskFocusPill label="יעד" value={formatTaskDueDate(featuredTask?.due_date)} />
      </div>
    </aside>
  </section>
)

const TaskFocusPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white px-2 py-1.5 shadow-sm">
    <p className="text-gray-400">{label}</p>
    <p className="mt-0.5 truncate font-semibold text-gray-800">{value}</p>
  </div>
)
