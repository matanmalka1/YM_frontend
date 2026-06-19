import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentStatus, CreateAdvancePaymentPayload } from '../api/contracts'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'

interface UpdatePayload {
  id: number
  paid_amount?: string
  status?: AdvancePaymentStatus
}

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

  const listQuery = useQuery({
    enabled,
    queryKey: advancedPaymentsQK.list(listParams),
    queryFn: () => advancePaymentsApi.list(listParams),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: UpdatePayload) => advancePaymentsApi.update(clientRecordId, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk })
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון מקדמה'),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdvancePaymentPayload) => advancePaymentsApi.create(clientRecordId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk })
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת מקדמה'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => advancePaymentsApi.delete(clientRecordId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk })
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת מקדמה'),
  })

  const rows = enabled ? (listQuery.data?.items ?? []) : []
  const totalExpected = rows.reduce((sum, row) => sum + Number(row.expected_amount ?? 0), 0)
  const totalPaid = rows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0)

  const updatingId = updateMutation.isPending ? (updateMutation.variables?.id ?? null) : null

  return {
    rows,
    isLoading: enabled && listQuery.isPending,
    error: enabled && listQuery.error ? getErrorMessage(listQuery.error, 'שגיאה בטעינת מקדמות') : null,
    totalExpected,
    totalPaid,
    total: listQuery.data?.total ?? 0,
    updateRow: (id: number, paid_amount: string | null, status?: AdvancePaymentStatus) =>
      updateMutation.mutateAsync({ id, paid_amount: paid_amount ?? '0', status }),
    isUpdating: updateMutation.isPending,
    updatingId,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteRow: (id: number) => deleteMutation.mutateAsync(id),
    isDeletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
