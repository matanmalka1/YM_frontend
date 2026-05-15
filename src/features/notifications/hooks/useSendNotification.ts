import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, notificationsQK } from '../api'
import { toast } from '../../../utils/toast'
import { getErrorMessage } from '../../../utils/utils'
import type { ManualSendPayload } from '../api'

export const useSendNotification = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: ManualSendPayload) => notificationsApi.send(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQK.all })
      toast.success('ההודעה נשלחה בהצלחה')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'שגיאה בשליחת ההודעה')),
  })

  return {
    send: mutation.mutate,
    isSending: mutation.isPending,
  }
}
