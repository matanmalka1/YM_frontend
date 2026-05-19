import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workQueueApi, workQueueQK, workQueueSourceTypeLabels } from '@/features/workQueue'
import type { WorkQueueItem } from '@/features/workQueue'
import { formatDate } from '@/utils/utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useTaskSourcePicker = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null)

  const workQueueQuery = useQuery({
    queryKey: workQueueQK.list(
      selectedClientId
        ? { client_record_id: selectedClientId, scope: 'system', linked: 'unlinked', limit: 100 }
        : undefined,
    ),
    queryFn: () =>
      workQueueApi.list({
        client_record_id: selectedClientId!,
        scope: 'system',
        linked: 'unlinked',
        limit: 100,
      }),
    enabled: selectedClientId !== null,
    staleTime: QUERY_STALE_TIME.short,
  })

  const selectClient = useCallback((id: number, name: string) => {
    setSelectedClientId(id)
    setSelectedClientName(name)
  }, [])

  const clearClient = useCallback(() => {
    setSelectedClientId(null)
    setSelectedClientName(null)
  }, [])

  const sourceLabel = useCallback((item: WorkQueueItem): string => {
    const typeLabel = workQueueSourceTypeLabels[item.source_type] ?? item.source_type
    const dueDate = item.due_date ? ` · ${formatDate(item.due_date)}` : ''
    return `${typeLabel} · ${item.title}${dueDate}`
  }, [])

  return {
    selectedClientId,
    selectedClientName,
    selectClient,
    clearClient,
    workQueueItems: (workQueueQuery.data?.items ?? []).filter((item) => item.source_type !== 'task'),
    isLoadingItems: workQueueQuery.isFetching,
    sourceLabel,
  }
}
