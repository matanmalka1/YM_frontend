import { useCallback, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { parseTaskStatus } from '@/features/tasks/api/contracts'
import {
  WORK_QUEUE_FILTER_PARAM_KEYS,
  WORK_QUEUE_PAGE_SIZE,
  parseWorkQueueSourceType,
  parseWorkQueueUrgency,
  type WorkQueueFilterParamKey,
} from '../constants'
import { useWorkQueue } from './useWorkQueue'
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

  const items = data?.items ?? []
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

  const handleFilterChange = (key: WorkQueueFilterParamKey, value: string) => setFilter(key, value, true)
  const handleMultiFilterChange = (updates: Partial<Record<WorkQueueFilterParamKey, string>>) =>
    setFilters(updates, true)
  const setPage = (nextPage: number) => setUrlPage(nextPage)

  const clearFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  return {
    items,
    summary,
    isFetching,
    isLoading,
    error: requestError,
    search,
    urgencyFilter,
    typeFilter,
    statusFilter,
    linkedFilter,
    scopeFilter,
    historyMode,
    handleFilterChange,
    handleMultiFilterChange,
    hasContentFilters,
    hasFilters,
    clearFilters,
    page,
    total,
    setPage,
  }
}
