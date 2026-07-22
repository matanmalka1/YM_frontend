import { useQuery } from '@tanstack/react-query'
import type { ClientPickerValue } from '../components/picker'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { clientsApi, clientsQK } from '../api'

/**
 * Resolves the display identity of a client whose id arrived through a URL filter
 * (deep link, shared link, reset + restore), where the id is known but the name is not.
 *
 * `skip` is for callers that already hold a locally picked name paired with the same id
 * and therefore need no request.
 */
export const useFilterClient = (
  clientRecordId: number | null,
  { skip = false }: { skip?: boolean } = {},
): ClientPickerValue | null => {
  const { data } = useQuery({
    queryKey: clientsQK.detail(clientRecordId ?? 0),
    queryFn: () => clientsApi.getById(clientRecordId as number),
    enabled: clientRecordId != null && !skip,
    staleTime: QUERY_STALE_TIME.medium,
  })

  if (!data) return null
  return { id: data.id, name: data.full_name, office_client_number: data.office_client_number }
}
