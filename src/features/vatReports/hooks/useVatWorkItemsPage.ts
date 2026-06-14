import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { vatReportsApi } from '../api'
import type { CreateVatWorkItemPayload, VatWorkItemStatus, VatWorkItemStatusSummaryParams } from '../api'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { useRole } from '../../../hooks/useRole'
import { vatReportsQK } from '../api/queryKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { VatWorkItemAction, VatWorkItemsFilters } from '../types'
import { VAT_WORK_ITEMS_STATS_STATUS_GROUPS } from '../constants'
import { toOptionalVatPeriodTypeFilter, toVatPeriodTypeFilter } from '../filterUtils'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const VAT_STATUS_VALUES: readonly VatWorkItemStatus[] = [
  'pending_materials',
  'material_received',
  'data_entry_in_progress',
  'ready_for_review',
  'filed',
  'canceled',
]

const toOptionalVatStatus = (status: string): VatWorkItemStatus | undefined =>
  VAT_STATUS_VALUES.includes(status as VatWorkItemStatus) ? (status as VatWorkItemStatus) : undefined

export const useVatWorkItemsPage = () => {
  const queryClient = useQueryClient()
  const { searchParams, setFilter, setFilters, setSearchParams } = useSearchParamFilters()
  const { isAdvisor } = useRole()

  const rawYear = searchParams.get('year') ?? String(getOperationalTaxYear())
  const filters: Pick<VatWorkItemsFilters, 'status' | 'year' | 'period_type' | 'client_record_id' | 'client_name'> = {
    status: toOptionalVatStatus(searchParams.get('status') ?? '') ?? '',
    year: rawYear === 'all' ? '' : rawYear,
    period_type: toVatPeriodTypeFilter(searchParams.get('period_type')),
    client_record_id: searchParams.get('client_record_id') ?? '',
    client_name: searchParams.get('client_name') ?? '',
  }

  const summaryParams: VatWorkItemStatusSummaryParams = {
    year: filters.year ? Number(filters.year) : undefined,
    period_type: toOptionalVatPeriodTypeFilter(filters.period_type),
    client_record_id: filters.client_record_id ? Number(filters.client_record_id) : undefined,
  }

  const statusSummaryQuery = useQuery({
    queryKey: vatReportsQK.statusSummary(summaryParams),
    queryFn: () => vatReportsApi.getStatusSummary(summaryParams),
    staleTime: QUERY_STALE_TIME.default,
  })

  const getStatsTotal = (statuses: readonly VatWorkItemStatus[]) =>
    statuses.reduce((sum, status) => sum + (statusSummaryQuery.data?.[status] ?? 0), 0)

  const statsPending = getStatsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.pending)
  const statsTyping = getStatsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.typing)
  const statsReview = getStatsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.review)
  const statsFiled = getStatsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.filed)

  const createMutation = useMutation({
    mutationFn: (payload: CreateVatWorkItemPayload) => vatReportsApi.create(payload),
    onSuccess: async (workItem) => {
      toast.success('תיק מע"מ נוצר בהצלחה')
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
        includeAudit: false,
      })
    },
  })

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const actionMutation = useMutation({
    mutationFn: ({ action, itemId }: { action: Exclude<VatWorkItemAction, 'sendBack'>; itemId: number }) => {
      if (action === 'materialsComplete') return vatReportsApi.markMaterialsComplete(itemId)
      return vatReportsApi.markReadyForReview(itemId)
    },
    onSuccess: async (workItem) => {
      toast.success('הפעולה בוצעה בהצלחה')
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
      })
    },
  })

  const sendBackMutation = useMutation({
    mutationFn: ({ itemId, note }: { itemId: number; note: string }) => vatReportsApi.sendBack(itemId, note),
    onSuccess: async (workItem) => {
      toast.success('התיק הוחזר לתיקון')
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
      })
    },
  })

  const runAction = useCallback(
    async (itemId: number, action: VatWorkItemAction) => {
      if (action === 'sendBack' && !isAdvisor) {
        toast.error('פעולה זו זמינה ליועץ בלבד')
        return
      }
      if (action === 'sendBack') return // handled by sendBackWithNote
      try {
        setActionLoadingId(itemId)
        await actionMutation.mutateAsync({ action, itemId })
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בביצוע הפעולה')
      } finally {
        setActionLoadingId(null)
      }
    },
    [actionMutation, isAdvisor],
  )

  const sendBackWithNote = useCallback(
    async (itemId: number, note: string): Promise<void> => {
      if (!isAdvisor) {
        toast.error('פעולה זו זמינה ליועץ בלבד')
        return
      }
      try {
        setActionLoadingId(itemId)
        await sendBackMutation.mutateAsync({ itemId, note })
      } catch (err: unknown) {
        showErrorToast(err, 'שגיאה בהחזרת התיק לתיקון')
      } finally {
        setActionLoadingId(null)
      }
    },
    [isAdvisor, sendBackMutation],
  )

  const submitCreate = async (payload: CreateVatWorkItemPayload): Promise<boolean> => {
    if (!isAdvisor) return false
    try {
      await createMutation.mutateAsync(payload)
      return true
    } catch (err: unknown) {
      showErrorToast(err, 'שגיאה ביצירת תיק מע"מ')
      return false
    }
  }

  return {
    actionLoadingId,
    createError: createMutation.error ? getErrorMessage(createMutation.error, 'שגיאה ביצירת תיק מע"מ') : null,
    createLoading: createMutation.isPending,
    filters,
    isAdvisor,
    loading: statusSummaryQuery.isLoading,
    runAction,
    sendBackWithNote,
    setFilter,
    setFilters,
    setSearchParams,
    statsFiled,
    statsPending,
    statsReview,
    statsTyping,
    submitCreate,
  }
}
