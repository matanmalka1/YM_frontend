import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

interface UpdateAdvancePaymentVariables {
  id: number
  payload: UpdateAdvancePaymentPayload
}

interface UseAdvancePaymentMutationsOptions {
  clientRecordId: number
  onUpdateSuccess?: (payment: AdvancePaymentRow) => void
  onDeleteSuccess?: (paymentId: number) => void
}

export const useAdvancePaymentMutations = ({
  clientRecordId,
  onUpdateSuccess,
  onDeleteSuccess,
}: UseAdvancePaymentMutationsOptions) => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateAdvancePaymentVariables) =>
      advancePaymentsApi.update(clientRecordId, id, payload),
    onSuccess: (payment) => {
      onUpdateSuccess?.(payment)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.update),
  })

  const deleteMutation = useMutation({
    mutationFn: (paymentId: number) => advancePaymentsApi.delete(clientRecordId, paymentId),
    onSuccess: (_result, paymentId) => {
      onDeleteSuccess?.(paymentId)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.delete),
  })

  return {
    updatePayment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updatingId: updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null,
    deletePayment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
