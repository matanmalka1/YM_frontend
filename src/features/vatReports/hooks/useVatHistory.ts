import { useQuery } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'

export const useVatHistory = (workItemId: number, page: number, pageSize: number) => {
  const params = { page: page + 1, page_size: pageSize }
  const query = useQuery({
    queryKey: vatReportsQK.audit(workItemId, params),
    queryFn: () => vatReportsApi.getAuditTrail(workItemId, params),
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  }
}
