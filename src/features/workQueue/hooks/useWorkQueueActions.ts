import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { tasksApi, tasksQK, type TaskCreateRequest, type TaskUpdateRequest } from '@/features/tasks'
import type { TaskSourceContext } from '@/features/tasks'
import { toast } from '@/utils/toast'
import { workQueueQK } from '../api'
import type { WorkQueueAction, WorkQueueItem, WorkQueueListResponse, WorkQueueSourceType } from '../api'

type TaskModalState = {
  mode: 'create' | 'edit' | 'view' | 'link'
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

const linkedTaskSourceContext = (item: WorkQueueItem): TaskSourceContext | null => {
  if (item.source_type !== 'task' || !item.source_summary) return null
  return {
    source_domain: item.source_summary.source_type as WorkQueueSourceType,
    source_id: item.source_summary.source_id,
    title: item.source_summary.label,
    client_name: item.client_name,
    due_date: item.due_date,
  }
}

const optimisticallyRemoveTask = (data: WorkQueueListResponse | undefined, taskId: number) => {
  if (!data) return data
  let changed = false
  let removedStandaloneRow = false
  const items = data.items
    .map((item) => {
      if (item.source_type === 'task' && item.source_id === taskId) {
        changed = true
        removedStandaloneRow = true
        return null
      }
      const linked_tasks = item.linked_tasks.filter((task) => task.id !== taskId)
      if (linked_tasks.length === item.linked_tasks.length) return item
      changed = true
      return {
        ...item,
        linked_tasks,
        linked_tasks_count: linked_tasks.length,
      }
    })
    .filter((item): item is WorkQueueItem => item !== null)
  if (!changed) return data
  return {
    ...data,
    items,
    total: removedStandaloneRow ? Math.max(0, data.total - 1) : data.total,
  }
}

type WorkQueueListSnapshot = Array<[readonly unknown[], WorkQueueListResponse | undefined]>

export const useWorkQueueActions = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const focusReturnRef = useRef<HTMLElement | null>(null)
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
    onMutate: async ({ item, action }) => {
      const taskId = action.task_id ?? (item.source_type === 'task' ? item.source_id : undefined)
      const removesTask =
        taskId != null &&
        (action.key.startsWith('complete_task') ||
          action.key.startsWith('cancel_task') ||
          action.key.startsWith('delete_task'))
      if (!removesTask) return {}
      await qc.cancelQueries({ queryKey: workQueueQK.all })
      const previousLists = qc.getQueriesData<WorkQueueListResponse>({ queryKey: workQueueQK.lists })
      qc.setQueriesData<WorkQueueListResponse>({ queryKey: workQueueQK.lists }, (old) =>
        optimisticallyRemoveTask(old, taskId),
      )
      return { previousLists }
    },
    onSuccess: async (_data, variables) => {
      toast.success('הפעולה בוצעה בהצלחה')
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
      if (variables.action.task_id != null || variables.item.source_type === 'task') {
        await qc.invalidateQueries({ queryKey: tasksQK.all })
      }
    },
    onError: (err, _variables, context: { previousLists?: WorkQueueListSnapshot } | undefined) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data)
      })
      toast.error('הפעולה נכשלה', {
        description: err instanceof Error ? err.message : undefined,
      })
      void qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
    onSettled: () => {
      setActiveActionKey(null)
      restoreFocus()
    },
  })

  const handleTaskMutationSuccess = async (message: string) => {
    toast.success(message)
    setTaskModal(null)
    restoreFocus()
    await qc.invalidateQueries({ queryKey: tasksQK.all })
    await qc.invalidateQueries({ queryKey: workQueueQK.all })
  }

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: () => handleTaskMutationSuccess('המשימה נוצרה בהצלחה'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'יצירת המשימה נכשלה'),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: () => handleTaskMutationSuccess('המשימה עודכנה בהצלחה'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'עדכון המשימה נכשל'),
  })

  const rememberFocus = (target?: HTMLElement | null) => {
    const active = target ?? document.activeElement
    focusReturnRef.current = active instanceof HTMLElement ? active : null
  }

  const restoreFocus = () => {
    window.setTimeout(() => {
      const target = focusReturnRef.current?.isConnected
        ? focusReturnRef.current
        : document.querySelector<HTMLElement>('[data-work-queue-focus-fallback="true"]')
      target?.focus()
      focusReturnRef.current = null
    }, 0)
  }

  const openCreateTask = () => {
    rememberFocus()
    setTaskModal({ mode: 'create', source: null })
  }
  const closeTaskModal = () => {
    setTaskModal(null)
    restoreFocus()
  }
  const closeConfirm = () => {
    setPendingConfirm(null)
    restoreFocus()
  }

  const runAction = (item: WorkQueueItem, action: WorkQueueAction, focusTarget?: HTMLElement | null) => {
    rememberFocus(focusTarget)
    if (action.disabled) {
      if (action.disabled_reason) toast.warning(action.disabled_reason)
      restoreFocus()
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
      if (action.key === 'link_task_to_source') {
        const taskId = item.source_type === 'task' ? item.source_id : undefined
        if (!taskId) return
        setTaskModal({ mode: 'link', taskId })
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
        source: linkedTaskSourceContext(item),
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
