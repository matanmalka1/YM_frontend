import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../../api'
import type { ClientConflictInfo } from '../../api/contracts'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useIdNumberConflict = (
  idNumber: string,
  enabled: boolean,
): { conflict: ClientConflictInfo | undefined; isLoading: boolean } => {
  const trimmed = idNumber.trim()
  const shouldCheck = enabled && trimmed.length === 9 && /^\d{9}$/.test(trimmed)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', 'conflict', trimmed],
    queryFn: () => clientsApi.getConflictByIdNumber(trimmed),
    enabled: shouldCheck,
    staleTime: QUERY_STALE_TIME.default,
    retry: false,
  })

  return { conflict: shouldCheck ? data : undefined, isLoading: shouldCheck && isLoading }
}
