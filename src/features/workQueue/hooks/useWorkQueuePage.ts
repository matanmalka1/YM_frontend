import { useCallback, useEffect, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { CheckSquare } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
import { toast } from '@/utils/toast'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { parseTaskStatus } from '@/features/tasks/api/contracts'
import {
  WORK_QUEUE_FILTER_PARAM_KEYS,
  WORK_QUEUE_PAGE_SIZE,
  parseWorkQueueSourceType,
  parseWorkQueueUrgency,
  type WorkQueueFilterParamKey,
} from '../constants'
import { buildWorkQueueColumns } from '../components/workQueueColumns'
import { useWorkQueue } from './useWorkQueue'
import { useWorkQueueActions } from './useWorkQueueActions'
import type { WorkQueueParams } from '../api/contracts'

const parseLinkedFilter = (value: string | null): 'linked' | 'unlinked' | null =>
  value === 'linked' || value === 'unlinked' ? value : null

const parseScopeFilter = (value: string | null): 'system' | 'manual' | null =>
  value === 'system' || value === 'manual' ? value : null

export const useWorkQueuePage = () => {
  const { getParam, getPage, setFilter, setFilters, setPage: setUrlPage, resetFilters } = useSearchParamFilters()
  const { role } = useRole()
  const hasRole = role != null

  const search = getParam(WORK_QUEUE_FILTER_PARAM_KEYS.search)
  const urgencyFilter = parseWorkQueueUrgency(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.urgency))
  const typeFilter = parseWorkQueueSourceType(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.sourceType))
  const statusFilter = parseTaskStatus(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus))
  const linkedFilter = parseLinkedFilter(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.linked))
  const scopeFilter = parseScopeFilter(getParam(WORK_QUEUE_FILTER_PARAM_KEYS.scope))
  const historyMode = getParam(WORK_QUEUE_FILTER_PARAM_KEYS.history) === 'true'
  const page = getPage()

  const [debouncedSearch] = useDebounce(search, 350)

  const listParams = useMemo<WorkQueueParams>(
    () => ({
      include_task_history: historyMode,
      search: debouncedSearch.trim() || undefined,
      source_type: typeFilter ?? undefined,
      urgency: urgencyFilter ?? undefined,
      task_status: statusFilter ?? undefined,
      linked: linkedFilter ?? undefined,
      scope: scopeFilter ?? undefined,
      page,
      page_size: WORK_QUEUE_PAGE_SIZE,
    }),
    [historyMode, linkedFilter, page, scopeFilter, debouncedSearch, statusFilter, typeFilter, urgencyFilter],
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
  const hasFilters = hasContentFilters || historyMode

  const requestError = !hasRole
    ? 'לא ניתן לזהות תפקיד משתמש'
    : error
      ? getErrorMessage(error, 'שגיאה בטעינת המשימות')
      : null

  useEffect(() => {
    if (requestError) toast.error('טעינת העבודה לטיפול נכשלה', { description: requestError })
  }, [requestError])

  const handleFilterChange = (key: WorkQueueFilterParamKey, value: string) => setFilter(key, value, true)
  const handleMultiFilterChange = (updates: Partial<Record<WorkQueueFilterParamKey, string>>) =>
    setFilters(updates, true)
  const setPage = (nextPage: number) => setUrlPage(nextPage)

  const clearFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

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
        title: 'אין תוצאות',
        message: 'אין תוצאות שתואמות לסינון',
      }
    : {
        isEmpty: items.length === 0,
        isFiltered: false,
        icon: CheckSquare,
        variant: 'illustration' as const,
        title: historyMode ? 'אין היסטוריה' : 'אין עבודה לטיפול',
        message: historyMode
          ? 'אין משימות היסטוריות להצגה.'
          : 'אין כרגע עבודה לטיפול. כל הדוחות, התשלומים והמשימות הפעילות מסודרים.',
      }

  return {
    status: {
      isLoading,
      isFetching,
      error: requestError,
      loadingMessage: 'טוען משימות...',
    },
    headerProps: {
      title: 'עבודה לטיפול',
      description: 'כל מה שדורש טיפול: דוחות, חיובים, מקדמות, קלסרים ומשימות ידניות.',
    },
    stats: {
      summary,
      isLoading: isFetching,
      summaryError: requestError,
    },
    filters: {
      search,
      urgencyFilter,
      typeFilter,
      statusFilter,
      linkedFilter,
      scopeFilter,
      historyMode,
      hasFilters,
      hasContentFilters,
      onFilterChange: handleFilterChange,
      onMultiFilterChange: handleMultiFilterChange,
      onClear: clearFilters,
      resetFilters: clearFilters,
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
      label: 'משימות',
      showPagination: total > 0,
      emptyState,
    },
    modals: {
      openCreateTask,
      confirmProps: {
        open: Boolean(pendingConfirm),
        title: pendingConfirm?.action.confirm_title ?? 'אישור פעולה',
        message: pendingConfirm?.action.confirm_message ?? 'האם לבצע את הפעולה?',
        confirmLabel: 'אישור',
        cancelLabel: 'ביטול',
        isLoading: actionMutation.isPending,
        onConfirm: confirmAction,
        onCancel: closeConfirm,
      },
      taskModalProps: taskModal
        ? {
            mode: taskModal.mode,
            task: taskDetail.data,
            source: taskModal.source,
            isLoading: createTaskMutation.isPending || updateTaskMutation.isPending || taskDetail.isLoading,
            onClose: closeTaskModal,
            onSubmit: submitTask,
          }
        : null,
    },
  }
}
