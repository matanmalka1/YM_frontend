import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { vatReportsApi, vatReportsQK } from '../api'

export const useVatDeductionMetadata = () => {
  const query = useQuery({
    queryKey: vatReportsQK.deductionMetadata(),
    queryFn: vatReportsApi.getDeductionMetadata,
    staleTime: QUERY_STALE_TIME.long,
  })

  const categories = query.data?.categories ?? []

  return {
    ...query,
    categories,
    categoryOptions: categories.map(({ category, label }) => ({ value: category, label })),
    categoryLabels: Object.fromEntries(categories.map(({ category, label }) => [category, label])),
  }
}
