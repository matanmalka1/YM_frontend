import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clientsApi, clientsQK, type UpdateClientPayload } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

type UseClientMutationsResult = {
  updateClient: (payload: UpdateClientPayload) => Promise<void>
  isUpdating: boolean
  deleteClient: () => Promise<void>
  isDeleting: boolean
}

export const useClientMutations = (clientId: number): UseClientMutationsResult => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(clientId, payload),
    onSuccess: async (updated) => {
      toast.success('פרטי הלקוח עודכנו')
      queryClient.setQueryData(clientsQK.detail(clientId), updated)
      await queryClient.invalidateQueries({ queryKey: clientsQK.lists() })
    },
    onError: (err) => showErrorToast(err, CLIENTS_ERROR_MESSAGES.client.detailsUpdate),
  })

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.delete(clientId),
    onSuccess: async () => {
      toast.success('הלקוח נמחק בהצלחה')
      queryClient.removeQueries({ queryKey: clientsQK.detail(clientId) })
      await queryClient.invalidateQueries({ queryKey: clientsQK.lists() })
      navigate('/clients')
    },
    onError: (err) => showErrorToast(err, CLIENTS_ERROR_MESSAGES.client.delete),
  })

  return {
    updateClient: async (payload) => {
      await updateMutation.mutateAsync(payload)
    },
    isUpdating: updateMutation.isPending,
    deleteClient: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
  }
}
