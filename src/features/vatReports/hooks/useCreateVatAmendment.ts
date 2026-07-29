import { useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { vatReportsApi } from '../api'
import { vatMutationKeys } from '../api/mutationKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { VatWorkItemResponse } from '../api'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

/**
 * Open a correction of a closed period as a new record (D-10, D-21).
 *
 * The original is invalidated as well as the amendment: it has just gained a
 * `superseded_at`, and a stale cache would keep offering "amend" on a record
 * that already has one.
 */
export const useCreateVatAmendment = (workItemId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutationWithToast<VatWorkItemResponse, void>({
    mutationKey: vatMutationKeys.lifecycle(workItemId),
    mutationFn: () => vatReportsApi.createAmendment(workItemId),
    successMessage: VAT_MESSAGES.mutations.amendmentSuccess,
    errorMessage: VAT_ERROR_MESSAGES.mutations.amendmentError,
    onSuccess: (amendment) => {
      invalidateVatWorkItem(queryClient, {
        workItemId,
        clientRecordId: amendment.client_record_id,
        includeAudit: true,
      })
      invalidateVatWorkItem(queryClient, {
        workItemId: amendment.id,
        clientRecordId: amendment.client_record_id,
      })
    },
  })

  return { createAmendment: mutation.mutateAsync, isLoading: mutation.isPending }
}
