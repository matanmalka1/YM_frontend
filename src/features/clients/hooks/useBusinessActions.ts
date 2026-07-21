import { clientsApi, clientsQK } from '../api'
import type { UpdateBusinessPayload } from '../api'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

export const useBusinessActions = (clientId: number) => {
  const invalidateKeys = [clientsQK.businessesAll(clientId), clientsQK.businesses(clientId)]

  const updateMutation = useMutationWithToast({
    mutationFn: ({ businessId, payload }: { businessId: number; payload: UpdateBusinessPayload }) =>
      clientsApi.updateBusiness(clientId, businessId, payload),
    successMessage: 'העסק עודכן בהצלחה',
    errorMessage: CLIENTS_ERROR_MESSAGES.business.update,
    invalidateKeys,
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: (businessId: number) => clientsApi.deleteBusiness(clientId, businessId),
    successMessage: 'העסק נמחק בהצלחה',
    errorMessage: CLIENTS_ERROR_MESSAGES.business.delete,
    invalidateKeys,
  })

  return {
    updateBusiness: (businessId: number, payload: UpdateBusinessPayload) => updateMutation.mutateAsync({ businessId, payload }),
    isUpdating: updateMutation.isPending,
    deleteBusiness: (businessId: number) => deleteMutation.mutate(businessId),
    isDeleting: deleteMutation.isPending,
  }
}
