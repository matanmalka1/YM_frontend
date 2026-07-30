import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorBody, showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { ADVANCE_PAYMENT_VAT_NOT_FILED_CODE } from '../constants'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'
import { toast } from '@/utils/toast'

interface UpdateAdvancePaymentVariables {
  id: number
  payload: UpdateAdvancePaymentPayload
}

interface RefreshTurnoverVariables {
  id: number
  confirmPending: boolean
}

interface DeleteAdvancePaymentVariables {
  paymentId: number
  reason: string
}

interface UseAdvancePaymentMutationsOptions {
  clientRecordId: number
  onUpdateSuccess?: (payment: AdvancePaymentRow) => void
  onDeleteSuccess?: (paymentId: number) => void
  /** Receives the restored original, which is where the advisor continues. */
  onWithdrawSuccess?: (original: AdvancePaymentRow) => void
  onRefreshTurnoverSuccess?: (payment: AdvancePaymentRow) => void
  /** Called instead of a toast when the period's VAT return is not filed yet. */
  onRefreshTurnoverNotFiled?: (paymentId: number) => void
}

export const useAdvancePaymentMutations = ({
  clientRecordId,
  onUpdateSuccess,
  onDeleteSuccess,
  onWithdrawSuccess,
  onRefreshTurnoverSuccess,
  onRefreshTurnoverNotFiled,
}: UseAdvancePaymentMutationsOptions) => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateAdvancePaymentVariables) => advancePaymentsApi.update(clientRecordId, id, payload),
    onSuccess: (payment) => {
      onUpdateSuccess?.(payment)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.update),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ paymentId, reason }: DeleteAdvancePaymentVariables) =>
      advancePaymentsApi.delete(clientRecordId, paymentId, { reason }),
    onSuccess: (_result, { paymentId }) => {
      onDeleteSuccess?.(paymentId)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.delete),
  })

  // Withdrawing touches two rows — the amendment and the payment it corrected —
  // so the whole key space is invalidated rather than the two ids.
  const withdrawMutation = useMutation({
    mutationFn: (paymentId: number) => advancePaymentsApi.withdrawAmendment(clientRecordId, paymentId),
    onSuccess: (original) => {
      toast.success(ADVANCED_PAYMENTS_MESSAGES.detailActions.withdrawSuccess)
      onWithdrawSuccess?.(original)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.withdraw),
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
    withdrawAmendment: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
    deletingId: deleteMutation.isPending ? (deleteMutation.variables?.paymentId ?? null) : null,
  }
}
