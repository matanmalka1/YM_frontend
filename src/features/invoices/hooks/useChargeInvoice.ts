import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { invoicesApi, type InvoiceAttachRequest } from '../api'
import { invoicesQK } from '../api/queryKeys'
import { toast } from '@/utils/toast'
import { getErrorMessage, getHttpStatus, showErrorToast } from '@/utils/utils'

export const useChargeInvoice = (chargeId: number | null | undefined) => {
  const queryClient = useQueryClient()
  const hasChargeId = typeof chargeId === 'number' && Number.isInteger(chargeId) && chargeId > 0

  const invoiceQuery = useQuery({
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
      toast.success('החשבונית צורפה לחיוב')
    },
    onError: (err) => showErrorToast(err, 'שגיאה בצירוף חשבונית'),
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
    invoice: invoiceQuery.data ?? null,
    invoiceError: invoiceQuery.error ? getErrorMessage(invoiceQuery.error, 'שגיאה בטעינת פרטי חשבונית') : null,
    isAttaching: attachMutation.isPending,
    isLoadingInvoice: invoiceQuery.isLoading,
  }
}
