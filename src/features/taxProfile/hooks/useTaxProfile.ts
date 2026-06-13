import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientRecordResponse, type UpdateClientPayload } from '@/features/clients'
import { toast } from '../../../utils/toast'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'

export const useTaxProfile = (clientId: number) => {
  const queryClient = useQueryClient()
  const qk = clientsQK.detail(clientId)

  const profileQuery = useQuery({
    enabled: clientId > 0,
    queryKey: qk,
    queryFn: () => clientsApi.getById(clientId),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientPayload) => clientsApi.update(clientId, data),
    onSuccess: (updated) => {
      toast.success('פרטי מס עודכנו בהצלחה')
      queryClient.setQueryData(qk, updated)
    },
    onError: (err) => {
      showErrorToast(err, 'שגיאה בעדכון פרטי מס')
    },
  })

  return {
    profile: (profileQuery.data ?? null) as ClientRecordResponse | null,
    isLoading: profileQuery.isPending,
    error: profileQuery.error ? getErrorMessage(profileQuery.error, 'שגיאה בטעינת פרטי מס') : null,
    updateProfile: (data: UpdateClientPayload) => updateMutation.mutate(data),
    isUpdating: updateMutation.isPending,
  }
}
