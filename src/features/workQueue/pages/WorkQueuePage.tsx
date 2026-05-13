import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import { api } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { TaskModal, type TaskSourceContext } from '@/features/tasks/components/TaskModal'
import { tasksApi, tasksQK, type TaskCreateRequest, type TaskUpdateRequest } from '@/features/tasks/api'
import { toast } from '@/utils/toast'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'
import { WorkQueueTable } from '../components/WorkQueueTable'
import { workQueueQK } from '../api'
import { workQueueSourceTypeLabels } from '../constants'
import type { WorkQueueAction, WorkQueueItem } from '../api'

const actionKey = (item: WorkQueueItem, action: WorkQueueAction) => `${item.id}:${action.key}`

const metadataText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return null
}

const metadataValue = (item: WorkQueueItem, key: string): unknown => {
  const metadata = item.metadata as Record<string, unknown> | null | undefined
  return metadata?.[key]
}

const groupLabel = (item: WorkQueueItem): string => {
  const type = item.type_label ?? workQueueSourceTypeLabels[item.source_type] ?? item.source_type
  const period = metadataText(metadataValue(item, 'period'))
  const taxYear = metadataText(metadataValue(item, 'tax_year'))
  const datePart = item.due_date ? `יעד ${item.due_date}` : 'ללא תאריך יעד'
  const context = period ?? taxYear
  return context ? `${type} · ${context} · ${datePart}` : `${type} · ${datePart}`
}

const groupKey = (item: WorkQueueItem): string => {
  const period = metadataText(metadataValue(item, 'period'))
  const taxYear = metadataText(metadataValue(item, 'tax_year'))
  return [item.source_type, period ?? taxYear ?? 'none', item.due_date ?? 'no-due-date'].join(':')
}

const groupItems = (items: WorkQueueItem[]) => {
  const groups = new Map<string, { label: string; rows: WorkQueueItem[] }>()
  for (const item of items) {
    const key = groupKey(item)
    const label = groupLabel(item)
    const group = groups.get(key)
    if (group) group.rows.push(item)
    else groups.set(key, { label, rows: [item] })
  }
  return Array.from(groups, ([key, group]) => ({ key, ...group }))
}

type TaskModalState = {
  mode: 'create' | 'edit' | 'view'
  taskId?: number
  source?: TaskSourceContext | null
}

const sourceContext = (item: WorkQueueItem): TaskSourceContext => ({
  source_domain: item.source_type,
  source_id: item.source_id,
  title: item.title,
  client_name: item.client_name,
  due_date: item.due_date,
  linked_tasks_count: item.linked_tasks_count,
  linked_tasks: item.linked_tasks,
})

