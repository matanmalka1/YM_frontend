import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { useRole } from '@/hooks/useRole'
import { getHttpStatus, parsePositiveInt, showErrorToast } from '@/utils/utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { toast } from '@/utils/toast'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow } from '../api/contracts'
import { isAdvancePaymentStatus } from '../constants'
import { useAdvancePayments } from './useAdvancePayments'
import { useAdvanceRateInsights } from './useAdvanceRateInsights'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'

interface UseClientAdvancePaymentsTabArgs {
  clientRecordId: number
}

export const useClientAdvancePaymentsTab = ({ clientRecordId }: UseClientAdvancePaymentsTabArgs) => {
  const { searchParams, getParam, getPage, setFilter, setPage, resetFilters } = useSearchParamFilters()
  const navigate = useNavigate()
  const { isAdvisor } = useRole()
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)

  const year = parsePositiveInt(searchParams.get('year'), getOperationalTaxYear())
  const page = getPage()
  const rawStatusFilter = getParam('status_filter')
  const statusFilter = rawStatusFilter ? rawStatusFilter.split(',').filter(isAdvancePaymentStatus) : []

  const { rows, isLoading, total, create, isCreating } = useAdvancePayments(clientRecordId, year, statusFilter, page)
  const { advancePaymentFrequency, advanceRate } = useAdvanceRateInsights(clientRecordId)

  const generationFrequency: 1 | 2 | null =
    advancePaymentFrequency === 'bimonthly' ? 2 : advancePaymentFrequency === 'monthly' ? 1 : null
  const displayFrequency: 1 | 2 | null = rows.length > 0 ? rows[0].period_months_count : generationFrequency

  const invalidateClientYear = (taxYear = year) =>
    queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.clientYear(clientRecordId, taxYear) })

  const generateMutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) =>
      advancePaymentsApi.generateSchedule(clientRecordId, year, periodMonthsCount),
    onSuccess: (data) => {
      toast.success(data.created > 0 ? `נוצרו ${data.created} מקדמות` : 'הכול קיים')
      void invalidateClientYear()
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.create),
  })

  const handleGenerateSchedule = () => {
    if (generationFrequency == null) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.missingFrequency)
      return
    }
    generateMutation.mutate(generationFrequency)
  }

  // Ids come from the rows actually on screen, never from a server-side filter:
  // this command writes to every row it is given, so nothing invisible is included.
  const readyToSnapshotIds = rows
    .filter(
      (row) => row.turnover_amount == null && row.available_turnover?.source === 'vat_filed',
    )
    .map((row) => row.id)

  const refreshTurnoverBulkMutation = useMutation({
    mutationFn: (paymentIds: number[]) => advancePaymentsApi.refreshTurnoverBulk(clientRecordId, paymentIds),
    onSuccess: (data) => {
      toast.success(ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.bulkResult(data))
      void invalidateClientYear()
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.turnoverRefresh),
  })

  const handleCreate = async (...args: Parameters<typeof create>) => {
    try {
      const result = await create(...args)
      toast.success('מקדמה נוצרה בהצלחה')
      return result
    } catch (err) {
      if (getHttpStatus(err) === 409) {
        toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.alreadyExists)
      } else {
        showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.create)
      }
      throw err
    }
  }

  return {
    permissions: { isAdvisor },
    header: {
      isAdvisor,
      year,
      onOpenCreate: () => setModalOpen(true),
      onGenerateSchedule: handleGenerateSchedule,
      displayFrequency,
      generationFrequency,
      isGenerating: generateMutation.isPending,
      advanceRate,
      readyToSnapshotCount: readyToSnapshotIds.length,
      isRefreshingTurnover: refreshTurnoverBulkMutation.isPending,
      onRefreshTurnoverBulk: () => refreshTurnoverBulkMutation.mutate(readyToSnapshotIds),
    },
    filters: {
      values: { status_filter: statusFilter.join(','), year: String(year) },
      onChange: (key: string, value: string) => setFilter(key, value, true),
      onReset: () => resetFilters({ year: String(getOperationalTaxYear()) }),
    },
    kpi: { clientRecordId, year },
    table: {
      rows,
      isLoading,
      onRowClick: (row: AdvancePaymentRow) => navigate(`/clients/${clientRecordId}/advance-payments/${row.id}`),
    },
    pagination: {
      page,
      totalPages: getTotalPages(total, 20),
      total,
      onPageChange: setPage,
    },
    createModal: {
      open: modalOpen,
      clientRecordId,
      year,
      defaultPeriodMonthsCount: generationFrequency ?? displayFrequency ?? 1,
      isCreating,
      onClose: () => setModalOpen(false),
      onCreate: handleCreate,
    },
  }
}
