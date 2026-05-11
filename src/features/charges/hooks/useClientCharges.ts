import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { chargesApi, chargesQK, type BulkChargeActionPayload, type CreateChargePayload } from '../api'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { runChargeActionRequest } from '../helpers'
import type { ChargeAction } from '../types'

const PAGE_SIZE = 20

export const useClientCharges = (clientId: number) => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

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
  const allIds = useMemo(() => charges.map((c) => c.id), [charges])

  const createMutation = useMutationWithToast<Awaited<ReturnType<typeof chargesApi.create>>, CreateChargePayload>({
    mutationFn: (payload) => chargesApi.create(payload),
    successMessage: 'חיוב נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת חיוב',
    invalidateKeys: [chargesQK.all],
  })

  const actionMutation = useMutation({
    mutationFn: ({ action, chargeId }: { action: ChargeAction; chargeId: number }) =>
      runChargeActionRequest(chargeId, action),
    onSuccess: async () => {
      toast.success('פעולת חיוב בוצעה בהצלחה')
      await queryClient.invalidateQueries({ queryKey: chargesQK.all })
    },
  })

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
      return allSelected ? new Set() : new Set(ids)
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const runAction = useCallback(
    async (chargeId: number, action: ChargeAction) => {
      if (!isAdvisor) {
        toast.error('אין הרשאה לבצע פעולת חיוב זו')
        return
      }
      try {
        setActionLoadingId(chargeId)
        await actionMutation.mutateAsync({ action, chargeId })
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בביצוע פעולת חיוב')
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
        if (result.succeeded.length > 0) toast.success(`${result.succeeded.length} חיובים עודכנו בהצלחה`)
        result.failed.forEach((f) => toast.error(`חיוב #${f.id}: ${f.error}`))
        await queryClient.invalidateQueries({ queryKey: chargesQK.all })
        clearSelection()
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בביצוע פעולה מרובה')
      } finally {
        setBulkLoading(false)
      }
    },
    [clearSelection, isAdvisor, queryClient, selectedIds],
  )

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
