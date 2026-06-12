import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useFirstBusinessId = (clientId: number, enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: clientsQK.firstBusiness(clientId),
    queryFn: () =>
      clientsApi.listBusinessesForClient(clientId, {
        page: 1,
        page_size: 1,
      }),
    enabled: enabled && clientId > 0,
    staleTime: QUERY_STALE_TIME.long,
  })

  const first = data?.items?.[0] ?? null
  return { id: first?.id ?? null, name: first?.business_name ?? null, isLoading }
}
