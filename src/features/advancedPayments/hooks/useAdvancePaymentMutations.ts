import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorBody, showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { ADVANCE_PAYMENT_VAT_NOT_FILED_CODE } from '../constants'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

interface UpdateAdvancePaymentVariables {
  id: number
  payload: UpdateAdvancePaymentPayload
}

interface RefreshTurnoverVariables {
  id: number
  confirmPending: boolean
}

interface UseAdvancePaymentMutationsOptions {
  clientRecordId: number
  onUpdateSuccess?: (payment: AdvancePaymentRow) => void
  onDeleteSuccess?: (paymentId: number) => void
  onRefreshTurnoverSuccess?: (payment: AdvancePaymentRow) => void
  /** Called instead of a toast when the period's VAT return is not filed yet. */
  onRefreshTurnoverNotFiled?: (paymentId: number) => void
}

export const useAdvancePaymentMutations = ({
  clientRecordId,
  onUpdateSuccess,
  onDeleteSuccess,
  onRefreshTurnoverSuccess,
  onRefreshTurnoverNotFiled,
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

  const refreshTurnoverMutation = useMutation({
    mutationFn: ({ id, confirmPending }: RefreshTurnoverVariables) =>
      advancePaymentsApi.refreshTurnover(clientRecordId, id, confirmPending),
    onSuccess: (payment) => {
      onRefreshTurnoverSuccess?.(payment)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error, { id }) => {
      // Not an error the advisor should be toasted about — it is a decision
      // point: snapshot the unfiled figure, or wait for the return to be filed.
      if (getApiErrorBody(error)?.code === ADVANCE_PAYMENT_VAT_NOT_FILED_CODE) {
        onRefreshTurnoverNotFiled?.(id)
        return
      }
      showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.turnoverRefresh)
    },
  })

  return {
    refreshTurnover: refreshTurnoverMutation.mutateAsync,
    isRefreshingTurnover: refreshTurnoverMutation.isPending,
    updatePayment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updatingId: updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null,
    deletePayment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
