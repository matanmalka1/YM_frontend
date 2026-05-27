import { useQuery } from '@tanstack/react-query'
import { bindersApi, bindersQK } from '@/features/binders'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useActiveVatBinder = (clientRecordId: number) => {
  const query = useQuery({
    queryKey: bindersQK.list({ client_record_id: clientRecordId, page_size: 1 }),
    queryFn: () =>
      bindersApi.list({
        client_record_id: clientRecordId,
        page_size: 1,
        location_status: 'in_office',
      }),
    enabled: Number.isInteger(clientRecordId) && clientRecordId > 0,
    staleTime: QUERY_STALE_TIME.medium,
  })

  return {
    ...query,
    activeBinder: query.data?.items?.[0] ?? null,
  }
}
