import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import { useTableSelection } from '@/hooks/useTableSelection'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { useChargeActions } from './useChargeActions'
import { useChargeCreateMutation } from './useChargeCreateMutation'

const PAGE_SIZE = 20

export const useClientCharges = (clientId: number) => {
  const { isAdvisor } = useRole()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null)

  const { businesses, isLoading: businessesLoading } = useBusinessesForClient({
    clientId,
    onAutoSelect: (business) => setSelectedBusinessId(business.id),
  })

  const listParams = useMemo(
    () => ({
      client_record_id: clientId,
      business_id: selectedBusinessId ?? undefined,
      status: status || undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    [clientId, selectedBusinessId, page, status],
  )

  const {
    data: listData,
    isPending: loading,
    error: listError,
  } = useQuery({
    queryKey: chargesQK.list(listParams),
    queryFn: () => chargesApi.list(listParams),
  })

  const charges = listData?.items ?? []
  const total = listData?.total ?? 0
  const stats = listData?.stats ?? DEFAULT_CHARGE_LIST_STATS
  const error = listError ? getErrorMessage(listError, 'שגיאה בטעינת חיובי הלקוח') : null
  const allIds = useMemo(() => listData?.items.map((c) => c.id) ?? [], [listData])
  const createMutation = useChargeCreateMutation()
  const { clearSelection, selectedIds, toggleSelect, toggleSelectAll } = useTableSelection<number>()
  const { actionLoadingId, bulkLoading, runAction, runBulkAction } = useChargeActions({
    clearSelection,
    isAdvisor,
    selectedIds,
  })

  const submitCreate = useCallback(
    async (payload: CreateChargePayload): Promise<boolean> => {
      if (!isAdvisor) {
        toast.error('אין הרשאה ליצור חיוב')
        return false
      }

      try {
        await createMutation.mutateAsync({
          ...payload,
          client_record_id: clientId,
        })
        return true
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה ביצירת חיוב')
        return false
      }
    },
    [clientId, createMutation, isAdvisor],
  )

  const handleStatusChange = useCallback(
    (nextStatus: string) => {
      setStatus(nextStatus)
      setPage(1)
      clearSelection()
    },
    [clearSelection],
  )

  return {
    charges,
    total,
    stats,
    error,
    loading,
    page,
    pageSize: PAGE_SIZE,
    allIds,
    isAdvisor,
    businesses,
    businessesLoading,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedIds,
    actionLoadingId,
    bulkLoading,
    createError: createMutation.error ? getErrorMessage(createMutation.error, 'שגיאה ביצירת חיוב') : null,
    createLoading: createMutation.isPending,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    runAction,
    runBulkAction,
    submitCreate,
    handleStatusChange,
    setPage,
    currentStatus: status,
  }
}
