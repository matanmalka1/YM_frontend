import { useQuery } from '@tanstack/react-query'
import { vatReportsApi, vatReportsQK } from '../api'
import type { VatWorkItemGroupSummary, VatWorkItemGroupsParams } from '../api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { VAT_MESSAGES } from '../messages'

export const useVatWorkItemGroups = (params: VatWorkItemGroupsParams = {}) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: vatReportsQK.groups(params),
    queryFn: () => vatReportsApi.listGroups(params),
    staleTime: QUERY_STALE_TIME.default,
  })

  return {
    groups: (data?.groups ?? []) as VatWorkItemGroupSummary[],
    isLoading,
    isFetching,
    error: error ? VAT_MESSAGES.page.loadingGroupsError : null,
  }
}
