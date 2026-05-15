import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  signatureRequestsApi,
  signatureRequestsQK,
  type CreateSignatureRequestPayload,
  type CreateSignatureRequestResponse,
} from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'

/**
 * When `clientId` is provided, also invalidates that client's signature requests.
 * Used from both the client detail card and the global pending-requests page.
 */
export const useSignatureRequestActions = (clientId?: number) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: signatureRequestsQK.all })
    if (clientId != null) {
      queryClient.invalidateQueries({
        queryKey: signatureRequestsQK.forClient(clientId),
      })
    }
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateSignatureRequestPayload): Promise<CreateSignatureRequestResponse> =>
      signatureRequestsApi.create(payload),
    onSuccess: () => {
      toast.success('בקשת החתימה נוצרה ונשלחה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת ושליחת בקשת חתימה'),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => signatureRequestsApi.cancel(id, { reason }),
    onSuccess: () => {
      toast.success('בקשת החתימה בוטלה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בביטול בקשת חתימה'),
  })

  return {
    create: (payload: CreateSignatureRequestPayload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,

    cancel: (id: number, reason?: string) => cancelMutation.mutateAsync({ id, reason }),
    isCanceling: cancelMutation.isPending,
  }
}
