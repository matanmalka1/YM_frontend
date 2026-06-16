import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'
import { useTableSelection } from '../../../hooks/useTableSelection'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { getChargesFilters, toChargesListParams } from '../helpers'
import { useChargeActions } from './useChargeActions'
import { useChargeCreateMutation } from './useChargeCreateMutation'

export const useChargesPage = () => {
  const { searchParams, setFilter, setPage, setSearchParams } = useSearchParamFilters()

  const filters = getChargesFilters(searchParams)
  const apiParams = toChargesListParams(filters)

  const {
    data: listData,
    isPending: loading,
    error: listError,
  } = useQuery({
    queryKey: chargesQK.list(apiParams),
    queryFn: () => chargesApi.list(apiParams),
    placeholderData: keepPreviousData,
  })

  const chargeItems = listData?.items ?? []
  const total = listData?.total ?? 0
  const stats = listData?.stats ?? DEFAULT_CHARGE_LIST_STATS
  const error = listError ? getErrorMessage(listError, 'שגיאה בטעינת רשימת חיובים') : null
  const { isAdvisor, isSecretary } = useRole()
  const createMutation = useChargeCreateMutation()
  const { clearSelection, selectedIds, toggleSelect, toggleSelectAll } = useTableSelection<number>()
  const { actionLoadingId, bulkLoading, runAction, runBulkAction } = useChargeActions({
    clearSelection,
    canAct: isAdvisor || isSecretary,
    selectedIds,
  })

  // setFilter provided by useSearchParamFilters

  const submitCreate = async (payload: CreateChargePayload): Promise<boolean> => {
    if (!isAdvisor) {
      toast.error('אין הרשאה ליצור חיוב')
      return false
    }

    try {
      await createMutation.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  return {
    actionLoadingId,
    bulkLoading,
    charges: chargeItems,
    createError: createMutation.error ? getErrorMessage(createMutation.error, 'שגיאה ביצירת חיוב') : null,
    createLoading: createMutation.isPending,
    error,
    filters,
    isAdvisor,
    loading,
    runAction,
    runBulkAction,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    setFilter,
    setPage,
    setSearchParams,
    stats,
    submitCreate,
    total,
  }
}
