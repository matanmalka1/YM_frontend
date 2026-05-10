import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { useTasks, useCreateTask, useStartTask, useCompleteTask, useCancelTask } from '../hooks/useTasks'
import { TasksTable } from '../components/TasksTable'
import { CreateTaskModal } from '../components/CreateTaskModal'
import { taskStatusValues, taskStatusLabels } from '../constants'
import type { TaskStatus } from '../api/contracts'

const statusOptions = [
  { value: '', label: 'כל הסטטוסים' },
  ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
]

export const TasksPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, error } = useTasks(statusFilter ? { status: statusFilter } : undefined)
  const createTask = useCreateTask()
  const startTask = useStartTask()
  const completeTask = useCompleteTask()
  const cancelTask = useCancelTask()

  const items = data?.items ?? []

  const header = (
    <PageHeader
      title="משימות ידניות"
      description="משימות פנימיות עם מעקב מחזור חיים מלא"
      actions={
        <Button onClick={() => setShowCreate(true)} size="sm">
          + משימה חדשה
        </Button>
      }
    />
  )

  return (
    <PageStateGuard isLoading={isLoading} error={error ? 'שגיאה בטעינת המשימות' : null} header={header} loadingMessage="טוען משימות...">
      <div className="flex gap-3 mb-4 items-center">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          className="w-44"
        />
        {statusFilter && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>
            אפס סינון
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <StateCard
          icon={ClipboardList}
          variant="illustration"
          title="אין משימות"
          message={statusFilter ? 'לא נמצאו משימות התואמות את הסינון' : 'לחץ על "+ משימה חדשה" כדי להוסיף משימה'}
        />
      ) : (
        <TasksTable
          items={items}
          onStart={(id) => startTask.mutate(id)}
          onComplete={(id) => completeTask.mutate(id)}
          onCancel={(id) => cancelTask.mutate(id)}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          isLoading={createTask.isPending}
          onSubmit={(data) => createTask.mutate(data, { onSuccess: () => setShowCreate(false) })}
        />
      )}
    </PageStateGuard>
  )
}
