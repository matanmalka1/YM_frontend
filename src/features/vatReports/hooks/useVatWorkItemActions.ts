import { useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { vatReportsApi } from '../api'
import { vatMutationKeys } from '../api/mutationKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { VatWorkItemResponse } from '../api'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const useVatWorkItemActions = (workItemId: number) => {
  const queryClient = useQueryClient()
  const mutationKey = vatMutationKeys.lifecycle(workItemId)

  // A status change can replace the set of available actions in place, so a second click must
  // not land on an action that just appeared under the cursor. Awaiting the invalidation here
  // holds the mutation pending until the refreshed work item is on screen, and everything
  // watching the lifecycle key stays disabled across the swap.
  const onSuccess = (workItem: VatWorkItemResponse) =>
    invalidateVatWorkItem(queryClient, {
      workItemId: workItem.id,
      clientRecordId: workItem.client_record_id,
    })

  const materialsComplete = useMutationWithToast<VatWorkItemResponse, void>({
    mutationKey,
    mutationFn: () => vatReportsApi.markMaterialsComplete(workItemId),
    successMessage: VAT_MESSAGES.mutations.materialsConfirmed,
    errorMessage: VAT_ERROR_MESSAGES.mutations.statusChangeError,
    onSuccess,
  })

  const readyForReview = useMutationWithToast<VatWorkItemResponse, void>({
    mutationKey,
    mutationFn: () => vatReportsApi.markReadyForReview(workItemId),
    successMessage: VAT_MESSAGES.mutations.readyForReview,
    errorMessage: VAT_ERROR_MESSAGES.mutations.statusChangeError,
    onSuccess,
  })

  const sendBack = useMutationWithToast<VatWorkItemResponse, string>({
    mutationKey,
    mutationFn: (note: string) => vatReportsApi.sendBack(workItemId, note),
    successMessage: VAT_MESSAGES.mutations.sendBackSuccess,
    errorMessage: VAT_ERROR_MESSAGES.page.sendBackError,
    onSuccess,
  })

  return {
    handleMaterialsComplete: () => materialsComplete.mutate(),
    handleReadyForReview: () => readyForReview.mutate(),
    // Resolves false when the transition failed, so the caller can keep the note on screen.
    handleSendBack: async (note: string): Promise<boolean> => {
      try {
        await sendBack.mutateAsync(note)
        return true
      } catch {
        return false
      }
    },
  }
}
