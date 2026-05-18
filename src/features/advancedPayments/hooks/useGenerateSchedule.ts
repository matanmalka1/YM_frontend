import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClientPickerState } from '@/components/shared/client/useClientPickerState'
import { useTaxProfile } from '@/features/taxProfile'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'

export const useGenerateSchedule = (year: number) => {
  const queryClient = useQueryClient()
  const picker = useClientPickerState()
  const clientId = picker.selectedClient?.id ?? 0

  const { profile, isLoading: isProfileLoading, error: profileError } = useTaxProfile(clientId)
  const isProfileError = profileError !== null && clientId > 0

  const frequency: 1 | 2 | null =
    clientId === 0
      ? null
      : profile?.advance_payment_frequency === 'bimonthly'
        ? 2
        : profile?.advance_payment_frequency === 'monthly'
          ? 1
          : null

  const mutation = useMutation({
    mutationFn: (periodMonthsCount: 1 | 2) => advancePaymentsApi.generateSchedule(clientId, year, periodMonthsCount),
    onSuccess: (data) => {
      toast.success(data.created > 0 ? `נוצרו ${data.created} מקדמות, דולגו ${data.skipped}` : 'לא נוצרו מקדמות חדשות')
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת לוח מקדמות'),
  })

  const handleGenerate = () => {
    if (clientId === 0) {
      toast.error('לא נבחר לקוח תקין')
      return
    }
    if (isProfileLoading) {
      toast.error('פרופיל הלקוח עדיין נטען')
      return
    }
    if (isProfileError) {
      toast.error('שגיאה בטעינת פרופיל הלקוח')
      return
    }
    if (frequency == null) {
      toast.error('לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח')
      return
    }
    mutation.mutate(frequency)
  }

  return {
    picker,
    clientId,
    isProfileLoading,
    isProfileError,
    frequency,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    handleGenerate,
  }
}
