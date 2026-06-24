import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'
import { toast } from '../../../utils/toast'
import { getErrorMessage } from '../../../utils/utils'
import type { NotificationPreviewRequest, NotificationResult, NotificationSendVariables } from '../api'
import { NOTIFICATIONS_MESSAGES } from '../messages'
import { NOTIFICATIONS_ERROR_MESSAGES } from '../errorMessages'

export const usePreviewNotification = () => {
  const mutation = useMutation({
    mutationFn: (payload: NotificationPreviewRequest) => notificationsApi.preview(payload),
    onError: (err) => toast.error(getErrorMessage(err, NOTIFICATIONS_ERROR_MESSAGES.form.previewError)),
  })

  return {
    preview: mutation.mutate,
    previewAsync: mutation.mutateAsync,
    isPreviewing: mutation.isPending,
    previewData: mutation.data,
    resetPreview: mutation.reset,
  }
}

export const useSendNotification = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ payload, idempotencyKey }: NotificationSendVariables) =>
      notificationsApi.send(payload, idempotencyKey),
    onSuccess: (result: NotificationResult) => {
      void queryClient.invalidateQueries({ queryKey: notificationsQK.lists() })
      void queryClient.invalidateQueries({ queryKey: notificationsQK.summaries() })
      if (result.status === 'sent') {
        toast.success(NOTIFICATIONS_MESSAGES.form.sendSuccess)
      } else if (result.status === 'skipped') {
        toast.warning(NOTIFICATIONS_ERROR_MESSAGES.form.sendSkippedNoEmail)
      } else if (result.status === 'blocked') {
        toast.error(result.reason ?? NOTIFICATIONS_ERROR_MESSAGES.form.blockedFallback)
      } else {
        toast.error(result.reason ?? NOTIFICATIONS_ERROR_MESSAGES.form.sendError)
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, NOTIFICATIONS_ERROR_MESSAGES.form.sendError)),
  })

  return {
    send: mutation.mutate,
    sendAsync: mutation.mutateAsync,
    isSending: mutation.isPending,
  }
}
