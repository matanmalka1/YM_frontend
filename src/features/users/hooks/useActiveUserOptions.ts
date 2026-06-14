import { useQuery } from '@tanstack/react-query'
import { usersApi, usersQK } from '../api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const ACTIVE_USER_OPTIONS_PARAMS = {
  page: 1,
  page_size: 200,
  is_active: 'true' as const,
}

export const useActiveUserOptions = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: usersQK.activeOptions(),
    queryFn: () => usersApi.list(ACTIVE_USER_OPTIONS_PARAMS),
    staleTime: QUERY_STALE_TIME.long,
  })
