import { useQuery } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'

export const useVatWorkItemPage = (workItemId: number) => {
  const {
    data: workItemData,
    isPending: workItemPending,
    isError: workItemError,
    refetch: workItemRefetch,
  } = useQuery({
    queryKey: vatReportsQK.detail(workItemId),
    queryFn: () => vatReportsApi.getById(workItemId),
    enabled: workItemId > 0,
  })

  const { data: invoicesData } = useQuery({
    queryKey: vatReportsQK.invoices(workItemId),
    queryFn: () => vatReportsApi.listInvoices(workItemId),
    enabled: workItemId > 0,
  })

  return {
    workItem: workItemData ?? null,
    invoices: invoicesData?.items ?? [],
    isLoading: workItemPending,
    isError: workItemError,
    refetch: workItemRefetch,
  }
}
