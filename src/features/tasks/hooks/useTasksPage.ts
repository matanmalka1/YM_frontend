import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getErrorMessage, parsePositiveInt } from '@/utils/utils'
import { useActiveUserFilterOptions } from '@/features/users'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import {
  TASK_CONFIRM_COPY,
  TASK_FILTER_PARAM_KEYS,
  type TaskFilterParamKey,
  taskPriorityOptions,
  taskRoleOptions,
  taskSourceOptions,
  taskStatusOptions,
} from '../constants/pageConstants'
import { useTaskActions } from './useTaskActions'
import { useTaskFilters } from './useTaskFilters'
import { useTasks } from './useTasks'
import { TASKS_ERROR_MESSAGES } from '../errorMessages'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

export const useTasksPage = () => {
  const filters = useTaskFilters()
  const { getParam, setFilter } = useSearchParamFilters()
  const initialViewTaskId = parsePositiveInt(getParam('task_id'), 0) || null
  const actions = useTaskActions(initialViewTaskId)
  const { options: userOptions } = useActiveUserFilterOptions()

  const tasksQuery = useTasks(filters.listParams)

  const { data: editTaskData, isLoading: editTaskLoading } = useQuery({
    queryKey: tasksQK.detail(actions.modal && actions.modal.mode !== 'create' ? actions.modal.taskId : 0),
    queryFn: () => tasksApi.get((actions.modal as { taskId: number }).taskId),
    enabled: actions.modal !== null && actions.modal.mode !== 'create',
  })

  const tasks = tasksQuery.data?.items ?? []
  const total = tasksQuery.data?.total ?? 0

  const confirmCopy = actions.pendingConfirm ? TASK_CONFIRM_COPY[actions.pendingConfirm.action] : null

  const filterFields = useMemo<FilterFieldDef[]>(
    () => [
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.status, label: 'סטטוס', options: taskStatusOptions },
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.priority, label: 'עדיפות', options: taskPriorityOptions },
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.assignedRole, label: 'תפקיד', options: taskRoleOptions },
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.assignedUser, label: 'משתמש', options: userOptions },
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.sourceDomain, label: 'מקור', options: taskSourceOptions },
      {
        type: 'date-range',
        fromKey: TASK_FILTER_PARAM_KEYS.dueAfter,
        toKey: TASK_FILTER_PARAM_KEYS.dueBefore,
        fromLabel: 'מתאריך',
        toLabel: 'עד תאריך',
      },
    ],
    [userOptions],
  )

  const filterValues = useMemo(
    () => ({
      [TASK_FILTER_PARAM_KEYS.status]: filters.filters.status,
      [TASK_FILTER_PARAM_KEYS.priority]: filters.filters.priority,
      [TASK_FILTER_PARAM_KEYS.assignedRole]: filters.filters.assignedRole,
      [TASK_FILTER_PARAM_KEYS.assignedUser]: filters.filters.assignedUser,
      [TASK_FILTER_PARAM_KEYS.sourceDomain]: filters.filters.sourceDomain,
      [TASK_FILTER_PARAM_KEYS.dueAfter]: filters.filters.dueAfter,
      [TASK_FILTER_PARAM_KEYS.dueBefore]: filters.filters.dueBefore,
    }),
    [filters.filters],
  )

  return {
    page: filters.page,
    hasFilters: filters.hasFilters,
    filterBar: {
      fields: filterFields,
      values: filterValues,
      onChange: (key: string, value: string) => filters.handleFilterChange(key as TaskFilterParamKey, value),
      onReset: filters.resetFilters,
    },
    tasks,
    total,
    visibleCount: tasks.length,
    featuredTask: tasks[0] ?? null,
    isLoading: tasksQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    listError: tasksQuery.isError ? getErrorMessage(tasksQuery.error, TASKS_ERROR_MESSAGES.clientTab.loadError) : null,
    retryList: tasksQuery.refetch,
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
    setPage: filters.setPage,
    openCreateModal: actions.openCreateModal,
    openViewModal: actions.openViewModal,
    openEditModal: actions.openEditModal,
    closeModal: () => {
      actions.closeModal()
      setFilter('task_id', '', false)
    },
    submitModal: actions.submitModal,
    completeTask: actions.completeTask,
    cancelTask: actions.cancelTask,
    deleteTask: actions.deleteTask,
  }
}
