import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentDueDateGroup, AdvancePaymentStatus, ListAdvancePaymentsOverviewParams } from '../types'

export const ADVANCE_PAYMENT_BATCH_PAGE_SIZE = 20

interface UseAdvancePaymentBatchRowsParams {
  batch: AdvancePaymentDueDateGroup
  clientRecordId?: number
  statusFilter: AdvancePaymentStatus | ''
  periodFilter: 1 | 2 | null
}

export const useAdvancePaymentBatchRows = ({
  batch,
  clientRecordId,
  statusFilter,
  periodFilter,
}: UseAdvancePaymentBatchRowsParams) => {
  const [page, setPage] = useState(1)
  const status = statusFilter ? [statusFilter] : undefined

  useEffect(() => {
    setPage(1)
  }, [batch.due_date, batch.month, batch.period_months_count, clientRecordId, periodFilter, statusFilter])

  const params: ListAdvancePaymentsOverviewParams = {
    year: batch.year,
    month: batch.due_date ? undefined : batch.month,
    due_date: batch.due_date,
    period_months_count: periodFilter ?? (batch.due_date ? undefined : batch.period_months_count),
    client_record_id: clientRecordId,
    page,
    page_size: ADVANCE_PAYMENT_BATCH_PAGE_SIZE,
    status,
  }
  const query = useQuery({
    queryKey: advancedPaymentsQK.overview(params),
    queryFn: () => advancePaymentsApi.overview(params),
    staleTime: QUERY_STALE_TIME.default,
  })

  const rows = [...(query.data?.items ?? [])].sort(
    (first, second) => Number(second.missing_turnover) - Number(first.missing_turnover),
  )

  return {
    page,
    setPage,
    rows,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
  }
}
