import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClientPickerState } from '@/components/shared/client/useClientPickerState'
import { useTaxProfile } from '@/features/taxProfile'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { CreateAdvancePaymentPayload } from '../api/contracts'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useCreateAdvancePayment = () => {
  const queryClient = useQueryClient()
  const [clientRecordId, setClientRecordId] = useState<number | null>(null)

  const picker = useClientPickerState({
    onSelect: (c) => setClientRecordId(c.id),
    onClear: () => setClientRecordId(null),
  })

  const { profile } = useTaxProfile(clientRecordId ?? 0)
  const frequency: 1 | 2 | null =
    profile?.advance_payment_frequency === 'bimonthly' ? 2 : profile?.advance_payment_frequency === 'monthly' ? 1 : null

  const mutation = useMutation({
    mutationFn: (payload: CreateAdvancePaymentPayload) => advancePaymentsApi.create(clientRecordId!, payload),
    onSuccess: () => {
      toast.success('מקדמה נוצרה')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      reset()
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.create),
  })

  const reset = () => {
    setClientRecordId(null)
    picker.resetClientPicker()
  }

  return {
    picker,
    clientRecordId,
    frequency,
    isPending: mutation.isPending,
    reset,
    onCreate: (payload: CreateAdvancePaymentPayload) => mutation.mutateAsync(payload),
  }
}
