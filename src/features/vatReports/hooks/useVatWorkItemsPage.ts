import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { vatReportsApi } from '../api'
import type {
  CreateVatWorkItemPayload,
  VatWorkItemListItem,
  VatWorkItemStatus,
  VatWorkItemStatusSummaryParams,
} from '../api'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { useRole } from '../../../hooks/useRole'
import { vatReportsQK } from '../api/queryKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import { useDeleteWorkItem } from './useVatInvoiceMutations'
import { isFiled } from '../utils'
import type { VatWorkItemAction, VatWorkItemsFilters } from '../types'
import { VAT_WORK_ITEMS_STATS_STATUS_GROUPS } from '../constants'
import { buildVatEmptyStateTitle, toOptionalVatPeriodTypeFilter, toVatPeriodTypeFilter } from '../filterUtils'
import { buildVatWorkItemColumns } from '../components/VatWorkItemColumns'
import { useVatWorkItemGroups } from './useVatWorkItemGroups'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const VAT_PAGE_HEADER = {
  title: 'דוחות מע"מ (לקוח)',
  description: 'ניהול תיקי מע"מ חודשיים ברמת לקוח — הקלדה, בדיקה והגשה',
} as const

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
  const { searchParams, getParam, setFilter, setFilters, setSearchParams } = useSearchParamFilters()
  const { isAdvisor, isSecretary } = useRole()
  const { deleteWorkItem, isDeleting } = useDeleteWorkItem()
  const [deleteTarget, setDeleteTarget] = useState<VatWorkItemListItem | null>(null)
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createClientId = searchParams.get('client_id')
  const createPeriod = searchParams.get('period')

  useEffect(() => {
    if (searchParams.get('create') !== '1') return
    setShowCreateModal(true)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    navigate({ search: nextParams.toString() }, { replace: true, preventScrollReset: true })
  }, [searchParams, navigate])

  const openCreate = useCallback(() => setShowCreateModal(true), [])
  const closeCreate = useCallback(() => setShowCreateModal(false), [])

  const rawYear = searchParams.get('year') ?? String(getOperationalTaxYear())
  const filters: Pick<VatWorkItemsFilters, 'status' | 'year' | 'period_type' | 'client_record_id' | 'client_name'> = {
    status: toOptionalVatStatus(getParam('status')) ?? '',
    year: rawYear === 'all' ? '' : rawYear,
    period_type: toVatPeriodTypeFilter(searchParams.get('period_type')),
    client_record_id: getParam('client_record_id'),
    client_name: getParam('client_name'),
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
  const statsLoading = statusSummaryQuery.isLoading

  const groupStatus = filters.status || undefined
  const groupClientRecordId = filters.client_record_id ? Number(filters.client_record_id) : undefined

  const {
    groups,
    isLoading: groupsLoading,
    isFetching: groupsFetching,
    error: groupsError,
  } = useVatWorkItemGroups({
    period_type: toOptionalVatPeriodTypeFilter(filters.period_type),
    status: groupStatus,
    client_record_id: groupClientRecordId,
    year: filters.year ? Number(filters.year) : undefined,
  })

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

  const canDeleteWorkItem = useCallback(
    (item: VatWorkItemListItem): boolean => (isAdvisor || isSecretary) && !isFiled(item.status),
    [isAdvisor, isSecretary],
  )

  const requestDelete = useCallback((item: VatWorkItemListItem) => {
    setDeleteTarget(item)
  }, [])

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const ok = await deleteWorkItem(deleteTarget.id)
    if (ok) setDeleteTarget(null)
  }, [deleteTarget, deleteWorkItem])

  const handleRowClick = useCallback((item: VatWorkItemListItem) => navigate(`/tax/vat/${item.id}`), [navigate])

  const resetFilters = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  const columns = useMemo(
    () =>
      buildVatWorkItemColumns({
        isLoading: false,
        isDisabled: actionLoadingId !== null,
        runAction,
        canDeleteWorkItem,
        isDeleting,
        onDeleteRequest: requestDelete,
      }),
    [actionLoadingId, canDeleteWorkItem, isDeleting, requestDelete, runAction],
  )

  const createError = createMutation.error ? getErrorMessage(createMutation.error, 'שגיאה ביצירת תיק מע"מ') : null

  return {
    status: {
      isLoading: groupsLoading,
      isFetching: groupsFetching,
      error: groupsError,
      loadingMessage: 'טוען תיקי מע"מ...',
    },
    headerProps: VAT_PAGE_HEADER,
    stats: {
      pending: statsPending,
      typing: statsTyping,
      review: statsReview,
      filed: statsFiled,
      visible: !statsLoading && groups.length > 0,
    },
    filters: {
      values: filters,
      onFilterChange: setFilter,
      onMultiFilterChange: setFilters,
      resetFilters,
    },
    table: {
      groups,
      columns,
      isLoading: groupsLoading,
      error: groupsError,
      onRowClick: handleRowClick,
      groupFilters: { status: groupStatus, client_record_id: groupClientRecordId },
      emptyState: {
        title: buildVatEmptyStateTitle(filters),
        message: isAdvisor ? 'נסה לשנות את הסינון או לפתוח תיק חדש' : 'נסה לשנות את הסינון',
        action: isAdvisor ? { label: 'תיק חדש', onClick: openCreate } : undefined,
      },
    },
    modals: {
      openCreate,
      createProps: {
        open: showCreateModal,
        createError,
        createLoading: createMutation.isPending,
        onClose: closeCreate,
        onSubmit: submitCreate,
        initialClientId: createClientId ? Number(createClientId) : undefined,
        initialPeriod: createPeriod ?? undefined,
      },
      deleteConfirmProps: {
        open: deleteTarget !== null,
        title: 'מחיקת תיק מע"מ',
        message: 'האם למחוק את התיק? פעולה זו אינה הפיכה.',
        confirmLabel: 'מחק',
        cancelLabel: 'ביטול',
        confirmVariant: 'danger' as const,
        isLoading: isDeleting,
        onConfirm: confirmDelete,
        onCancel: cancelDelete,
      },
    },
    permissions: {
      isAdvisor,
      canDeleteWorkItem,
    },
    sendBackWithNote,
  }
}
