import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDefaultOpenGroup } from '@/hooks/useDefaultOpenGroup'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { parsePositiveInt } from '@/utils/utils'
import type { AdvancePaymentOverviewRow, AdvancePaymentStatus } from '../api/contracts'
import { isAdvancePaymentStatus, ADVANCE_PAYMENTS_FILTER_FIELDS } from '../constants'
import { useAdvancePaymentBatches } from './useAdvancePaymentBatches'
import {
  getAdvancePaymentBatchKey,
  getAdvancePaymentWorkflowStats,
  mergeAdvancePaymentBatches,
} from '../utils/advancePaymentUtils'

export const useAdvancePaymentsPage = () => {
  const { searchParams, getParam, setFilter, setFilters, resetFilters } = useSearchParamFilters()
  const location = useLocation()
  const navigate = useNavigate()
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
  const [createOpen, setCreateOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const { batches, isLoading } = useAdvancePaymentBatches(year, clientRecordId)
  const displayBatches = useMemo(() => mergeAdvancePaymentBatches(batches, periodFilter), [batches, periodFilter])
  const defaultOpenBatchKey = useDefaultOpenGroup(
    displayBatches,
    getAdvancePaymentBatchKey,
    (batch) => batch.due_date ?? null,
  )
  const workflowStats = useMemo(() => getAdvancePaymentWorkflowStats(displayBatches), [displayBatches])

  const changeFilter = (key: string, value: string) => {
    setFilter(key, value, key !== 'year')
  }

  const openRow = (row: AdvancePaymentOverviewRow) => {
    navigate(`/tax/advance-payments/${row.client_record_id}/${row.id}${location.search}`, {
      state: {
        clientName: row.client_name,
        idNumber: row.id_number,
        officeClientNumber: row.office_client_number,
      },
    })
  }

  const navigateToClient = (clientRecordId: number) => {
    navigate(`/clients/${clientRecordId}/advance-payments`)
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
