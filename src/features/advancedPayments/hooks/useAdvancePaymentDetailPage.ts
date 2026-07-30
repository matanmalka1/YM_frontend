import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Breadcrumb } from '@/components/layout/PageHeader'
import { isObligationLocked } from '@/constants/obligationStatus.constants'
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

  const year = payment ? Number(payment.period.slice(0, 4)) : 0
  const {
    data: annualKpis,
    isPending: isAnnualKpisPending,
    error: annualKpisError,
    refetch: refetchAnnualKpis,
  } = useQuery({
    queryKey: advancedPaymentsQK.kpi(clientRecordId, year),
    queryFn: () => advancePaymentsApi.getAnnualKPIs(clientRecordId, year),
    enabled: year > 0,
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
    // The withdrawn correction no longer exists, so this page cannot stay on it:
    // the restored original is where the period now lives.
    onWithdrawSuccess: (original) => {
      queryClient.removeQueries({ queryKey: advancedPaymentsQK.detail(clientRecordId, paymentId) })
      navigate(`${backPath}/${original.id}`, { replace: true })
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
      // D-13: a submitted advance is locked — nothing on it changes
      canEdit: isAdvisor && !(payment && isObligationLocked(payment.status)),
    },
    payment: payment ?? null,
    annualContext: {
      year,
      data: annualKpis ?? null,
      isLoading: isAnnualKpisPending,
      error: annualKpisError
        ? getErrorMessage(annualKpisError, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.annualKpiLoad)
        : null,
      onRetry: () => void refetchAnnualKpis(),
    },
    actions: {
      isUpdating: paymentMutations.isUpdating,
      isDeleting: paymentMutations.isDeleting,
      isWithdrawing: paymentMutations.isWithdrawing,
      onSave: async (payload: UpdateAdvancePaymentPayload) => {
        await paymentMutations.updatePayment({ id: paymentId, payload })
      },
      // An amendment is excluded whatever its status: deleting it would leave the
      // payment it corrects stamped as superseded, so the period would show no
      // row at all. The backend rejects it with 409 — the button is hidden to match.
      onDelete:
        isAdvisor && !(payment && isObligationLocked(payment.status)) && payment?.amends_id == null
          ? async (reason: string) => void (await paymentMutations.deletePayment({ paymentId, reason }))
          : undefined,
      // The correction's counterpart to delete, and offered on exactly the rows
      // delete is not: an open amendment.
      onWithdraw:
        isAdvisor && payment != null && !isObligationLocked(payment.status) && payment.amends_id != null
          ? async () => void (await paymentMutations.withdrawAmendment(paymentId))
          : undefined,
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
