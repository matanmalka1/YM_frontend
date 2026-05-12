import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { MonthBatchSummary } from '../types'

export const useAdvancePaymentBatches = (year: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: advancedPaymentsQK.batches(year),
    queryFn: () => advancePaymentsApi.getBatches(year),
    placeholderData: keepPreviousData,
  })

  const batches: MonthBatchSummary[] = data ?? []

  return { batches, isLoading, error: error ?? null }
}
