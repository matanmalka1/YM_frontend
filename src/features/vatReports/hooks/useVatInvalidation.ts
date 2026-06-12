import type { QueryClient } from '@tanstack/react-query'
import type { VatWorkItemResponse } from '../api'
import { vatReportsQK } from '../api/queryKeys'

interface InvalidateVatWorkItemOptions {
  workItemId?: number
  clientRecordId?: number | null
  includeInvoices?: boolean
  includeAudit?: boolean
}

const getCachedClientRecordId = (queryClient: QueryClient, workItemId: number | undefined) => {
  if (!workItemId) return null
  return queryClient.getQueryData<VatWorkItemResponse>(vatReportsQK.detail(workItemId))?.client_record_id ?? null
}

const invalidateVatLists = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: vatReportsQK.lists() }),
    queryClient.invalidateQueries({ queryKey: vatReportsQK.groups() }),
  ])

export const invalidateVatWorkItem = async (
  queryClient: QueryClient,
  { workItemId, clientRecordId, includeInvoices = false, includeAudit = true }: InvalidateVatWorkItemOptions,
) => {
  const resolvedClientRecordId = clientRecordId ?? getCachedClientRecordId(queryClient, workItemId)

  await Promise.all([
    invalidateVatLists(queryClient),
    workItemId ? queryClient.invalidateQueries({ queryKey: vatReportsQK.detail(workItemId) }) : Promise.resolve(),
    workItemId && includeInvoices
      ? queryClient.invalidateQueries({ queryKey: vatReportsQK.invoices(workItemId) })
      : Promise.resolve(),
    workItemId && includeAudit
      ? queryClient.invalidateQueries({ queryKey: vatReportsQK.audit(workItemId) })
      : Promise.resolve(),
    resolvedClientRecordId
      ? queryClient.invalidateQueries({
          queryKey: vatReportsQK.clientSummary(resolvedClientRecordId),
        })
      : Promise.resolve(),
  ])
}
