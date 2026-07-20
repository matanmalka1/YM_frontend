import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { chargesApi, chargesQK, type CreateChargePayload } from '../api'
import { CHARGES_MESSAGES } from '../messages'
import { CHARGES_ERROR_MESSAGES } from '../errorMessages'
import { addCreatedChargeToLists } from '../utils/chargeCache'

export const useChargeCreateMutation = (extraInvalidationKeys: readonly QueryKey[] = []) => {
  const queryClient = useQueryClient()

  return useMutationWithToast<Awaited<ReturnType<typeof chargesApi.create>>, CreateChargePayload>({
    mutationFn: (payload) => chargesApi.create(payload),
    successMessage: CHARGES_MESSAGES.feedback.created,
    errorMessage: CHARGES_ERROR_MESSAGES.mutations.create,
    invalidateKeys: [chargesQK.all, ...extraInvalidationKeys],
    onSuccess: (charge) => addCreatedChargeToLists(queryClient, charge),
  })
}
