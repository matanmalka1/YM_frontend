import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { MonthBatchSummary } from '../api/contracts'

export const useAdvancePaymentBatches = (year: number | null, clientRecordId?: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: advancedPaymentsQK.batches(year, clientRecordId),
    queryFn: () => advancePaymentsApi.getBatches(year, clientRecordId),
    placeholderData: keepPreviousData,
  })

  const batches: MonthBatchSummary[] = data ?? []

  return { batches, isLoading, error: error ?? null }
}
