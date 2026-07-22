import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getErrorMessage, parsePositiveInt } from '@/utils/utils'
import { useActiveUserFilterOptions } from '@/features/users'
import { createClientPickerFilter } from '@/features/clients/public'
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
  taskSortOptions,
  taskOrderOptions,
} from '../constants/pageConstants'
import { useTaskActions } from './useTaskActions'
import { useTaskFilters } from './useTaskFilters'
import { useTasks } from './useTasks'
import { TASKS_ERROR_MESSAGES } from '../errorMessages'
import { TASKS_MESSAGES } from '../messages'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { randomUUID } from '@/utils/random'
import { isTaskTerminal } from '../utils/taskFormatters'
import { useBulkAssignTasks } from './useBulkAssignTasks'
import { useBulkCompleteTasks } from './useBulkCompleteTasks'
import type { Task } from '../api/contracts'
import type { UseTasksPageOptions } from '../types'

export const useTasksPage = ({ pinnedClientId }: UseTasksPageOptions = {}) => {
  const filters = useTaskFilters(pinnedClientId)
  const { getParam, setFilter } = useSearchParamFilters()
  const initialViewTaskId = parsePositiveInt(getParam('task_id'), 0) || null
  const actions = useTaskActions(initialViewTaskId)
  const { options: userOptions } = useActiveUserFilterOptions()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkAssigneeId, setBulkAssigneeId] = useState('')
  const [bulkFeedback, setBulkFeedback] = useState<{ message: string; hasFailures: boolean } | null>(null)
  const bulkComplete = useBulkCompleteTasks()
  const bulkAssign = useBulkAssignTasks()

  const tasksQuery = useTasks(filters.listParams)

  const {
    data: editTaskData,
    isLoading: editTaskLoading,
    error: editTaskError,
  } = useQuery({
    queryKey: tasksQK.detail(actions.modal && actions.modal.mode !== 'create' ? actions.modal.taskId : 0),
    queryFn: () => tasksApi.get((actions.modal as { taskId: number }).taskId),
    enabled: actions.modal !== null && actions.modal.mode !== 'create',
  })

  const tasks = tasksQuery.data?.items ?? []
  const total = tasksQuery.data?.total ?? 0

  const loadedModalTask = actions.modal?.mode !== 'create' ? (editTaskData ?? null) : null
  const isForeignModalTask =
    pinnedClientId != null && loadedModalTask != null && loadedModalTask.client_record_id !== pinnedClientId
  const modal = isForeignModalTask ? null : actions.modal
  const modalTask = isForeignModalTask ? null : loadedModalTask
  const confirmCopy = actions.pendingConfirm ? TASK_CONFIRM_COPY[actions.pendingConfirm.action] : null

  const filterFields = useMemo<FilterFieldDef[]>(
    () => [
      { type: 'search', key: TASK_FILTER_PARAM_KEYS.search, label: 'חיפוש', placeholder: 'חיפוש לפי כותרת או תיאור' },
      ...(pinnedClientId
        ? []
        : [
            createClientPickerFilter({
              idKey: TASK_FILTER_PARAM_KEYS.clientId,
              nameKey: TASK_FILTER_PARAM_KEYS.clientName,
              label: 'לקוח',
            }),
          ]),
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
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.sortBy, label: 'מיון לפי', options: taskSortOptions },
      { type: 'select', key: TASK_FILTER_PARAM_KEYS.order, label: 'סדר', options: taskOrderOptions },
    ],
    [pinnedClientId, userOptions],
  )

  const filterValues = useMemo(
    () => ({
      [TASK_FILTER_PARAM_KEYS.search]: filters.filters.search,
      [TASK_FILTER_PARAM_KEYS.clientId]: filters.filters.clientId,
      [TASK_FILTER_PARAM_KEYS.clientName]: filters.filters.clientName,
      [TASK_FILTER_PARAM_KEYS.status]: filters.filters.status,
      [TASK_FILTER_PARAM_KEYS.priority]: filters.filters.priority,
      [TASK_FILTER_PARAM_KEYS.assignedRole]: filters.filters.assignedRole,
      [TASK_FILTER_PARAM_KEYS.assignedUser]: filters.filters.assignedUser,
      [TASK_FILTER_PARAM_KEYS.sourceDomain]: filters.filters.sourceDomain,
      [TASK_FILTER_PARAM_KEYS.dueAfter]: filters.filters.dueAfter,
      [TASK_FILTER_PARAM_KEYS.dueBefore]: filters.filters.dueBefore,
      [TASK_FILTER_PARAM_KEYS.sortBy]: filters.filters.sortBy,
      [TASK_FILTER_PARAM_KEYS.order]: filters.filters.order,
    }),
    [filters.filters],
  )

  const filterSignature = JSON.stringify(filterValues)
  useEffect(() => {
    setSelectedIds(new Set())
    setBulkFeedback(null)
  }, [filterSignature, pinnedClientId])

  const selectableTasks = tasks.filter((task) => !isTaskTerminal(task.status))
  const isBulkLoading = bulkComplete.isPending || bulkAssign.isPending
  const clearSelection = () => setSelectedIds(new Set())
  const toggleTask = (task: Task) => {
    if (isTaskTerminal(task.status)) return
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(task.id)) next.delete(task.id)
      else next.add(task.id)
      return next
    })
  }
  const toggleAllTasks = () =>
    setSelectedIds((current) =>
      current.size === selectableTasks.length ? new Set() : new Set(selectableTasks.map((task) => task.id)),
    )
  const completeSelected = async () => {
    try {
      const result = await bulkComplete.mutateAsync({ taskIds: [...selectedIds], idempotencyKey: randomUUID() })
      clearSelection()
      setBulkFeedback({
        message:
          result.failed.length === 0
            ? TASKS_MESSAGES.clientTab.bulkCompleteSuccess(result.succeeded.length)
            : TASKS_ERROR_MESSAGES.clientTab.bulkCompletePartial(result.succeeded.length, result.failed.length),
        hasFailures: result.failed.length > 0,
      })
    } catch (bulkError) {
      setBulkFeedback({
        message: getErrorMessage(bulkError, TASKS_ERROR_MESSAGES.clientTab.bulkCompleteFailed),
        hasFailures: true,
      })
    }
  }
  const assignSelected = async (assigneeUserId: number | null) => {
    try {
      const result = await bulkAssign.mutateAsync({
        taskIds: [...selectedIds],
        assigneeUserId,
        idempotencyKey: randomUUID(),
      })
      clearSelection()
      setBulkAssigneeId('')
      setBulkFeedback({
        message:
          result.failed.length === 0
            ? TASKS_MESSAGES.clientTab.bulkAssignSuccess(result.succeeded.length)
            : TASKS_ERROR_MESSAGES.clientTab.bulkAssignPartial(result.succeeded.length, result.failed.length),
        hasFailures: result.failed.length > 0,
      })
    } catch (bulkError) {
      setBulkFeedback({
        message: getErrorMessage(bulkError, TASKS_ERROR_MESSAGES.clientTab.bulkAssignFailed),
        hasFailures: true,
      })
    }
  }

  return {
    page: filters.page,
    hasFilters: filters.hasFilters,
    filterBar: {
      fields: filterFields,
      values: filterValues,
      onChange: (key: string, value: string) => filters.handleFilterChange(key as TaskFilterParamKey, value),
      onMultiChange: (updates: Record<string, string>) => filters.setFilters(updates, true),
      onReset: filters.resetFilters,
    },
    tasks,
    total,
    summary: tasksQuery.data?.summary,
    activeStatus: filters.filters.status || null,
    isLoading: tasksQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    listError: tasksQuery.isError ? getErrorMessage(tasksQuery.error, TASKS_ERROR_MESSAGES.clientTab.loadError) : null,
    retryList: tasksQuery.refetch,
    actionError: actions.actionError,
    isActionBusy: actions.isActionBusy,
    modal,
    modalTask,
    modalLoadError: editTaskError ? getErrorMessage(editTaskError, TASKS_ERROR_MESSAGES.clientTab.loadDetailsError) : null,
    isModalLoading: actions.isModalSaving || (modal !== null && modal.mode !== 'create' && editTaskLoading),
    confirmDialog: {
      open: Boolean(actions.pendingConfirm && confirmCopy),
      title: confirmCopy?.title ?? '',
      message: confirmCopy?.message ?? '',
      confirmLabel: confirmCopy?.confirmLabel ?? '',
      confirmVariant: actions.pendingConfirm?.action === 'complete' ? ('primary' as const) : ('danger' as const),
      isLoading: actions.isConfirming,
      onConfirm: actions.confirmPendingAction,
      onCancel: actions.closeConfirm,
    },
    setPage: (nextPage: number) => {
      filters.setPage(nextPage)
      clearSelection()
    },
    bulk: {
      feedback: bulkFeedback,
      dismissFeedback: () => setBulkFeedback(null),
      selectedCount: selectedIds.size,
      assigneeId: bulkAssigneeId,
      assigneeOptions: userOptions.slice(1),
      isLoading: isBulkLoading,
      isCompleteLoading: bulkComplete.isPending,
      isAssignLoading: bulkAssign.isPending,
      setAssigneeId: setBulkAssigneeId,
      clearSelection,
      completeSelected,
      assignSelected,
      selection: {
        selectedIds,
        selectableCount: selectableTasks.length,
        disabled: isBulkLoading,
        onToggle: toggleTask,
        onToggleAll: toggleAllTasks,
      },
    },
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
