import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'

export const useClientAuditTrail = (clientId: number, page: number, pageSize: number) => {
  const params = { limit: pageSize, offset: page * pageSize }
  const query = useQuery({
    queryKey: clientsQK.auditTrail(clientId, params),
    queryFn: () => clientsApi.getAuditTrail(clientId, params),
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  }
}
