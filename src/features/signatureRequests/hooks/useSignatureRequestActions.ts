import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  signatureRequestsApi,
  signatureRequestsQK,
  type CreateSignatureRequestPayload,
  type CreateSignatureRequestResponse,
} from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { SIGNATURE_REQUESTS_ERROR_MESSAGES } from '../errorMessages'

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
    onError: (err) => showErrorToast(err, SIGNATURE_REQUESTS_ERROR_MESSAGES.create.request),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ clientRecordId, id, reason }: { clientRecordId: number; id: number; reason?: string }) =>
      signatureRequestsApi.cancel(clientRecordId, id, { reason }),
    onSuccess: () => {
      toast.success('בקשת החתימה בוטלה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, SIGNATURE_REQUESTS_ERROR_MESSAGES.cancel.request),
  })

  return {
    create: (payload: CreateSignatureRequestPayload) => createMutation.mutateAsync(payload),
    isCreating: createMutation.isPending,

    cancel: (clientRecordId: number, id: number, reason?: string) =>
      cancelMutation.mutateAsync({ clientRecordId, id, reason }),
    isCanceling: cancelMutation.isPending,
  }
}
