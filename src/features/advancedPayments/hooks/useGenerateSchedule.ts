import { useQueryClient } from '@tanstack/react-query'
import { useClientPickerState } from '@/features/clients/public'
import { useAdvancePaymentClientConfig } from './useAdvancePaymentClientConfig'
import { useScheduleGeneration } from './useScheduleGeneration'
import { advancedPaymentsQK } from '../api'
import { toast } from '@/utils/toast'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useGenerateSchedule = (year: number, onGenerated: () => void) => {
  const queryClient = useQueryClient()
  const picker = useClientPickerState()
  const clientRecordId = picker.selectedClient?.id ?? 0

  const { config: profile, isLoading: isProfileLoading, error: profileError } = useAdvancePaymentClientConfig(clientRecordId)
  const isProfileError = profileError !== null && clientRecordId > 0

  const frequency: 1 | 2 | null =
    clientRecordId === 0
      ? null
      : profile?.advance_payment_frequency === 'bimonthly'
        ? 2
        : profile?.advance_payment_frequency === 'monthly'
          ? 1
          : null

  const generation = useScheduleGeneration({
    year,
    onGenerated: () => {
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      // The picker belongs to this hook, so clearing it belongs here too —
      // callers should not have to remember to undo our state.
      picker.resetClientPicker()
      onGenerated()
    },
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
    generation.generate(clientRecordId, frequency)
  }

  const handleConfirmCleanup = () => {
    if (frequency == null) return
    generation.confirmCleanup(frequency)
  }

  return {
    picker,
    clientRecordId,
    isProfileLoading,
    isProfileError,
    frequency,
    isPending: generation.isPending,
    staleCadence: generation.staleCadence,
    handleGenerate,
    handleConfirmCleanup,
    dismissStaleCadence: generation.dismissStaleCadence,
    reset: generation.reset,
  }
}
