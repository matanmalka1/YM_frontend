import { useMemo, useState } from 'react'
import { useWorkQueue } from './useWorkQueue'
import type { WorkQueueItem, WorkQueueUrgency } from '../api/contracts'

export const useWorkQueuePage = () => {
  const [urgencyFilter, setUrgencyFilter] = useState<WorkQueueUrgency | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const { data = [], isLoading, error } = useWorkQueue()

  const filtered = useMemo<WorkQueueItem[]>(() => {
    let items = data
    if (urgencyFilter) items = items.filter((i) => i.urgency === urgencyFilter)
    if (typeFilter) items = items.filter((i) => i.source_type === typeFilter)
    return items
  }, [data, urgencyFilter, typeFilter])

  const hasFilters = urgencyFilter !== null || typeFilter !== null

  const clearFilters = () => {
    setUrgencyFilter(null)
    setTypeFilter(null)
  }

  return {
    items: filtered,
    allItems: data,
    isLoading,
    error: error ? 'שגיאה בטעינת המשימות' : null,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    hasFilters,
    clearFilters,
  }
}
