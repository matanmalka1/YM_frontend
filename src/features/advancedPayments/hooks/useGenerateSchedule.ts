import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClientPickerState } from '@/components/shared/client/useClientPickerState'
import { useTaxProfile } from '@/features/taxProfile'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useGenerateSchedule = (year: number) => {
  const queryClient = useQueryClient()
  const picker = useClientPickerState()
  const clientRecordId = picker.selectedClient?.id ?? 0

  const { profile, isLoading: isProfileLoading, error: profileError } = useTaxProfile(clientRecordId)
  const isProfileError = profileError !== null && clientRecordId > 0

  const frequency: 1 | 2 | null =
    clientRecordId === 0
      ? null
      : profile?.advance_payment_frequency === 'bimonthly'
        ? 2
        : profile?.advance_payment_frequency === 'monthly'
          ? 1
          : null

  const mutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) =>
      advancePaymentsApi.generateSchedule(clientRecordId, year, periodMonthsCount),
    onSuccess: (data) => {
      toast.success(data.created > 0 ? `נוצרו ${data.created} מקדמות, דולגו ${data.skipped}` : 'לא נוצרו מקדמות חדשות')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.create),
  })

  const handleGenerate = () => {
    if (clientRecordId === 0) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.missingClient)
      return
    }
    if (isProfileLoading) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.profileLoading)
      return
    }
    if (isProfileError) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.profileLoad)
      return
    }
    if (frequency == null) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.missingFrequency)
      return
    }
    mutation.mutate(frequency)
  }

  return {
    picker,
    clientRecordId,
    isProfileLoading,
    isProfileError,
    frequency,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    handleGenerate,
  }
}
