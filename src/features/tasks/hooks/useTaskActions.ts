import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { TaskCreateRequest, TaskUpdateRequest } from '../api/contracts'
import type { TaskConfirmAction, TaskConfirmState, TaskModalState } from '../types'
import { TASKS_MESSAGES } from '../messages'
import { TASKS_ERROR_MESSAGES } from '../errorMessages'

const getMutationError = (error: unknown, fallback: string): string => getErrorMessage(error, fallback)

export const useTaskActions = (initialViewTaskId: number | null = null) => {
  const qc = useQueryClient()
  const [modal, setModal] = useState<TaskModalState>(initialViewTaskId ? { mode: 'view', taskId: initialViewTaskId } : null)
  const [pendingConfirm, setPendingConfirm] = useState<TaskConfirmState | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidateTaskLists = () => qc.invalidateQueries({ queryKey: tasksQK.all })

  const createMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: async () => {
      toast.success(TASKS_MESSAGES.mutations.createSuccess)
      await invalidateTaskLists()
      setModal(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, TASKS_ERROR_MESSAGES.mutations.createError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: async (task) => {
      toast.success(TASKS_MESSAGES.mutations.updateSuccess)
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setModal(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, TASKS_ERROR_MESSAGES.mutations.updateError)),
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => tasksApi.complete(id),
    onSuccess: async (task) => {
      toast.success(TASKS_MESSAGES.mutations.completeSuccess)
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, TASKS_ERROR_MESSAGES.mutations.completeError)),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => tasksApi.cancel(id),
    onSuccess: async (task) => {
      toast.success(TASKS_MESSAGES.mutations.cancelSuccess)
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setPendingConfirm(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, TASKS_ERROR_MESSAGES.mutations.cancelError)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: async (_data, id) => {
      toast.success(TASKS_MESSAGES.mutations.deleteSuccess)
      qc.removeQueries({ queryKey: tasksQK.detail(id) })
      await invalidateTaskLists()
      setPendingConfirm(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, TASKS_ERROR_MESSAGES.mutations.deleteError)),
  })

  const openConfirm = (action: TaskConfirmAction, taskId: number) => setPendingConfirm({ action, taskId })

  const confirmPendingAction = () => {
    if (!pendingConfirm) return
    if (pendingConfirm.action === 'cancel') {
      cancelMutation.mutate(pendingConfirm.taskId)
      return
    }
    deleteMutation.mutate(pendingConfirm.taskId)
  }

  return {
    modal,
    pendingConfirm,
    actionError,
    isActionBusy: completeMutation.isPending || cancelMutation.isPending || deleteMutation.isPending,
    isModalSaving: createMutation.isPending || updateMutation.isPending,
    isConfirming: cancelMutation.isPending || deleteMutation.isPending,
    openCreateModal: () => {
      setActionError(null)
      setModal({ mode: 'create' })
    },
    openViewModal: (taskId: number) => {
      setActionError(null)
      setModal({ mode: 'view', taskId })
    },
    openEditModal: (taskId: number) => {
      setActionError(null)
      setModal({ mode: 'edit', taskId })
    },
    closeModal: () => {
      setActionError(null)
      setModal(null)
    },
    closeConfirm: () => setPendingConfirm(null),
    confirmPendingAction,
    submitModal: (data: TaskCreateRequest | TaskUpdateRequest) => {
      if (!modal) return
      setActionError(null)
      if (modal.mode === 'create') {
        createMutation.mutate(data as TaskCreateRequest)
        return
      }
      if (modal.mode === 'edit') {
        updateMutation.mutate({ id: modal.taskId, data: data as TaskUpdateRequest })
      }
    },
    completeTask: (taskId: number) => completeMutation.mutate(taskId),
    cancelTask: (taskId: number) => openConfirm('cancel', taskId),
    deleteTask: (taskId: number) => openConfirm('delete', taskId),
  }
}
