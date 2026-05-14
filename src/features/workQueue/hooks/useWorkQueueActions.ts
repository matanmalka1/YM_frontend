import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { tasksApi, tasksQK, type TaskCreateRequest, type TaskUpdateRequest } from '@/features/tasks/api'
import type { TaskSourceContext } from '@/features/tasks'
import { toast } from '@/utils/toast'
import { workQueueQK } from '../api'
import type { WorkQueueAction, WorkQueueItem } from '../api'

type TaskModalState = {
  mode: 'create' | 'edit' | 'view'
  taskId?: number
  source?: TaskSourceContext | null
}

const actionKey = (item: WorkQueueItem, action: WorkQueueAction) => `${item.id}:${action.key}`

const sourceContext = (item: WorkQueueItem): TaskSourceContext => ({
  source_domain: item.source_type,
  source_id: item.source_id,
  title: item.title,
  client_name: item.client_name,
  due_date: item.due_date,
  linked_tasks_count: item.linked_tasks_count,
  linked_tasks: item.linked_tasks,
})

export const useWorkQueueActions = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [pendingConfirm, setPendingConfirm] = useState<{ item: WorkQueueItem; action: WorkQueueAction } | null>(null)
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null)

  const taskDetail = useQuery({
    queryKey: tasksQK.detail(taskModal?.taskId ?? 0),
    queryFn: () => tasksApi.get(taskModal!.taskId!),
    enabled: Boolean(taskModal?.taskId),
  })

  const actionMutation = useMutation({
    mutationFn: async ({ action }: { item: WorkQueueItem; action: WorkQueueAction }) => {
      if (!action.endpoint || !action.method) throw new Error('פעולה לא תקינה')
      return api.request({ url: action.endpoint, method: action.method })
    },
    onSuccess: async (_data, variables) => {
      toast.success('הפעולה בוצעה בהצלחה')
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
      if (variables.action.task_id != null || variables.item.source_type === 'task') {
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

  const openCreateTask = () => setTaskModal({ mode: 'create', source: null })
  const closeTaskModal = () => setTaskModal(null)
  const closeConfirm = () => setPendingConfirm(null)

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
      setTaskModal({
        mode: action.key.startsWith('continue_task') || action.key.startsWith('edit_task') ? 'edit' : 'view',
        taskId,
      })
      return
    }
    if (action.confirm) {
      setPendingConfirm({ item, action })
      return
    }
    if (actionMutation.isPending) return
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

  const submitTask = (data: TaskCreateRequest | TaskUpdateRequest) => {
    if (!taskModal || taskModal.mode === 'view') return
    if (taskModal.mode === 'create') {
      createTaskMutation.mutate(data as TaskCreateRequest)
    } else if (taskModal.taskId) {
      updateTaskMutation.mutate({ id: taskModal.taskId, data: data as TaskUpdateRequest })
    }
  }

  return {
    pendingConfirm,
    activeActionKey,
    taskModal,
    taskDetail,
    actionMutation,
    createTaskMutation,
    updateTaskMutation,
    openCreateTask,
    runAction,
    confirmAction,
    closeConfirm,
    closeTaskModal,
    submitTask,
  }
}
