import { useMemo, useState } from 'react'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage } from '@/utils/utils'
import { useWorkQueue } from './useWorkQueue'
import type { WorkQueueItem, WorkQueueUrgency } from '../api/contracts'
import type { TaskStatus } from '@/features/tasks/api'

const itemTaskStatus = (item: WorkQueueItem): string | null => {
  if (item.source_type === 'task') {
    const metadata = item.metadata as Record<string, unknown> | null | undefined
    return typeof metadata?.status === 'string' ? metadata.status : null
  }
  return null
}

const isHistoryTask = (item: WorkQueueItem) => {
  const status = itemTaskStatus(item)
  return status === 'done' || status === 'canceled'
}

export const useWorkQueuePage = () => {
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<WorkQueueUrgency | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null)
  const [linkedFilter, setLinkedFilter] = useState<'linked' | 'unlinked' | null>(null)
  const [scopeFilter, setScopeFilter] = useState<'system' | 'manual' | null>(null)
  const [historyMode, setHistoryMode] = useState(false)
  const [specialFilter, setSpecialFilter] = useState<'manual' | 'linked' | null>(null)
  const { role } = useRole()
  const hasRole = Boolean(role)

  const { data = [], isLoading, error } = useWorkQueue({ include_task_history: historyMode }, hasRole)

  const filtered = useMemo<WorkQueueItem[]>(() => {
    let items = data
    if (historyMode) {
      items = items.filter(isHistoryTask)
    } else {
      items = items.filter((i) => !isHistoryTask(i))
    }
    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter((i) => {
        const haystack = [
          i.title,
          i.description,
          i.client_name,
          i.office_client_number != null ? String(i.office_client_number) : null,
          i.type_label,
          i.status_label,
          i.source_summary?.label,
          ...i.linked_tasks.map((task) => task.title),
        ]
        return haystack.some((value) => value?.toLowerCase().includes(query))
      })
    }
    if (urgencyFilter) items = items.filter((i) => i.urgency === urgencyFilter)
    if (typeFilter) items = items.filter((i) => i.source_type === typeFilter)
    if (statusFilter) {
      items = items.filter((i) => itemTaskStatus(i) === statusFilter || i.linked_tasks.some((task) => task.status === statusFilter))
    }
    if (linkedFilter === 'linked') items = items.filter((i) => i.linked_tasks_count > 0)
    if (linkedFilter === 'unlinked')
      items = items.filter((i) => i.linked_tasks_count === 0)
    if (specialFilter === 'manual') items = items.filter((i) => i.source_type === 'task')
    if (specialFilter === 'linked') items = items.filter((i) => i.linked_tasks_count > 0)
    if (scopeFilter === 'manual') items = items.filter((i) => i.source_type === 'task')
    if (scopeFilter === 'system') items = items.filter((i) => i.source_type !== 'task')
    return items
  }, [data, search, urgencyFilter, typeFilter, statusFilter, linkedFilter, scopeFilter, historyMode, specialFilter])

  const hasFilters =
    search.trim() !== '' ||
    urgencyFilter !== null ||
    typeFilter !== null ||
    statusFilter !== null ||
    linkedFilter !== null ||
    scopeFilter !== null ||
    historyMode ||
    specialFilter !== null

  const clearFilters = () => {
    setSearch('')
    setUrgencyFilter(null)
    setTypeFilter(null)
    setStatusFilter(null)
    setLinkedFilter(null)
    setScopeFilter(null)
    setHistoryMode(false)
    setSpecialFilter(null)
  }

  return {
    items: filtered,
    allItems: data,
    isLoading: isLoading && !error,
    error: !hasRole ? 'לא ניתן לזהות תפקיד משתמש' : error ? getErrorMessage(error, 'שגיאה בטעינת המשימות') : null,
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
    specialFilter,
    setSpecialFilter,
    hasFilters,
    clearFilters,
  }
}
