import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'

export const useFirstBusinessId = (clientId: number) => {
  const { data, isLoading } = useQuery({
    queryKey: clientsQK.firstBusiness(clientId),
    queryFn: () =>
      clientsApi.listBusinessesForClient(clientId, {
        page: 1,
        page_size: 1,
      }),
    enabled: clientId > 0,
    staleTime: 60_000,
  })

  const first = data?.items?.[0] ?? null
  return { id: first?.id ?? null, name: first?.business_name ?? null, isLoading }
}
