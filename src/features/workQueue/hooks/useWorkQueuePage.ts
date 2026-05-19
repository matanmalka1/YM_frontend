import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage } from '@/utils/utils'
import { useWorkQueue } from './useWorkQueue'
import type { WorkQueueParams, WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'
import type { TaskStatus } from '@/features/tasks'

const WORK_QUEUE_PAGE_SIZE = 50

export const useWorkQueuePage = () => {
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<WorkQueueUrgency | null>(null)
  const [typeFilter, setTypeFilter] = useState<WorkQueueSourceType | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null)
  const [linkedFilter, setLinkedFilter] = useState<'linked' | 'unlinked' | null>(null)
  const [scopeFilter, setScopeFilter] = useState<'system' | 'manual' | null>(null)
  const [historyMode, setHistoryMode] = useState(false)
  const [page, setPage] = useState(1)
  const { role } = useRole()
  const hasRole = role != null

  const listParams = useMemo<WorkQueueParams>(
    () => ({
      include_task_history: historyMode,
      search: search.trim() || undefined,
      source_type: typeFilter ?? undefined,
      urgency: urgencyFilter ?? undefined,
      task_status: statusFilter ?? undefined,
      linked: linkedFilter ?? undefined,
      scope: scopeFilter ?? undefined,
      limit: WORK_QUEUE_PAGE_SIZE,
      offset: (page - 1) * WORK_QUEUE_PAGE_SIZE,
    }),
    [historyMode, linkedFilter, page, scopeFilter, search, statusFilter, typeFilter, urgencyFilter],
  )

  useEffect(() => {
    setPage(1)
  }, [historyMode, search, typeFilter, urgencyFilter, statusFilter, linkedFilter, scopeFilter])

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

  const clearFilters = useCallback(() => {
    setSearch('')
    setUrgencyFilter(null)
    setTypeFilter(null)
    setStatusFilter(null)
    setLinkedFilter(null)
    setScopeFilter(null)
    setHistoryMode(false)
    setPage(1)
  }, [])

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
  }
}
