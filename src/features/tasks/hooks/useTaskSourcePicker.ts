import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workQueueApi, workQueueQK, workQueueSourceTypeLabels } from '@/features/workQueue'
import type { WorkQueueItem } from '@/features/workQueue'
import { formatDate } from '@/utils/utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { PAGE_SIZE_LG } from '@/constants/pagination.constants'

export const useTaskSourcePicker = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null)
  const [selectedClientOfficeNumber, setSelectedClientOfficeNumber] = useState<number | null>(null)

  const { data: workQueueData, isFetching: workQueueFetching } = useQuery({
    queryKey: workQueueQK.list(
      selectedClientId
        ? { client_record_id: selectedClientId, scope: 'system', linked: 'unlinked', page: 1, page_size: PAGE_SIZE_LG }
        : undefined,
    ),
    queryFn: () =>
      workQueueApi.list({
        client_record_id: selectedClientId!,
        scope: 'system',
        linked: 'unlinked',
        page: 1,
        page_size: PAGE_SIZE_LG,
      }),
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

  const sourceLabel = useCallback((item: WorkQueueItem): string => {
    const typeLabel = workQueueSourceTypeLabels[item.source_type] ?? item.source_type
    const dueDate = item.due_date ? ` · ${formatDate(item.due_date)}` : ''
    return `${typeLabel} · ${item.title}${dueDate}`
  }, [])

  const workQueueItems = useMemo(
    () => (workQueueData?.items ?? []).filter((item) => item.source_type !== 'task'),
    [workQueueData?.items],
  )

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
