import { useQuery } from '@tanstack/react-query'
import { usersApi, usersQK } from '../api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { PAGE_SIZE_MAX } from '@/constants/pagination.constants'

const ACTIVE_USER_OPTIONS_PARAMS = {
  page: 1,
  page_size: PAGE_SIZE_MAX,
  is_active: 'true' as const,
}

export const useActiveUserOptions = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: usersQK.activeOptions(),
    queryFn: () => usersApi.list(ACTIVE_USER_OPTIONS_PARAMS),
    staleTime: QUERY_STALE_TIME.long,
  })
