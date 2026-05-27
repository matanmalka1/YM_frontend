import { useQuery } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'

export const useVatWorkItemPage = (workItemId: number) => {
  const workItemQuery = useQuery({
    queryKey: vatReportsQK.detail(workItemId),
    queryFn: () => vatReportsApi.getById(workItemId),
    enabled: workItemId > 0,
  })

  const invoicesQuery = useQuery({
    queryKey: vatReportsQK.invoices(workItemId),
    queryFn: () => vatReportsApi.listInvoices(workItemId),
    enabled: workItemId > 0,
  })

  return {
    workItem: workItemQuery.data ?? null,
    invoices: invoicesQuery.data?.items ?? [],
    isLoading: workItemQuery.isPending,
    isError: workItemQuery.isError,
    refetch: workItemQuery.refetch,
  }
}
