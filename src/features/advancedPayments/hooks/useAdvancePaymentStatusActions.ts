import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentStatus } from '../api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

interface UseAdvancePaymentStatusActionsArgs {
  clientRecordId: number
  paymentId: number
  /** Readiness is fetched only while the close action is on the table. */
  readinessEnabled: boolean
}

export const useAdvancePaymentStatusActions = ({
  clientRecordId,
  paymentId,
  readinessEnabled,
}: UseAdvancePaymentStatusActionsArgs) => {
  const queryClient = useQueryClient()

  const readiness = useQuery({
    queryKey: advancedPaymentsQK.readiness(clientRecordId, paymentId),
    queryFn: () => advancePaymentsApi.getClosingReadiness(clientRecordId, paymentId),
    enabled: readinessEnabled,
  })

  const transitionMutation = useMutation({
    mutationFn: ({ status, note }: { status: AdvancePaymentStatus; note?: string }) =>
      advancePaymentsApi.transitionStatus(clientRecordId, paymentId, { status, note: note ?? null }),
    onSuccess: (payment) => {
      toast.success(
        payment.status === 'submitted'
          ? ADVANCED_PAYMENTS_MESSAGES.statusPanel.closeSuccess
          : ADVANCED_PAYMENTS_MESSAGES.statusPanel.transitionSuccess,
      )
      queryClient.setQueryData(advancedPaymentsQK.detail(clientRecordId, payment.id), payment)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.statusTransition.transition),
  })

  return {
    readiness: {
      data: readiness.data ?? null,
      isLoading: readiness.isLoading,
    },
    transition: (status: AdvancePaymentStatus, note?: string) => transitionMutation.mutateAsync({ status, note }),
    isTransitioning: transitionMutation.isPending,
  }
}
