import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
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
 * The page cannot stay where it is: the record it is showing no longer exists, so
 * the next fetch of this URL answers 404. It navigates to the restored original by
 * swapping the trailing id of the current path rather than by naming a route —
 * this panel is mounted both standalone and inside the client tab, and in both the
 * last segment is the work item being viewed.
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
    onSuccess: (original) => {
      invalidateVatWorkItem(queryClient, {
        workItemId,
        clientRecordId: original.client_record_id,
        includeAudit: true,
      })
      invalidateVatWorkItem(queryClient, {
        workItemId: original.id,
        clientRecordId: original.client_record_id,
        includeAudit: true,
      })
      navigate(pathname.replace(/[^/]+$/, String(original.id)), { replace: true })
    },
  })

  return { withdrawAmendment: mutation.mutateAsync, isLoading: mutation.isPending }
}
