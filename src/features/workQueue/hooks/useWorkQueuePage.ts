import { useCallback, useEffect, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { CheckSquare } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { parseTaskStatus } from '@/features/tasks'
import {
  WORK_QUEUE_FILTER_PARAM_KEYS,
  WORK_QUEUE_PAGE_SIZE,
  parseWorkQueueSourceType,
  parseWorkQueueUrgency,
  workQueueUrgencyLabels,
  type WorkQueueFilterParamKey,
} from '../constants'
import { buildWorkQueueColumns } from '../components/WorkQueueColumns'
import {
  TASK_RELATION_KEY,
  expandTaskRelation,
  parseLinkedFilter,
  parseScopeFilter,
  taskRelationValue,
} from '../utils/taskRelationFilter'
import { useWorkQueue } from './useWorkQueue'
import { useWorkQueueActions } from './useWorkQueueActions'
import type { WorkQueueParams } from '../api/contracts'
import type { FilterBadge } from '@/components/ui/filters/ActiveFilterBadges'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { WORK_QUEUE_MESSAGES } from '../messages'
import { WORK_QUEUE_ERROR_MESSAGES } from '../errorMessages'
import { WORK_QUEUE_FILTER_FIELDS } from '../utils/workQueueFilterConfig'

export const useWorkQueuePage = () => {
  const { getParam, getPage, setFilter, setFilters, setPage: setUrlPage, resetFilters } = useSearchParamFilters()
  const { role } = useRole()
  const hasRole = role != null

  const search = getParam(WORK_QUEUE_FILTER_PARAM_KEYS.search)
  const urgencyFilter = parseWorkQueueUrgency(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.urgency))
  const typeFilter = parseWorkQueueSourceType(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.sourceType))
  const parsedTaskStatus = parseTaskStatus(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus))
  const statusFilter = parsedTaskStatus === 'open' ? parsedTaskStatus : null
  const linkedFilter = parseLinkedFilter(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.linked))
  const scopeFilter = parseScopeFilter(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.scope))
  const page = getPage()

  const [debouncedSearch] = useDebounce(search, 350)

  const listParams = useMemo<WorkQueueParams>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      source_type: typeFilter ?? undefined,
      urgency: urgencyFilter ?? undefined,
      task_status: statusFilter ?? undefined,
      linked: linkedFilter ?? undefined,
      scope: scopeFilter ?? undefined,
      page,
      page_size: WORK_QUEUE_PAGE_SIZE,
    }),
    [linkedFilter, page, scopeFilter, debouncedSearch, statusFilter, typeFilter, urgencyFilter],
  )

  const { data, isLoading, isFetching, error } = useWorkQueue(listParams, hasRole)

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0
  const summary = data?.summary

  const hasContentFilters =
    search.trim() !== '' ||
    urgencyFilter !== null ||
    typeFilter !== null ||
    statusFilter !== null ||
    linkedFilter !== null ||
    scopeFilter !== null

  const requestError = !hasRole
    ? WORK_QUEUE_ERROR_MESSAGES.page.roleError
    : error
      ? getErrorMessage(error, WORK_QUEUE_ERROR_MESSAGES.page.loadError)
      : null

  useEffect(() => {
    if (requestError) toast.error(WORK_QUEUE_ERROR_MESSAGES.page.loadToast, { description: requestError })
  }, [requestError])

  const handleFilterChange = (key: WorkQueueFilterParamKey, value: string) => setFilter(key, value, true)
  const handleMultiFilterChange = (updates: Partial<Record<WorkQueueFilterParamKey, string>>) => setFilters(updates, true)
  const setPage = (nextPage: number) => setUrlPage(nextPage)

  const clearFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  const filterValues = useMemo(
    () => ({
      [WORK_QUEUE_FILTER_PARAM_KEYS.search]: search,
      [WORK_QUEUE_FILTER_PARAM_KEYS.sourceType]: typeFilter ?? '',
      [WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus]: statusFilter ?? '',
      [TASK_RELATION_KEY]: taskRelationValue(scopeFilter, linkedFilter),
    }),
    [search, typeFilter, statusFilter, scopeFilter, linkedFilter],
  )

  const handleFilterPanelChange = (key: string, value: string) => {
    if (key === TASK_RELATION_KEY) {
      const { scope, linked } = expandTaskRelation(value)
      handleMultiFilterChange({
        [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: scope,
        [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: linked,
      })
      return
    }
    handleFilterChange(key as WorkQueueFilterParamKey, value)
  }

  // Urgency is set by clicking the stats cards (no dropdown), so surface it as a removable badge.
  const filterBadges: FilterBadge[] | undefined = urgencyFilter
    ? [
        {
          key: WORK_QUEUE_FILTER_PARAM_KEYS.urgency,
          label: WORK_QUEUE_MESSAGES.filters.urgencyBadge(workQueueUrgencyLabels[urgencyFilter]),
          onRemove: () => handleFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.urgency, ''),
        },
      ]
    : undefined

  const actions = useWorkQueueActions()
  const {
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
  } = actions

  const { showLinkedTasks, showWarnings } = useMemo(
    () => ({
      showLinkedTasks: items.some((item) => item.linked_tasks_count > 0),
      showWarnings: items.some((item) => item.warnings.length > 0),
    }),
    [items],
  )
  const columns = useMemo(
    () => buildWorkQueueColumns({ activeActionKey, onAction: runAction, showLinkedTasks, showWarnings }),
    [activeActionKey, runAction, showLinkedTasks, showWarnings],
  )

  const emptyState = hasContentFilters
    ? {
        isEmpty: items.length === 0,
        isFiltered: true,
        icon: CheckSquare,
        variant: 'default' as const,
        title: GLOBAL_UI_MESSAGES.common.noResults,
        message: WORK_QUEUE_MESSAGES.page.emptyFilteredMessage,
      }
    : {
        isEmpty: items.length === 0,
        isFiltered: false,
        icon: CheckSquare,
        variant: 'illustration' as const,
        title: WORK_QUEUE_MESSAGES.page.emptyTitle,
        message: WORK_QUEUE_MESSAGES.page.emptyMessage,
      }

  return {
    status: {
      isLoading,
      isFetching,
      error: requestError,
      loadingMessage: WORK_QUEUE_MESSAGES.page.loading,
    },
    headerProps: {
      title: WORK_QUEUE_MESSAGES.page.title,
      description: WORK_QUEUE_MESSAGES.page.description,
    },
    stats: {
      summary,
      isLoading: isFetching,
      summaryError: requestError,
      activeUrgency: urgencyFilter,
      onUrgencyChange: (urgency: typeof urgencyFilter) => handleFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.urgency, urgency ?? ''),
    },
    filters: {
      fields: WORK_QUEUE_FILTER_FIELDS,
      values: filterValues,
      onChange: handleFilterPanelChange,
      onReset: clearFilters,
      extraBadges: filterBadges,
    },
    table: {
      data: items,
      columns,
      isLoading,
      isFetching,
      pagination: {
        page,
        pageSize: WORK_QUEUE_PAGE_SIZE,
        total,
        onPageChange: setPage,
      },
      label: WORK_QUEUE_MESSAGES.page.tableLabel,
      emptyState,
    },
    modals: {
      openCreateTask,
      confirmProps: {
        open: Boolean(pendingConfirm),
        title: pendingConfirm?.action.confirm_title ?? WORK_QUEUE_MESSAGES.page.confirmTitle,
        message: pendingConfirm?.action.confirm_message ?? WORK_QUEUE_MESSAGES.page.confirmMessage,
        confirmLabel: GLOBAL_UI_MESSAGES.actions.confirm,
        cancelLabel: GLOBAL_UI_MESSAGES.actions.cancel,
        isLoading: actionMutation.isPending,
        onConfirm: confirmAction,
        onCancel: closeConfirm,
      },
      taskModalProps: taskModal
        ? {
            mode: taskModal.mode,
            task: taskDetail.data,
            detailsError: taskDetail.error
              ? getErrorMessage(taskDetail.error, WORK_QUEUE_ERROR_MESSAGES.actions.taskNotFound)
              : null,
            source: taskModal.source,
            isLoading: createTaskMutation.isPending || updateTaskMutation.isPending || taskDetail.isLoading,
            onClose: closeTaskModal,
            onSubmit: submitTask,
          }
        : null,
    },
  }
}
