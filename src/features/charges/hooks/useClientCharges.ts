import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import { useTableSelection } from '@/hooks/useTableSelection'
import { getErrorMessage } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { useChargeActions } from './useChargeActions'
import { useChargeCreateMutation } from './useChargeCreateMutation'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { CHARGES_ERROR_MESSAGES } from '../errorMessages'

export const useClientCharges = (clientId: number) => {
  const { isAdvisor, isSecretary } = useRole()
  const { searchParams, getParam, getPage, setFilter, setPage: setUrlPage } = useSearchParamFilters()

  const page = getPage()
  const status = getParam('status')
  const rawBusinessId = searchParams.get('business_id')
  const selectedBusinessId = rawBusinessId ? Number(rawBusinessId) : null

  const { businesses, isLoading: businessesLoading } = useBusinessesForClient({
    clientId,
    onAutoSelect: (business) => {
      if (!rawBusinessId) setFilter('business_id', String(business.id), false)
    },
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
  const error = listError ? getErrorMessage(listError, CHARGES_ERROR_MESSAGES.client.load) : null
  const allIds = useMemo(() => listData?.items.map((c) => c.id) ?? [], [listData])
  const createMutation = useChargeCreateMutation()
  const { clearSelection, selectedIds, toggleSelect, toggleSelectAll } = useTableSelection<number>()
  const { actionLoadingId, bulkLoading, runAction, runBulkAction } = useChargeActions({
    clearSelection,
    canAct: isAdvisor || isSecretary,
    selectedIds,
  })

  const submitCreate = useCallback(
    async (payload: CreateChargePayload): Promise<boolean> => {
      if (!isAdvisor) {
        toast.error(CHARGES_ERROR_MESSAGES.permissions.create)
        return false
      }

      try {
        await createMutation.mutateAsync({
          ...payload,
          client_record_id: clientId,
        })
        return true
      } catch {
        return false
      }
    },
    [clientId, createMutation, isAdvisor],
  )

  const handleStatusChange = useCallback(
    (nextStatus: string) => {
      setFilter('status', nextStatus, true)
      clearSelection()
    },
    [clearSelection, setFilter],
  )

  const setSelectedBusinessId = useCallback(
    (id: number | null) => setFilter('business_id', id != null ? String(id) : '', false),
    [setFilter],
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
    createError: createMutation.error
      ? getErrorMessage(createMutation.error, CHARGES_ERROR_MESSAGES.mutations.create)
      : null,
    createLoading: createMutation.isPending,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    runAction,
    runBulkAction,
    submitCreate,
    handleStatusChange,
    setPage: setUrlPage,
    currentStatus: status,
  }
}
