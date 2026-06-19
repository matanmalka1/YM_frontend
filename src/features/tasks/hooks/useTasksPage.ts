import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTotalPages } from '@/utils/paginationUtils'
import { useActiveUserOptions } from '@/features/users'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import {
  TASKS_PAGE_SIZE,
  TASK_CONFIRM_COPY,
  taskPriorityOptions,
  taskRoleOptions,
  taskSourceOptions,
  taskStatusOptions,
} from '../constants/pageConstants'
import { useTaskActions } from './useTaskActions'
import { useTaskFilters } from './useTaskFilters'
import { useTasks } from './useTasks'

export const useTasksPage = () => {
  const filters = useTaskFilters()
  const actions = useTaskActions()
  const usersQuery = useActiveUserOptions()

  const tasksQuery = useTasks(filters.listParams)

  const { data: editTaskData, isLoading: editTaskLoading } = useQuery({
    queryKey: tasksQK.detail(actions.modal && actions.modal.mode !== 'create' ? actions.modal.taskId : 0),
    queryFn: () => tasksApi.get((actions.modal as { taskId: number }).taskId),
    enabled: actions.modal !== null && actions.modal.mode !== 'create',
  })

  const tasks = tasksQuery.data?.items ?? []
  const total = tasksQuery.data?.total ?? 0
  const totalPages = getTotalPages(total, TASKS_PAGE_SIZE)

  const userOptions = useMemo(
    () => [
      { value: '', label: 'כל המשתמשים' },
      ...(usersQuery.data?.items ?? []).map((user) => ({ value: String(user.id), label: user.full_name })),
    ],
    [usersQuery.data?.items],
  )

  const confirmCopy = actions.pendingConfirm ? TASK_CONFIRM_COPY[actions.pendingConfirm.action] : null

  return {
    page: filters.page,
    filters: filters.filters,
    hasFilters: filters.hasFilters,
    tasks,
    total,
    totalPages,
    visibleCount: tasks.length,
    featuredTask: tasks[0] ?? null,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    actionError: actions.actionError,
    isActionBusy: actions.isActionBusy,
    modal: actions.modal,
    modalTask: actions.modal?.mode !== 'create' ? (editTaskData ?? null) : null,
    isModalLoading:
      actions.isModalSaving || (actions.modal !== null && actions.modal.mode !== 'create' && editTaskLoading),
    confirmDialog: {
      open: Boolean(actions.pendingConfirm && confirmCopy),
      title: confirmCopy?.title ?? '',
      message: confirmCopy?.message ?? '',
      confirmLabel: confirmCopy?.confirmLabel ?? '',
      isLoading: actions.isConfirming,
      onConfirm: actions.confirmPendingAction,
      onCancel: actions.closeConfirm,
    },
    statusOptions: taskStatusOptions,
    priorityOptions: taskPriorityOptions,
    roleOptions: taskRoleOptions,
    userOptions,
    sourceOptions: taskSourceOptions,
    setPage: filters.setPage,
    handleFilterChange: filters.handleFilterChange,
    resetFilters: filters.resetFilters,
    openCreateModal: actions.openCreateModal,
    openViewModal: actions.openViewModal,
    openEditModal: actions.openEditModal,
    closeModal: actions.closeModal,
    submitModal: actions.submitModal,
    completeTask: actions.completeTask,
    cancelTask: actions.cancelTask,
    deleteTask: actions.deleteTask,
  }
}
