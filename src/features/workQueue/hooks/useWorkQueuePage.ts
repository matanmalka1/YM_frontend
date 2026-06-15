import { useCallback, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { parseTaskStatus, type TaskStatus } from '@/features/tasks/api/contracts'
import { parseWorkQueueSourceType, parseWorkQueueUrgency } from '../constants'
import { useWorkQueue } from './useWorkQueue'
import type { WorkQueueParams, WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'

const WORK_QUEUE_PAGE_SIZE = 20

const parseLinkedFilter = (value: string | null): 'linked' | 'unlinked' | null =>
  value === 'linked' || value === 'unlinked' ? value : null

const parseScopeFilter = (value: string | null): 'system' | 'manual' | null =>
  value === 'system' || value === 'manual' ? value : null

export const useWorkQueuePage = () => {
  const { getParam, getPage, setFilter, setFilters, setPage: setUrlPage, resetFilters } = useSearchParamFilters()
  const { role } = useRole()
  const hasRole = role != null

  const search = getParam('search')
  const urgencyFilter = parseWorkQueueUrgency(getParam('urgency'))
  const typeFilter = parseWorkQueueSourceType(getParam('source_type'))
  const statusFilter = parseTaskStatus(getParam('task_status'))
  const linkedFilter = parseLinkedFilter(getParam('linked'))
  const scopeFilter = parseScopeFilter(getParam('scope'))
  const historyMode = getParam('history') === 'true'
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
  const totalPages = Math.max(1, Math.ceil(total / WORK_QUEUE_PAGE_SIZE))

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

  const setSearch = (value: string) => setFilter('search', value)
  const setUrgencyFilter = (value: WorkQueueUrgency | null) => setFilter('urgency', value ?? '')
  const setTypeFilter = (value: WorkQueueSourceType | null) => setFilter('source_type', value ?? '')
  const setStatusFilter = (value: TaskStatus | null) => setFilter('task_status', value ?? '')
  const setLinkedFilter = (value: 'linked' | 'unlinked' | null) => setFilter('linked', value ?? '')
  const setScopeFilter = (value: 'system' | 'manual' | null) => setFilter('scope', value ?? '')
  const setHistoryMode = (value: boolean) => setFilter('history', value ? 'true' : '')
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
    setSearch,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    linkedFilter,
    setLinkedFilter,
    scopeFilter,
    setScopeFilter,
    historyMode,
    setHistoryMode,
    hasContentFilters,
    hasFilters,
    clearFilters,
    page,
    total,
    totalPages,
    setPage,
    setFilters,
  }
}
