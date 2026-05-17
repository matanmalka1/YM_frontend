import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'

export const useChargeCreateMutation = () =>
  useMutationWithToast<Awaited<ReturnType<typeof chargesApi.create>>, CreateChargePayload>({
    mutationFn: (payload) => chargesApi.create(payload),
    successMessage: 'חיוב נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת חיוב',
    invalidateKeys: [chargesQK.all],
  })
