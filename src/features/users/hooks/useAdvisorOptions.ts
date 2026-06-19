import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { usersApi, usersQK } from '../api'
import { PAGE_SIZE_LG } from '@/constants/pagination.constants'

const ADVISOR_LIST_PARAMS = {
  is_active: 'true' as const,
  page: 1,
  page_size: PAGE_SIZE_LG,
}

export const useAdvisorOptions = (enabled = true) => {
  const { data, isPending } = useQuery({
    enabled,
    queryKey: usersQK.list(ADVISOR_LIST_PARAMS),
    queryFn: () => usersApi.list(ADVISOR_LIST_PARAMS),
    staleTime: QUERY_STALE_TIME.long,
  })

  const advisors = useMemo(
    () => (data?.items ?? []).filter((user) => user.role === 'advisor'),
    [data?.items],
  )

  const options = useMemo(() => advisors.map((user) => ({ value: String(user.id), label: user.full_name })), [advisors])

  const nameById = useMemo(() => new Map(advisors.map((user) => [user.id, user.full_name])), [advisors])

  return {
    advisors,
    options,
    nameById,
    isLoading: isPending,
  }
}
