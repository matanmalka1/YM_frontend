import { useQuery } from '@tanstack/react-query'
import { vatReportsApi, vatReportsQK } from '../api'
import type { VatWorkItemGroupItemsParams } from '../api'

export const useVatGroupItems = (groupKey: string, params: VatWorkItemGroupItemsParams) =>
  useQuery({
    queryKey: vatReportsQK.groupItems(groupKey, params),
    queryFn: () => vatReportsApi.listGroupItems(groupKey, params),
  })
