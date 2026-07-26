import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentDueDateGroup, AdvancePaymentStatus, ListAdvancePaymentsOverviewParams } from '../api/contracts'
import {
  DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_BY,
  DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER,
  type AdvancePaymentOverviewSortBy,
  type AdvancePaymentOverviewSortOrder,
} from '../constants'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'

export const ADVANCE_PAYMENT_BATCH_PAGE_SIZE = PAGE_SIZE_SM

interface UseAdvancePaymentBatchRowsParams {
  batch: AdvancePaymentDueDateGroup
  clientRecordId?: number
  clientSearch?: string
  statusFilter: AdvancePaymentStatus | ''
  timingFilter?: 'overdue'
  periodFilter: 1 | 2 | null
  sortBy: AdvancePaymentOverviewSortBy
  order: AdvancePaymentOverviewSortOrder
}

export const useAdvancePaymentBatchRows = ({
  batch,
  clientRecordId,
  clientSearch,
  statusFilter,
  timingFilter,
  periodFilter,
  sortBy,
  order,
}: UseAdvancePaymentBatchRowsParams) => {
  const [page, setPage] = useState(1)
  const status = statusFilter ? [statusFilter] : undefined

  useEffect(() => {
    setPage(1)
  }, [
    batch.due_date,
    batch.month,
    batch.period_months_count,
    clientRecordId,
    clientSearch,
    periodFilter,
    statusFilter,
    timingFilter,
    sortBy,
    order,
  ])

  const params: ListAdvancePaymentsOverviewParams = {
    year: batch.year,
    month: batch.due_date ? undefined : batch.month,
    due_date: batch.due_date ?? undefined,
    period_months_count: periodFilter ?? (batch.due_date ? undefined : batch.period_months_count),
    client_record_id: clientRecordId,
    client_search: clientSearch,
    sort_by: sortBy,
    order,
    page,
    page_size: ADVANCE_PAYMENT_BATCH_PAGE_SIZE,
    status,
    timing_status: timingFilter,
  }
  const { data, isLoading, isFetching } = useQuery({
    queryKey: advancedPaymentsQK.overview(params),
    queryFn: () => advancePaymentsApi.overview(params),
  })

  // An explicit non-default sort means the user chose an order — the server's
  // order must win. The missing-turnover-first resort only applies to the
  // default view, where no explicit sort has been requested.
  const isDefaultSort =
    sortBy === DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_BY && order === DEFAULT_ADVANCE_PAYMENT_OVERVIEW_SORT_ORDER
  const items = data?.items ?? []
  const rows = isDefaultSort
    ? items.toSorted((first, second) => Number(second.missing_turnover) - Number(first.missing_turnover))
    : items

  return {
    page,
    setPage,
    rows,
    total: data?.total ?? 0,
    isLoading,
    isFetching,
  }
}
