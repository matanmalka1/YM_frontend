import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { toSiblingRecordPath } from '@/utils/recordPath'
import { vatReportsApi } from '../api'
import { vatMutationKeys } from '../api/mutationKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { VatWorkItemResponse } from '../api'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

/**
 * Take back an open correction, returning the period to its filed record (D-12).
 *
 * Both records are invalidated, for opposite reasons: the amendment is gone, and
 * the original has just lost its `superseded_at` — a stale cache would keep
 * hiding it as corrected and would keep withholding "amend" on a record that can
 * now be corrected again.
 *
 * Both chains go with them: the key sits outside the list/detail space, so a
 * chain already on screen would keep showing the withdrawn correction as live.
 *
 * The page cannot stay where it is — the record it is showing no longer exists,
 * so the next fetch of this URL answers 404. It replaces the entry rather than
 * pushing one, because Back would land on that same dead URL.
 */
export const useWithdrawVatAmendment = (workItemId: number) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const mutation = useMutationWithToast<VatWorkItemResponse, void>({
    mutationKey: vatMutationKeys.lifecycle(workItemId),
    mutationFn: () => vatReportsApi.withdrawAmendment(workItemId),
    successMessage: VAT_MESSAGES.mutations.withdrawSuccess,
    errorMessage: VAT_ERROR_MESSAGES.mutations.withdrawError,
    onSuccess: async (original) => {
      await Promise.all([
        invalidateVatWorkItem(queryClient, {
          workItemId,
          clientRecordId: original.client_record_id,
          includeAudit: true,
          includeChain: true,
        }),
        invalidateVatWorkItem(queryClient, {
          workItemId: original.id,
          clientRecordId: original.client_record_id,
          includeAudit: true,
          includeChain: true,
        }),
      ])
      navigate(toSiblingRecordPath(pathname, original.id), { replace: true })
    },
  })

  return { withdrawAmendment: mutation.mutateAsync, isLoading: mutation.isPending }
}
