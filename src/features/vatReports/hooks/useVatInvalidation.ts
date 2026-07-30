import type { QueryClient } from '@tanstack/react-query'
import { auditQK } from '@/features/audit'
import type { VatWorkItemResponse } from '../api'
import { vatReportsQK } from '../api/queryKeys'

interface InvalidateVatWorkItemOptions {
  workItemId?: number
  clientRecordId?: number | null
  includeInvoices?: boolean
  includeAudit?: boolean
  /**
   * The correction history of this item's period. Off by default: the chain key
   * sits outside the list/detail key space, so an ordinary status change cannot
   * touch it. Only creating and withdrawing a correction rewrite the chain, and
   * a stale one shows a correction that does not exist yet — or one that was
   * taken back — as the period's live record.
   */
  includeChain?: boolean
}

const getCachedClientRecordId = (queryClient: QueryClient, workItemId: number | undefined) => {
  if (!workItemId) return null
  return queryClient.getQueryData<VatWorkItemResponse>(vatReportsQK.detail(workItemId))?.client_record_id ?? null
}

const invalidateVatLists = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: vatReportsQK.lists() }),
    queryClient.invalidateQueries({ queryKey: vatReportsQK.groupsRoot() }),
    queryClient.invalidateQueries({ queryKey: vatReportsQK.statusSummaryRoot() }),
  ])

export const invalidateVatWorkItem = async (
  queryClient: QueryClient,
  {
    workItemId,
    clientRecordId,
    includeInvoices = false,
    includeAudit = true,
    includeChain = false,
  }: InvalidateVatWorkItemOptions,
) => {
  const resolvedClientRecordId = clientRecordId ?? getCachedClientRecordId(queryClient, workItemId)

  await Promise.all([
    invalidateVatLists(queryClient),
    workItemId ? queryClient.invalidateQueries({ queryKey: vatReportsQK.detail(workItemId) }) : Promise.resolve(),
    workItemId && includeInvoices
      ? queryClient.invalidateQueries({ queryKey: vatReportsQK.invoices(workItemId) })
      : Promise.resolve(),
    workItemId && includeAudit
      ? queryClient.invalidateQueries({ queryKey: auditQK.entityRoot('vat_work_item', workItemId) })
      : Promise.resolve(),
    workItemId && includeChain ? queryClient.invalidateQueries({ queryKey: vatReportsQK.chain(workItemId) }) : Promise.resolve(),
    resolvedClientRecordId
      ? queryClient.invalidateQueries({
          queryKey: vatReportsQK.clientSummaryRoot(resolvedClientRecordId),
        })
      : Promise.resolve(),
    resolvedClientRecordId
      ? queryClient.invalidateQueries({
          queryKey: vatReportsQK.forClient(resolvedClientRecordId),
        })
      : Promise.resolve(),
  ])
}
