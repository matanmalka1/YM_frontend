import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '@/features/clients'
import type { BusinessResponse } from '@/features/clients'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

interface UseBusinessesForClientOptions {
  clientId: number | null | undefined
  enabled?: boolean
  onAutoSelect?: (business: BusinessResponse) => void
}

export const useBusinessesForClient = ({ clientId, enabled = true, onAutoSelect }: UseBusinessesForClientOptions) => {
  const { data, isLoading } = useQuery({
    queryKey: clientId ? clientsQK.businessesAll(clientId) : clientsQK.businessesAllFallback(),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientId!),
    enabled: enabled && !!clientId,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const businesses = useMemo(() => data?.items ?? [], [data?.items])

  useEffect(() => {
    if (businesses.length === 1 && onAutoSelect) {
      onAutoSelect(businesses[0])
    }
  }, [businesses, onAutoSelect])

  return { businesses, isLoading }
}
