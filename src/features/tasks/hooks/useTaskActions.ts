import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { TaskCreateRequest, TaskUpdateRequest } from '../api/contracts'
import type { TaskConfirmAction, TaskConfirmState, TaskModalState } from '../types'

const getMutationError = (error: unknown, fallback: string): string => getErrorMessage(error, fallback)

export const useTaskActions = () => {
  const qc = useQueryClient()
  const [modal, setModal] = useState<TaskModalState>(null)
  const [pendingConfirm, setPendingConfirm] = useState<TaskConfirmState | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidateTaskLists = () => qc.invalidateQueries({ queryKey: tasksQK.all })

  const createMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: async () => {
      toast.success('המשימה נוצרה בהצלחה')
      await invalidateTaskLists()
      setModal(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, 'שגיאה ביצירת משימה')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: async (task) => {
      toast.success('המשימה עודכנה בהצלחה')
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setModal(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, 'שגיאה בעדכון משימה')),
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => tasksApi.complete(id),
    onSuccess: async (task) => {
      toast.success('המשימה סומנה כהושלמה')
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, 'שגיאה בסימון המשימה כהושלמה')),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => tasksApi.cancel(id),
    onSuccess: async (task) => {
      toast.success('המשימה בוטלה')
      qc.setQueryData(tasksQK.detail(task.id), task)
      await invalidateTaskLists()
      setPendingConfirm(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, 'שגיאה בביטול המשימה')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: async (_data, id) => {
      toast.success('המשימה נמחקה')
      qc.removeQueries({ queryKey: tasksQK.detail(id) })
      await invalidateTaskLists()
      setPendingConfirm(null)
      setActionError(null)
    },
    onError: (error) => setActionError(getMutationError(error, 'שגיאה במחיקת המשימה')),
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
    openCreateModal: () => setModal({ mode: 'create' }),
    openViewModal: (taskId: number) => setModal({ mode: 'view', taskId }),
    openEditModal: (taskId: number) => setModal({ mode: 'edit', taskId }),
    closeModal: () => setModal(null),
    closeConfirm: () => setPendingConfirm(null),
    confirmPendingAction,
    submitModal: (data: TaskCreateRequest | TaskUpdateRequest) => {
      if (!modal) return
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