export const WorkQueuePage: React.FC = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [pendingConfirm, setPendingConfirm] = useState<{ item: WorkQueueItem; action: WorkQueueAction } | null>(null)
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null)
  const {
    items,
    allItems,
    isLoading,
    error,
    search,
    setSearch,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    linkedFilter,
    setLinkedFilter,
    scopeFilter,
    setScopeFilter,
    historyMode,
    setHistoryMode,
    specialFilter,
    setSpecialFilter,
    hasFilters,
    clearFilters,
  } = useWorkQueuePage()

  const taskDetail = useQuery({
    queryKey: taskModal?.taskId ? tasksQK.detail(taskModal.taskId) : ['tasks', 'detail', 'idle'],
    queryFn: () => tasksApi.get(taskModal!.taskId!),
    enabled: Boolean(taskModal?.taskId),
  })

  const header = (
    <PageHeader
      title="עבודה לטיפול"
      description="כל מה שדורש טיפול: דוחות, חיובים, מקדמות, קלסרים ומשימות ידניות."
      actions={
        <Button size="sm" onClick={() => setTaskModal({ mode: 'create', source: null })}>
          + משימה חדשה
        </Button>
      }
    />
  )

  const actionMutation = useMutation({
    mutationFn: async ({ action }: { item: WorkQueueItem; action: WorkQueueAction }) => {
      if (!action.endpoint || !action.method) throw new Error('פעולה לא תקינה')
      return api.request({ url: action.endpoint, method: action.method })
    },
    onSuccess: async (_data, variables) => {
      toast.success('הפעולה בוצעה בהצלחה')
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
      if (variables.action.key.includes('task')) {
        await qc.invalidateQueries({ queryKey: tasksQK.all })
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'הפעולה נכשלה')
      void qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
    onSettled: () => setActiveActionKey(null),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: async () => {
      toast.success('המשימה נוצרה בהצלחה')
      setTaskModal(null)
      await qc.invalidateQueries({ queryKey: tasksQK.all })
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'יצירת המשימה נכשלה'),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: async () => {
      toast.success('המשימה עודכנה בהצלחה')
      setTaskModal(null)
      await qc.invalidateQueries({ queryKey: tasksQK.all })
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'עדכון המשימה נכשל'),
  })

  const runAction = (item: WorkQueueItem, action: WorkQueueAction) => {
    if (action.disabled) {
      if (action.disabled_reason) toast.warning(action.disabled_reason)
      return
    }
    if (action.type === 'link') {
      if (action.route) navigate(action.route)
      return
    }
    if (action.type === 'modal') {
      if (action.key === 'create_linked_task') {
        setTaskModal({ mode: 'create', source: sourceContext(item) })
        return
      }
      const taskId = action.task_id ?? (item.source_type === 'task' ? item.source_id : undefined)
      if (!taskId) {
        toast.error('לא נמצאה משימה לפתיחה')
        return
      }
      setTaskModal({ mode: action.key.startsWith('edit_task') ? 'edit' : 'view', taskId })
      return
    }
    if (action.confirm) {
      setPendingConfirm({ item, action })
      return
    }
    setActiveActionKey(actionKey(item, action))
    actionMutation.mutate({ item, action })
  }

  const confirmAction = () => {
    if (!pendingConfirm) return
    const { item, action } = pendingConfirm
    setActiveActionKey(actionKey(item, action))
    actionMutation.mutate({ item, action })
    setPendingConfirm(null)
  }

  const renderBody = () => {
    if (items.length === 0) {
      if (hasFilters) {
        return (
          <StateCard
            icon={CheckSquare}
            title="אין תוצאות"
            message="אין תוצאות שתואמות לסינון"
            secondaryAction={{ label: 'אפס סינון', onClick: clearFilters }}
          />
        )
      }
      return (
        <StateCard
          icon={CheckSquare}
          variant="illustration"
          title={historyMode ? 'אין היסטוריה' : 'אין עבודה לטיפול'}
          message={
            historyMode
              ? 'אין משימות היסטוריות להצגה.'
              : 'אין כרגע עבודה לטיפול. כל הדוחות, התשלומים והמשימות הפעילות מסודרים.'
          }
        />
      )
    }

    return (
      <div className="space-y-5">
        {groupItems(items).map((group) => (
          <section key={group.key} className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-sm font-semibold text-gray-900">{group.label}</h2>
              <span className="text-xs text-gray-500">{group.rows.length} פריטים</span>
            </div>
            <WorkQueueTable items={group.rows} activeActionKey={activeActionKey} onAction={runAction} />
          </section>
        ))}
      </div>
    )
  }

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען משימות...">
      <WorkQueueSummaryCards
        items={allItems}
        urgencyFilter={urgencyFilter}
        onFilter={setUrgencyFilter}
        specialFilter={specialFilter}
        onSpecialFilter={setSpecialFilter}
      />

      <WorkQueueFiltersBar
        search={search}
        onSearchChange={setSearch}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        linkedFilter={linkedFilter}
        onLinkedChange={setLinkedFilter}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        historyMode={historyMode}
        onHistoryModeChange={setHistoryMode}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {renderBody()}

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.action.confirm_title ?? 'אישור פעולה'}
        message={pendingConfirm?.action.confirm_message ?? 'האם לבצע את הפעולה?'}
        confirmLabel="אישור"
        cancelLabel="ביטול"
        isLoading={actionMutation.isPending}
        onConfirm={confirmAction}
        onCancel={() => setPendingConfirm(null)}
      />

      {taskModal && (
        <TaskModal
          mode={taskModal.mode}
          task={taskDetail.data}
          source={taskModal.source}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending || taskDetail.isLoading}
          onClose={() => setTaskModal(null)}
          onSubmit={(data) => {
            if (taskModal.mode === 'create') createTaskMutation.mutate(data as TaskCreateRequest)
            if (taskModal.mode === 'edit' && taskModal.taskId) {
              updateTaskMutation.mutate({ id: taskModal.taskId, data: data as TaskUpdateRequest })
            }
          }}
        />
      )}
    </PageStateGuard>
  )
}
