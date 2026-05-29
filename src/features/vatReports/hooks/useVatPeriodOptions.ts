import { useQuery } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useVatPeriodOptions = (clientId: number, year: number, enabled = true) => {
  const isValidClient = Number.isInteger(clientId) && clientId > 0

  const query = useQuery({
    queryKey: vatReportsQK.periodOptions(clientId, year),
    queryFn: () => vatReportsApi.getPeriodOptions(clientId, year),
    enabled: enabled && isValidClient,
    staleTime: QUERY_STALE_TIME.long,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    isValidClient,
    periodOptions: query.data?.options ?? [],
    periodType: query.data?.period_type ?? null,
  }
}
