import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tasksApi, tasksQK, type TaskCreateRequest, type TaskUpdateRequest } from '@/features/tasks'
import type { TaskSourceContext } from '@/features/tasks'
import { toast } from '@/utils/toast'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { workQueueQK } from '../api'
import type { WorkQueueAction, WorkQueueItem, WorkQueueListResponse } from '../api'
import { WORK_QUEUE_MESSAGES } from '../messages'
import { WORK_QUEUE_ERROR_MESSAGES } from '../errorMessages'
import {
  getLinkedTaskSourceContext,
  getTaskSourceContext,
  getWorkQueueActionKey,
  isTaskActionKey,
  optimisticallyRemoveTask,
  type WorkQueueListSnapshot,
} from '../utils/workQueueActionHelpers'

type TaskModalState = {
  mode: 'create' | 'edit' | 'view' | 'link'
  taskId?: number
  source?: TaskSourceContext | null
}

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
    mutationFn: async ({ item, action }: { item: WorkQueueItem; action: WorkQueueAction }) => {
      const taskId = action.task_id ?? (item.source_type === 'task' ? item.source_id : undefined)
      if (taskId == null) throw new Error(WORK_QUEUE_ERROR_MESSAGES.actions.invalidAction)
      if (isTaskActionKey(action.key, 'complete_task')) return tasksApi.complete(taskId)
      if (isTaskActionKey(action.key, 'cancel_task')) return tasksApi.cancel(taskId)
      if (isTaskActionKey(action.key, 'delete_task')) return tasksApi.delete(taskId)
      throw new Error(WORK_QUEUE_ERROR_MESSAGES.actions.unsupportedAction)
    },
    onMutate: async ({ item, action }) => {
      const taskId = action.task_id ?? (item.source_type === 'task' ? item.source_id : undefined)
      const removesTask =
        taskId != null &&
        (isTaskActionKey(action.key, 'complete_task') ||
          isTaskActionKey(action.key, 'cancel_task') ||
          isTaskActionKey(action.key, 'delete_task'))
      if (!removesTask) return {}
      await qc.cancelQueries({ queryKey: workQueueQK.all })
      const previousLists = qc.getQueriesData<WorkQueueListResponse>({ queryKey: workQueueQK.lists })
      qc.setQueriesData<WorkQueueListResponse>({ queryKey: workQueueQK.lists }, (old) => optimisticallyRemoveTask(old, taskId))
      return { previousLists }
    },
    onSuccess: async (_data, variables) => {
      toast.success(WORK_QUEUE_MESSAGES.actions.success)
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
      if (variables.action.task_id != null || variables.item.source_type === 'task') {
        await qc.invalidateQueries({ queryKey: tasksQK.all })
      }
    },
    onError: (err, _variables, context: { previousLists?: WorkQueueListSnapshot } | undefined) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data)
      })
      toast.error(WORK_QUEUE_ERROR_MESSAGES.actions.failure, {
        description: getErrorMessage(err, err instanceof Error ? err.message : WORK_QUEUE_ERROR_MESSAGES.actions.failure),
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
    onSuccess: () => handleTaskMutationSuccess(WORK_QUEUE_MESSAGES.actions.createTaskSuccess),
    onError: (err) => showErrorToast(err, WORK_QUEUE_ERROR_MESSAGES.actions.createTaskError),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: () => handleTaskMutationSuccess(WORK_QUEUE_MESSAGES.actions.updateTaskSuccess),
    onError: (err) => showErrorToast(err, WORK_QUEUE_ERROR_MESSAGES.actions.updateTaskError),
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
        setTaskModal({ mode: 'create', source: getTaskSourceContext(item) })
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
        toast.error(WORK_QUEUE_ERROR_MESSAGES.actions.taskNotFound)
        return
      }
      setTaskModal({
        mode: isTaskActionKey(action.key, 'edit_task') ? 'edit' : 'view',
        taskId,
        source: getLinkedTaskSourceContext(item),
      })
      return
    }
    if (action.confirm) {
      setPendingConfirm({ item, action })
      return
    }
    if (actionMutation.isPending) return
    setActiveActionKey(getWorkQueueActionKey(item, action))
    actionMutation.mutate({ item, action })
  }

  const confirmAction = () => {
    if (!pendingConfirm) return
    const { item, action } = pendingConfirm
    setActiveActionKey(getWorkQueueActionKey(item, action))
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
