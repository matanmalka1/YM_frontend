import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientRecordResponse, type UpdateClientPayload } from '@/features/clients'
import { toast } from '../../../utils/toast'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { TAX_PROFILE_MESSAGES } from '../messages'
import { TAX_PROFILE_ERROR_MESSAGES } from '../errorMessages'

export const useTaxProfile = (clientId: number) => {
  const queryClient = useQueryClient()
  const qk = clientsQK.detail(clientId)

  const {
    data: profileData,
    isPending: profilePending,
    error: profileError,
  } = useQuery({
    enabled: clientId > 0,
    queryKey: qk,
    queryFn: () => clientsApi.getById(clientId),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientPayload) => clientsApi.update(clientId, data),
    onSuccess: (updated) => {
      toast.success(TAX_PROFILE_MESSAGES.success.updated)
      queryClient.setQueryData(qk, updated)
    },
    onError: (err) => {
      showErrorToast(err, TAX_PROFILE_ERROR_MESSAGES.update)
    },
  })

  return {
    profile: (profileData ?? null) as ClientRecordResponse | null,
    isLoading: profilePending,
    error: profileError ? getErrorMessage(profileError, TAX_PROFILE_ERROR_MESSAGES.load) : null,
    updateProfile: (data: UpdateClientPayload) => updateMutation.mutate(data),
    isUpdating: updateMutation.isPending,
  }
}
