import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'

export const useFirstBusinessId = (clientId: number, enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: clientsQK.businessesAll(clientId),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientId),
    enabled: enabled && clientId > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const first = data?.items?.[0] ?? null
  return { id: first?.id ?? null, name: first?.business_name ?? null, isLoading }
}
