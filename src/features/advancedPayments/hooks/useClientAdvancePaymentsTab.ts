import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { useRole } from '@/hooks/useRole'
import { getHttpStatus, parsePositiveInt, showErrorToast } from '@/utils/utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { toast } from '@/utils/toast'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { isAdvancePaymentStatus } from '../constants'
import { useAdvancePayments } from './useAdvancePayments'
import { useAdvanceRateInsights } from './useAdvanceRateInsights'

interface UseClientAdvancePaymentsTabArgs {
  clientRecordId: number
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
}

export const useClientAdvancePaymentsTab = ({
  clientRecordId,
  clientName,
  clientIdNumber,
  officeClientNumber,
}: UseClientAdvancePaymentsTabArgs) => {
  const { searchParams, getParam, getPage, setFilter, setPage, resetFilters } = useSearchParamFilters()
  const { isAdvisor } = useRole()
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [drawerRow, setDrawerRow] = useState<AdvancePaymentRow | null>(null)

  const year = parsePositiveInt(searchParams.get('year'), getOperationalTaxYear())
  const page = getPage()
  const rawStatusFilter = getParam('status_filter')
  const statusFilter = rawStatusFilter ? rawStatusFilter.split(',').filter(isAdvancePaymentStatus) : []

  const { rows, isLoading, total, create, isCreating, deleteRow, isDeletingId } = useAdvancePayments(
    clientRecordId,
    year,
    statusFilter,
    page,
  )
  const { advancePaymentFrequency, advanceRate } = useAdvanceRateInsights(clientRecordId)

  const generationFrequency: 1 | 2 | null =
    advancePaymentFrequency === 'bimonthly' ? 2 : advancePaymentFrequency === 'monthly' ? 1 : null
  const displayFrequency: 1 | 2 | null = rows.length > 0 ? rows[0].period_months_count : generationFrequency

  const invalidateClientYear = () =>
    queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.clientYear(clientRecordId, year) })

  const generateMutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) =>
      advancePaymentsApi.generateSchedule(clientRecordId, year, periodMonthsCount),
    onSuccess: (data) => {
      toast.success(data.created > 0 ? `נוצרו ${data.created} מקדמות` : 'הכול קיים')
      void invalidateClientYear()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת לוח מקדמות'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdvancePaymentPayload }) =>
      advancePaymentsApi.update(clientRecordId, id, payload),
    onSuccess: () => {
      toast.success('מקדמה עודכנה בהצלחה')
      void invalidateClientYear()
      setDrawerRow(null)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון מקדמה'),
  })

  const handleGenerateSchedule = () => {
    if (generationFrequency == null) {
      toast.error('לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח')
      return
    }
    generateMutation.mutate(generationFrequency)
  }

  const handleSave = async (id: number, payload: UpdateAdvancePaymentPayload) => {
    await updateMutation.mutateAsync({ id, payload })
  }

  const handleDelete = async (id: number) => {
    await deleteRow(id)
    toast.success('מקדמה נמחקה בהצלחה')
    setDrawerRow(null)
  }

  const handleCreate = async (...args: Parameters<typeof create>) => {
    try {
      const result = await create(...args)
      toast.success('מקדמה נוצרה בהצלחה')
      return result
    } catch (err) {
      if (getHttpStatus(err) === 409) {
        toast.error('מקדמה לחודש זה כבר קיימת')
      } else {
        showErrorToast(err, 'שגיאה ביצירת מקדמה')
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
      onRowClick: (row: AdvancePaymentRow) => setDrawerRow(row),
    },
    pagination: {
      page,
      totalPages: getTotalPages(total, 20),
      total,
      onPageChange: setPage,
    },
    drawer: {
      row: drawerRow,
      open: drawerRow !== null,
      isUpdating: updateMutation.isPending,
      isDeleting: isDeletingId !== null,
      canEdit: isAdvisor,
      onClose: () => setDrawerRow(null),
      onSave: handleSave,
      onDelete: isAdvisor ? handleDelete : undefined,
      clientName,
      clientIdNumber,
      officeClientNumber,
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
