import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Breadcrumb } from '@/components/layout/PageHeader'
import { useRole } from '@/hooks/useRole'
import { toast } from '@/utils/toast'
import { getErrorMessage } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { UpdateAdvancePaymentPayload } from '../api/contracts'
import { getAdvancePaymentMonthLabel } from '../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import { useAdvancePaymentMutations } from './useAdvancePaymentMutations'

interface UseAdvancePaymentDetailPageArgs {
  clientRecordId: number
  paymentId: number
  clientName?: string | null
  officeClientNumber?: number | null
  /** Where the page returns to after a delete; also the last linked breadcrumb. */
  backPath: string
  leadingBreadcrumbs: Breadcrumb[]
}

export const useAdvancePaymentDetailPage = ({
  clientRecordId,
  paymentId,
  clientName,
  officeClientNumber,
  backPath,
  leadingBreadcrumbs,
}: UseAdvancePaymentDetailPageArgs) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()

  const {
    data: payment,
    isPending,
    error,
  } = useQuery({
    queryKey: advancedPaymentsQK.detail(clientRecordId, paymentId),
    queryFn: () => advancePaymentsApi.getById(clientRecordId, paymentId),
  })

  const [pendingVatConfirm, setPendingVatConfirm] = useState(false)

  const paymentMutations = useAdvancePaymentMutations({
    clientRecordId,
    onUpdateSuccess: (updatedPayment) => {
      toast.success('מקדמה עודכנה בהצלחה')
      queryClient.setQueryData(advancedPaymentsQK.detail(clientRecordId, updatedPayment.id), updatedPayment)
    },
    onRefreshTurnoverSuccess: (updatedPayment) => {
      setPendingVatConfirm(false)
      toast.success(ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.success)
      queryClient.setQueryData(advancedPaymentsQK.detail(clientRecordId, updatedPayment.id), updatedPayment)
    },
    onRefreshTurnoverNotFiled: () => setPendingVatConfirm(true),
    onDeleteSuccess: (deletedPaymentId) => {
      toast.success('מקדמה נמחקה בהצלחה')
      queryClient.removeQueries({ queryKey: advancedPaymentsQK.detail(clientRecordId, deletedPaymentId) })
      navigate(backPath, { replace: true })
    },
  })

  const title = payment
    ? ADVANCED_PAYMENTS_MESSAGES.detail.title(getAdvancePaymentMonthLabel(payment.period, payment.period_months_count))
    : ADVANCED_PAYMENTS_MESSAGES.detail.fallbackTitle
  const description = [
    clientName,
    officeClientNumber != null ? ADVANCED_PAYMENTS_MESSAGES.detail.clientNumberPrefix(officeClientNumber) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    status: {
      isLoading: isPending,
      error: error ? getErrorMessage(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.detailLoad) : null,
    },
    headerProps: {
      title,
      description: description || undefined,
      breadcrumbs: [...leadingBreadcrumbs, { label: title }] satisfies Breadcrumb[],
    },
    permissions: {
      canEdit: isAdvisor,
    },
    payment: payment ?? null,
    actions: {
      isUpdating: paymentMutations.isUpdating,
      isDeleting: paymentMutations.isDeleting,
      onSave: async (payload: UpdateAdvancePaymentPayload) => {
        await paymentMutations.updatePayment({ id: paymentId, payload })
      },
      onDelete: isAdvisor ? async () => void (await paymentMutations.deletePayment(paymentId)) : undefined,
    },
    turnoverRefresh: {
      isRefreshing: paymentMutations.isRefreshingTurnover,
      // mutateAsync rejects on the 409 the confirm dialog handles; the mutation's
      // onError owns every outcome, so the rejection is deliberately swallowed.
      // The refreshed payment is returned so the edit form can sync its turnover
      // field — otherwise a later save would send the stale pre-snapshot value.
      onRefresh: async () =>
        await paymentMutations.refreshTurnover({ id: paymentId, confirmPending: false }).catch(() => undefined),
      isConfirmingPending: pendingVatConfirm,
      onConfirmPending: async () =>
        await paymentMutations.refreshTurnover({ id: paymentId, confirmPending: true }).catch(() => undefined),
      onCancelPending: () => setPendingVatConfirm(false),
    },
  }
}
