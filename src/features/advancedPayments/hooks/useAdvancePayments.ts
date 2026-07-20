import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentStatus, CreateAdvancePaymentPayload } from '../api/contracts'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'
import { useAdvancePaymentMutations } from './useAdvancePaymentMutations'

export const useAdvancePayments = (
  clientRecordId: number,
  year: number,
  statusFilter?: AdvancePaymentStatus[],
  page = 1,
) => {
  const queryClient = useQueryClient()
  const qk = advancedPaymentsQK.clientYear(clientRecordId, year)
  const enabled = clientRecordId > 0
  const listParams = {
    client_record_id: clientRecordId,
    year,
    page,
    page_size: PAGE_SIZE_SM,
    ...(statusFilter?.length ? { status: statusFilter } : {}),
  }

  const {
    data: listData,
    error: listError,
    isPending: listPending,
  } = useQuery({
    enabled,
    queryKey: advancedPaymentsQK.list(listParams),
    queryFn: () => advancePaymentsApi.list(listParams),
    retry: false,
  })

  const paymentMutations = useAdvancePaymentMutations({ clientRecordId })

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdvancePaymentPayload) => advancePaymentsApi.create(clientRecordId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk })
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.create),
  })

  const rows = enabled ? (listData?.items ?? []) : []
  const totalExpected = rows.reduce((sum, row) => sum + Number(row.expected_amount ?? 0), 0)
  const totalPaid = rows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0)

  return {
    rows,
    isLoading: enabled && listPending,
    error:
      enabled && listError
        ? getErrorMessage(listError, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.listLoad)
        : null,
    totalExpected,
    totalPaid,
    total: listData?.total ?? 0,
    isUpdating: paymentMutations.isUpdating,
    updatingId: paymentMutations.updatingId,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteRow: paymentMutations.deletePayment,
    isDeletingId: paymentMutations.deletingId,
  }
}
