import { useMemo, useState } from 'react'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage } from '@/utils/utils'
import { useWorkQueue } from './useWorkQueue'
import type { WorkQueueItem, WorkQueueUrgency } from '../api/contracts'

export const useWorkQueuePage = () => {
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<WorkQueueUrgency | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [linkedFilter, setLinkedFilter] = useState<'linked' | 'unlinked' | null>(null)
  const [specialFilter, setSpecialFilter] = useState<'manual' | 'linked' | null>(null)
  const { role } = useRole()
  const hasRole = Boolean(role)

  const { data = [], isLoading, error } = useWorkQueue(undefined, hasRole)

  const filtered = useMemo<WorkQueueItem[]>(() => {
    let items = data
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
    if (linkedFilter === 'linked') items = items.filter((i) => i.linked_tasks_count > 0)
    if (linkedFilter === 'unlinked')
      items = items.filter((i) => i.linked_tasks_count === 0)
    if (specialFilter === 'manual') items = items.filter((i) => i.source_type === 'task')
    if (specialFilter === 'linked') items = items.filter((i) => i.linked_tasks_count > 0)
    return items
  }, [data, search, urgencyFilter, typeFilter, linkedFilter, specialFilter])

  const hasFilters =
    search.trim() !== '' ||
    urgencyFilter !== null ||
    typeFilter !== null ||
    linkedFilter !== null ||
    specialFilter !== null

  const clearFilters = () => {
    setSearch('')
    setUrgencyFilter(null)
    setTypeFilter(null)
    setLinkedFilter(null)
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
    linkedFilter,
    setLinkedFilter,
    specialFilter,
    setSpecialFilter,
    hasFilters,
    clearFilters,
  }
}
