import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClientPickerState } from '@/components/shared/client/useClientPickerState'
import { useTaxProfile } from '@/features/taxProfile'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { CreateAdvancePaymentPayload } from '../types'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'

export const useCreateAdvancePayment = () => {
  const queryClient = useQueryClient()
  const [clientId, setClientId] = useState<number | null>(null)

  const picker = useClientPickerState({
    onSelect: (c) => setClientId(c.id),
    onClear: () => setClientId(null),
  })

  const { profile } = useTaxProfile(clientId ?? 0)
  const frequency: 1 | 2 | null =
    profile?.advance_payment_frequency === 'bimonthly' ? 2 : profile?.advance_payment_frequency === 'monthly' ? 1 : null

  const mutation = useMutation({
    mutationFn: (payload: CreateAdvancePaymentPayload) => advancePaymentsApi.create(clientId!, payload),
    onSuccess: () => {
      toast.success('מקדמה נוצרה')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      reset()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת מקדמה'),
  })

  const reset = () => {
    setClientId(null)
    picker.resetClientPicker()
  }

  return {
    picker,
    clientId,
    frequency,
    isPending: mutation.isPending,
    reset,
    onCreate: (payload: CreateAdvancePaymentPayload) => mutation.mutateAsync(payload),
  }
}
