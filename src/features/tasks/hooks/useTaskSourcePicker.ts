import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workItemSourceTypeLabels } from '@/constants/workItemSources.constants'
import { formatDate } from '@/utils/utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { tasksApi } from '../api/tasks.api'
import { tasksQK } from '../api/queryKeys'
import type { TaskLinkableSource } from '../api/contracts'

export const useTaskSourcePicker = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null)
  const [selectedClientOfficeNumber, setSelectedClientOfficeNumber] = useState<number | null>(null)

  const { data: workQueueData, isFetching: workQueueFetching } = useQuery({
    queryKey: tasksQK.linkableSources(selectedClientId ?? 0),
    queryFn: () => tasksApi.listLinkableSources(selectedClientId!),
    enabled: selectedClientId !== null,
    staleTime: QUERY_STALE_TIME.short,
  })

  const selectClient = useCallback((id: number, name: string, officeClientNumber?: number | null) => {
    setSelectedClientId(id)
    setSelectedClientName(name)
    setSelectedClientOfficeNumber(officeClientNumber ?? null)
  }, [])

  const clearClient = useCallback(() => {
    setSelectedClientId(null)
    setSelectedClientName(null)
    setSelectedClientOfficeNumber(null)
  }, [])

  const sourceLabel = useCallback((item: TaskLinkableSource): string => {
    const typeLabel = workItemSourceTypeLabels[item.source_domain] ?? item.source_domain
    const dueDate = item.due_date ? ` · ${formatDate(item.due_date)}` : ''
    const linked = item.linked_tasks_count > 0 ? ` · ${item.linked_tasks_count} משימות קשורות` : ''
    return `${typeLabel} · ${item.title}${dueDate}${linked}`
  }, [])

  const workQueueItems = useMemo(() => workQueueData?.items ?? [], [workQueueData?.items])

  return {
    selectedClientId,
    selectedClientName,
    selectedClientOfficeNumber,
    selectClient,
    clearClient,
    workQueueItems,
    isLoadingItems: workQueueFetching,
    sourceLabel,
  }
}
