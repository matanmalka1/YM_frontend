import { useCallback, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { chargesApi, chargesQK, type BulkChargeActionPayload, type CreateChargePayload } from '../api'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { getChargesFilters, runChargeActionRequest, toChargesListParams } from '../helpers'
import type { ChargeAction } from '../types'

export const useChargesPage = () => {
  const queryClient = useQueryClient()
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
  const { isAdvisor } = useRole()

  const createMutation = useMutationWithToast<Awaited<ReturnType<typeof chargesApi.create>>, CreateChargePayload>({
    mutationFn: (payload) => chargesApi.create(payload),
    successMessage: 'חיוב נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת חיוב',
    invalidateKeys: [chargesQK.all],
  })

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((ids: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  const actionMutation = useMutation({
    mutationFn: async ({ action, chargeId }: { action: ChargeAction; chargeId: number }) =>
      runChargeActionRequest(chargeId, action),
    onSuccess: async () => {
      toast.success('פעולת חיוב בוצעה בהצלחה')
      await queryClient.invalidateQueries({ queryKey: chargesQK.all })
    },
  })

  const runAction = useCallback(
    async (chargeId: number, action: ChargeAction) => {
      if (!isAdvisor) {
        toast.error('אין הרשאה לבצע פעולת חיוב זו')
        return
      }

      try {
        setActionLoadingId(chargeId)
        await actionMutation.mutateAsync({ action, chargeId })
      } catch (requestError: unknown) {
        showErrorToast(requestError, 'שגיאה בביצוע פעולת חיוב')
      } finally {
        setActionLoadingId(null)
      }
    },
    [actionMutation, isAdvisor],
  )

  const runBulkAction = useCallback(
    async (action: BulkChargeActionPayload['action'], cancellationReason?: string) => {
      if (!isAdvisor || selectedIds.size === 0) return
      setBulkLoading(true)
      try {
        const result = await chargesApi.bulkAction({
          charge_ids: Array.from(selectedIds),
          action,
          cancellation_reason: cancellationReason,
        })
        if (result.succeeded.length > 0) {
          toast.success(`${result.succeeded.length} חיובים עודכנו בהצלחה`)
        }
        if (result.failed.length > 0) {
          result.failed.forEach((f) => toast.error(`חיוב #${f.id}: ${f.error}`))
        }
        await queryClient.invalidateQueries({ queryKey: chargesQK.all })
        clearSelection()
      } catch (requestError: unknown) {
        showErrorToast(requestError, 'שגיאה בביצוע פעולה מרובה')
      } finally {
        setBulkLoading(false)
      }
    },
    [isAdvisor, selectedIds, clearSelection, queryClient],
  )

  // setFilter provided by useSearchParamFilters

  const submitCreate = async (payload: CreateChargePayload): Promise<boolean> => {
    if (!isAdvisor) {
      toast.error('אין הרשאה ליצור חיוב')
      return false
    }

    try {
      await createMutation.mutateAsync(payload)
      return true
    } catch (requestError: unknown) {
      showErrorToast(requestError, 'שגיאה ביצירת חיוב')
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
