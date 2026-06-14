import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker, Select } from '@/components/ui/inputs'
import { TaskModal } from '../components/TaskModal'
import { taskStatusValues, taskStatusLabels, taskPriorityValues, taskPriorityLabels, taskRoleLabels } from '../constants'
import { useTasks } from '../hooks/useTasks'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import { useActiveUserOptions } from '@/features/users'
import { workQueueSourceTypeLabels, workQueueSourceTypeValues } from '@/features/workQueue'
import { getErrorMessage } from '@/utils/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task, TaskCreateRequest, TaskUpdateRequest, TaskListParams, TaskStatus, TaskPriority } from '../api/contracts'
import type { UserRole } from '@/types'
import type { WorkQueueSourceType } from '@/features/workQueue'

const PAGE_SIZE = 20

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit' | 'view'; taskId: number }
  | null

export const TasksPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [assignedRoleFilter, setAssignedRoleFilter] = useState<UserRole | ''>('')
  const [assignedUserFilter, setAssignedUserFilter] = useState<string>('')
  const [sourceDomainFilter, setSourceDomainFilter] = useState<WorkQueueSourceType | ''>('')
  const [dueBeforeFilter, setDueBeforeFilter] = useState('')
  const [dueAfterFilter, setDueAfterFilter] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const qc = useQueryClient()
  const usersQuery = useActiveUserOptions()

  const params: TaskListParams = {
    page,
    page_size: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    ...(assignedRoleFilter ? { assigned_role: assignedRoleFilter } : {}),
    ...(assignedUserFilter ? { assigned_to_user_id: Number(assignedUserFilter) } : {}),
    ...(sourceDomainFilter ? { source_domain: sourceDomainFilter } : {}),
    ...(dueBeforeFilter ? { due_before: dueBeforeFilter } : {}),
    ...(dueAfterFilter ? { due_after: dueAfterFilter } : {}),
  }

  const { data, isLoading, isError } = useTasks(params)

  const editTaskQuery = useQuery({
    queryKey: tasksQK.detail(modal && modal.mode !== 'create' ? modal.taskId : 0),
    queryFn: () => tasksApi.get((modal as { taskId: number }).taskId),
    enabled: modal !== null && modal.mode !== 'create',
  })

  const createMutation = useMutation({
    mutationFn: (d: TaskCreateRequest) => tasksApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tasksQK.all }); setModal(null); setActionError(null) },
    onError: (error) => setActionError(getErrorMessage(error, 'שגיאה ביצירת משימה')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tasksQK.all }); setModal(null); setActionError(null) },
    onError: (error) => setActionError(getErrorMessage(error, 'שגיאה בעדכון משימה')),
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => tasksApi.complete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tasksQK.all }); setActionError(null) },
    onError: (error) => setActionError(getErrorMessage(error, 'שגיאה בסימון המשימה כהושלמה')),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => tasksApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tasksQK.all }); setActionError(null) },
    onError: (error) => setActionError(getErrorMessage(error, 'שגיאה בביטול המשימה')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: tasksQK.all }); setActionError(null) },
    onError: (error) => setActionError(getErrorMessage(error, 'שגיאה במחיקת המשימה')),
  })

  const handleModalSubmit = (d: TaskCreateRequest | TaskUpdateRequest) => {
    if (!modal) return
    if (modal.mode === 'create') {
      createMutation.mutate(d as TaskCreateRequest)
    } else if (modal.mode === 'edit') {
      updateMutation.mutate({ id: modal.taskId, data: d as TaskUpdateRequest })
    }
  }

  const tasks = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const statusOptions = [
    { value: '', label: 'כל הסטטוסים' },
    ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
  ]
  const priorityOptions = [
    { value: '', label: 'כל העדיפויות' },
    ...taskPriorityValues.map((v) => ({ value: v, label: taskPriorityLabels[v] })),
  ]
  const roleOptions = [
    { value: '', label: 'כל התפקידים' },
    { value: 'advisor', label: taskRoleLabels.advisor },
    { value: 'secretary', label: taskRoleLabels.secretary },
  ]
  const sourceOptions = [
    { value: '', label: 'כל המקורות' },
    ...workQueueSourceTypeValues.map((v) => ({ value: v, label: workQueueSourceTypeLabels[v] })),
  ]
  const userOptions = [
    { value: '', label: 'כל המשתמשים' },
    ...(usersQuery.data?.items ?? []).map((u) => ({ value: String(u.id), label: u.full_name })),
  ]

  const resetFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setAssignedRoleFilter('')
    setAssignedUserFilter('')
    setSourceDomainFilter('')
    setDueBeforeFilter('')
    setDueAfterFilter('')
    setPage(1)
  }

  const hasFilters = !!(
    statusFilter ||
    priorityFilter ||
    assignedRoleFilter ||
    assignedUserFilter ||
    sourceDomainFilter ||
    dueBeforeFilter ||
    dueAfterFilter
  )

  const isActionBusy = completeMutation.isPending || cancelMutation.isPending || deleteMutation.isPending

  const isTerminal = (t: Task) => t.status === 'done' || t.status === 'canceled'

  return (
    <div dir="rtl" className="space-y-6">
      <PageHeader
        title="משימות"
        actions={
          <Button size="sm" onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4 ml-1" />
            משימה חדשה
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          size="sm"
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | ''); setPage(1) }}
        />
        <Select
          size="sm"
          value={priorityFilter}
          options={priorityOptions}
          onChange={(e) => { setPriorityFilter(e.target.value as TaskPriority | ''); setPage(1) }}
        />
        <Select
          size="sm"
          value={assignedRoleFilter}
          options={roleOptions}
          onChange={(e) => { setAssignedRoleFilter(e.target.value as UserRole | ''); setPage(1) }}
        />
        <Select
          size="sm"
          value={assignedUserFilter}
          options={userOptions}
          onChange={(e) => { setAssignedUserFilter(e.target.value); setPage(1) }}
        />
        <Select
          size="sm"
          value={sourceDomainFilter}
          options={sourceOptions}
          onChange={(e) => { setSourceDomainFilter(e.target.value as WorkQueueSourceType | ''); setPage(1) }}
        />
        <DatePicker
          value={dueAfterFilter}
          onChange={(value) => { setDueAfterFilter(value); setPage(1) }}
          compact
        />
        <DatePicker
          value={dueBeforeFilter}
          onChange={(value) => { setDueBeforeFilter(value); setPage(1) }}
          compact
        />
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={resetFilters}>
            נקה פילטרים
          </Button>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-negative-200 bg-negative-50 px-4 py-2 text-sm text-negative-700">
          {actionError}
        </div>
      )}

      {/* List */}
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-100" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-sm text-negative-600">שגיאה בטעינת משימות</div>
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <div className="text-sm text-neutral-500">אין משימות</div>
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100">
              <span className="flex-1">כותרת</span>
              <span className="w-24 text-center">סטטוס</span>
              <span className="w-20 text-center">עדיפות</span>
              <span className="w-28 text-center">תאריך יעד</span>
              <span className="w-32 text-center">פעולות</span>
            </div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm hover:bg-neutral-50 transition-colors"
              >
                <button
                  className="flex-1 text-start text-neutral-800 truncate hover:text-primary-700"
                  onClick={() => setModal({ mode: 'view', taskId: task.id })}
                >
                  {task.title}
                </button>
                <span className="w-24 text-center text-xs text-neutral-600">
                  {taskStatusLabels[task.status] ?? task.status}
                </span>
                <span className="w-20 text-center text-xs text-neutral-600">
                  {taskPriorityLabels[task.priority] ?? task.priority}
                </span>
                <span className="w-28 text-center text-xs text-neutral-500">
                  {task.due_date ?? '—'}
                </span>
                <div className="w-32 flex items-center justify-center gap-1">
                  {!isTerminal(task) && (
                    <>
                      <button
                        className="text-xs text-neutral-500 hover:text-primary-700 disabled:opacity-40"
                        onClick={() => setModal({ mode: 'edit', taskId: task.id })}
                        disabled={isActionBusy}
                      >
                        עריכה
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        className="text-xs text-success-600 hover:text-success-700 disabled:opacity-40"
                        onClick={() => completeMutation.mutate(task.id)}
                        disabled={isActionBusy}
                      >
                        הושלם
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        className="text-xs text-negative-600 hover:text-negative-700 disabled:opacity-40"
                        onClick={() => {
                          if (window.confirm('לבטל את המשימה?')) cancelMutation.mutate(task.id)
                        }}
                        disabled={isActionBusy}
                      >
                        ביטול
                      </button>
                    </>
                  )}
                  {isTerminal(task) && (
                    <button
                      className="text-xs text-neutral-400 hover:text-negative-600 disabled:opacity-40"
                      onClick={() => {
                        if (window.confirm('למחוק את המשימה?')) deleteMutation.mutate(task.id)
                      }}
                      disabled={isActionBusy}
                    >
                      מחיקה
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationCard
              page={page}
              totalPages={totalPages}
              total={total}
              label="משימות"
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {modal !== null && (
        <TaskModal
          mode={modal.mode}
          task={modal.mode !== 'create' ? (editTaskQuery.data ?? null) : null}
          isLoading={
            createMutation.isPending ||
            updateMutation.isPending ||
            (modal.mode !== 'create' && editTaskQuery.isLoading)
          }
          onSubmit={handleModalSubmit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
