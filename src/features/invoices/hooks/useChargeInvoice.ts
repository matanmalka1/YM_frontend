import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { invoicesApi, type InvoiceAttachRequest } from '../api'
import { invoicesQK } from '../api/queryKeys'
import { toast } from '@/utils/toast'
import { getErrorMessage, getHttpStatus, showErrorToast } from '@/utils/utils'
import { INVOICES_MESSAGES } from '../messages'
import { INVOICES_ERROR_MESSAGES } from '../errorMessages'

export const useChargeInvoice = (chargeId: number | null | undefined) => {
  const queryClient = useQueryClient()
  const hasChargeId = typeof chargeId === 'number' && Number.isInteger(chargeId) && chargeId > 0

  const {
    data: invoiceData,
    error: invoiceError,
    isLoading: invoiceLoading,
  } = useQuery({
    enabled: hasChargeId,
    queryKey: invoicesQK.byChargeId(chargeId ?? 0),
    queryFn: async () => {
      try {
        return await invoicesApi.getByChargeId(chargeId as number)
      } catch (err) {
        if (getHttpStatus(err) === 404) return null
        throw err
      }
    },
    staleTime: QUERY_STALE_TIME.default,
  })

  const attachMutation = useMutation({
    mutationFn: (payload: InvoiceAttachRequest) => invoicesApi.attach(payload),
    onSuccess: (invoice) => {
      queryClient.setQueryData(invoicesQK.byChargeId(invoice.charge_id), invoice)
      toast.success(INVOICES_MESSAGES.mutations.attached)
    },
    onError: (err) => showErrorToast(err, INVOICES_ERROR_MESSAGES.mutations.attachError),
  })

  const attachInvoice = async (payload: InvoiceAttachRequest): Promise<boolean> => {
    try {
      await attachMutation.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  return {
    attachInvoice,
    invoice: invoiceData ?? null,
    invoiceError: invoiceError ? getErrorMessage(invoiceError, INVOICES_ERROR_MESSAGES.mutations.loadError) : null,
    isAttaching: attachMutation.isPending,
    isLoadingInvoice: invoiceLoading,
  }
}
