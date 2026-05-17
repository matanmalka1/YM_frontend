import type { QueryKey } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'

export const useChargeCreateMutation = (extraInvalidationKeys: readonly QueryKey[] = []) =>
  useMutationWithToast<Awaited<ReturnType<typeof chargesApi.create>>, CreateChargePayload>({
    mutationFn: (payload) => chargesApi.create(payload),
    successMessage: 'חיוב נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת חיוב',
    invalidateKeys: [chargesQK.all, ...extraInvalidationKeys],
  })
