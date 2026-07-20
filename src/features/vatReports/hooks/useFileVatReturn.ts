import { useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { vatReportsApi } from '../api'
import { vatMutationKeys } from '../api/mutationKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { FileVatReturnPayload, VatWorkItemResponse } from '../api'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const useFileVatReturn = (workItemId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutationWithToast<VatWorkItemResponse, FileVatReturnPayload>({
    mutationKey: vatMutationKeys.lifecycle(workItemId),
    mutationFn: (payload: FileVatReturnPayload) => vatReportsApi.fileVatReturn(workItemId, payload),
    successMessage: VAT_MESSAGES.mutations.filingSuccess,
    errorMessage: VAT_ERROR_MESSAGES.mutations.filingError,
    onSuccess: (workItem) =>
      invalidateVatWorkItem(queryClient, {
        workItemId,
        clientRecordId: workItem.client_record_id,
        includeAudit: true,
      }),
  })

  // Resolves false on failure so the modal stays open with the entered filing details.
  const fileVatReturn = async (payload: FileVatReturnPayload): Promise<boolean> => {
    try {
      await mutation.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  return { fileVatReturn, isLoading: mutation.isPending }
}
