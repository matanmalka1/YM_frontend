import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../../api'

interface UseBusinessesForClientOptions {
  clientId: number | null | undefined
  enabled?: boolean
}

export const useBusinessesForClient = ({ clientId, enabled = true }: UseBusinessesForClientOptions) => {
  const { data, isLoading } = useQuery({
    queryKey: clientId ? clientsQK.businessesAll(clientId) : clientsQK.businessesAllFallback(),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientId!),
    enabled: enabled && !!clientId,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const businesses = useMemo(() => data?.items ?? [], [data?.items])

  return { businesses, isLoading }
}
