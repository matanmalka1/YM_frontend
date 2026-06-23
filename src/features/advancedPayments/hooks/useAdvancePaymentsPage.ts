import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { parsePositiveInt, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentOverviewRow, AdvancePaymentStatus, UpdateAdvancePaymentPayload } from '../api/contracts'
import { isAdvancePaymentStatus, ADVANCE_PAYMENTS_FILTER_FIELDS } from '../constants'
import { useAdvancePaymentBatches } from './useAdvancePaymentBatches'
import {
  getAdvancePaymentBatchKey,
  getAdvancePaymentWorkflowStats,
  mergeAdvancePaymentBatches,
} from '../utils/advancePaymentUtils'

export const useAdvancePaymentsPage = () => {
  const { searchParams, getParam, setFilter, setFilters, resetFilters } = useSearchParamFilters()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const today = new Date()
  const todayYear = today.getFullYear()
  const currentReportingMonth = today.getMonth() + 1
  const rawYear = searchParams.get('year') ?? String(getOperationalTaxYear())
  const year = rawYear === 'all' ? null : parsePositiveInt(rawYear, todayYear)
  const rawPeriod = getParam('period')
  const rawStatus = getParam('status')
  const normalizedStatus: AdvancePaymentStatus | '' = isAdvancePaymentStatus(rawStatus) ? rawStatus : ''
  const filters = {
    client_record_id: getParam('client_record_id'),
    client_name: getParam('client_name'),
    status: normalizedStatus,
    period: rawPeriod === '1' || rawPeriod === '2' ? rawPeriod : '',
  }
  const parsedClientRecordId = parsePositiveInt(filters.client_record_id, 0)
  const clientRecordId = parsedClientRecordId > 0 ? parsedClientRecordId : undefined
  const periodFilter: 1 | 2 | null = filters.period === '1' ? 1 : filters.period === '2' ? 2 : null
  const statusFilter = normalizedStatus
  const [drawerRow, setDrawerRow] = useState<AdvancePaymentOverviewRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const { batches, isLoading } = useAdvancePaymentBatches(year, clientRecordId)
  const displayBatches = useMemo(() => mergeAdvancePaymentBatches(batches, periodFilter), [batches, periodFilter])
  const defaultOpenBatchKey = useDefaultOpenGroup(
    displayBatches,
    getAdvancePaymentBatchKey,
    (batch) => batch.due_date ?? null,
  )
  const workflowStats = useMemo(
    () => getAdvancePaymentWorkflowStats(displayBatches, todayYear, currentReportingMonth),
    [currentReportingMonth, todayYear, displayBatches],
  )

  const updateMutation = useMutation({
    mutationFn: ({
      clientRecordId: rowClientRecordId,
      id,
      payload,
    }: {
      clientRecordId: number
      id: number
      payload: UpdateAdvancePaymentPayload
    }) => advancePaymentsApi.update(rowClientRecordId, id, payload),
    onSuccess: async () => {
      toast.success('מקדמה עודכנה')
      await queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      setDrawerRow(null)
    },
    onError: (error) => showErrorToast(error, 'שגיאה בעדכון מקדמה'),
  })

  const changeFilter = (key: string, value: string) => {
    setFilter(key, value, key !== 'year')
  }

  const openRow = (row: AdvancePaymentOverviewRow) => {
    if (isAdvisor) {
      setDrawerRow(row)
      return
    }
    navigate(`/clients/${row.client_record_id}/advance-payments`)
  }

  const navigateToClient = (clientRecordId: number) => {
    navigate(`/clients/${clientRecordId}/advance-payments`)
  }

  const saveRow = async (id: number, payload: UpdateAdvancePaymentPayload) => {
    if (!drawerRow) return
    await updateMutation.mutateAsync({ clientRecordId: drawerRow.client_record_id, id, payload })
  }

  return {
    status: {
      isLoading,
    },
    headerProps: {
      title: 'מקדמות מס הכנסה',
      description: 'מעקב שנתי אחר תשלומים, פיגורים וגבייה',
    },
    permissions: {
      isAdvisor,
    },
    stats: {
      workflowStats,
    },
    filters: {
      fields: ADVANCE_PAYMENTS_FILTER_FIELDS,
      values: { ...filters, year: year === null ? 'all' : String(year) },
      onChange: changeFilter,
      onMultiChange: (updates: Record<string, string>) => setFilters(updates, false),
      onReset: resetFilters,
    },
    table: {
      batches,
      displayBatches,
      year,
      clientRecordId,
      periodFilter,
      statusFilter,
      defaultOpenBatchKey,
      currentReportingYear: todayYear,
      currentReportingMonth,
      onRowClick: openRow,
      onNavigateToClient: navigateToClient,
    },
    drawers: {
      payment: {
        row: drawerRow,
        open: drawerRow !== null,
        isUpdating: updateMutation.isPending,
        canEdit: isAdvisor,
        onClose: () => setDrawerRow(null),
        onSave: saveRow,
      },
    },
    modals: {
      create: {
        open: createOpen,
        year: year ?? todayYear,
        onClose: () => setCreateOpen(false),
      },
      generate: {
        open: generateOpen,
        year: year ?? todayYear,
        onClose: () => setGenerateOpen(false),
      },
      openCreate: () => setCreateOpen(true),
      openGenerate: () => setGenerateOpen(true),
    },
  }
}
