import { useQuery } from '@tanstack/react-query'
import { vatReportsApi, vatReportsQK } from '../api'
import type { VatWorkItemGroupSummary, VatWorkItemGroupsParams } from '../api'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const useVatWorkItemGroups = (params: VatWorkItemGroupsParams = {}) => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: vatReportsQK.groups(params),
    queryFn: () => vatReportsApi.listGroups(params),
  })

  return {
    groups: (data?.groups ?? []) as VatWorkItemGroupSummary[],
    isLoading,
    isFetching,
    error: error ? VAT_ERROR_MESSAGES.page.loadingGroupsError : null,
  }
}
