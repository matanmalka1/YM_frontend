import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  signatureRequestsApi,
  signatureRequestsQK,
  type CreateAndSendSignatureRequestPayload,
  type SendSignatureRequestResponse,
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

  const createAndSendMutation = useMutation({
    mutationFn: (payload: CreateAndSendSignatureRequestPayload): Promise<SendSignatureRequestResponse> =>
      signatureRequestsApi.createAndSend(payload),
    onSuccess: () => {
      toast.success('בקשת החתימה נוצרה ונשלחה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת ושליחת בקשת חתימה'),
  })

  const sendMutation = useMutation({
    mutationFn: ({ id, expiryDays }: { id: number; expiryDays?: number }): Promise<SendSignatureRequestResponse> =>
      signatureRequestsApi.send(id, { expiry_days: expiryDays }),
    onSuccess: () => {
      toast.success('בקשת החתימה נשלחה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בשליחת בקשת חתימה'),
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
    createAndSend: (payload: CreateAndSendSignatureRequestPayload) => createAndSendMutation.mutateAsync(payload),
    isCreatingAndSending: createAndSendMutation.isPending,

    send: (id: number, expiryDays?: number) => sendMutation.mutateAsync({ id, expiryDays }),
    isSending: sendMutation.isPending,
    lastSendResult: sendMutation.data,

    cancel: (id: number, reason?: string) => cancelMutation.mutateAsync({ id, reason }),
    isCanceling: cancelMutation.isPending,
  }
}
