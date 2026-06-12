import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taxProfileApi, taxProfileQK, type TaxProfileUpdatePayload } from '../api'
import { toast } from '../../../utils/toast'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'

export const useTaxProfile = (clientId: number) => {
  const queryClient = useQueryClient()
  const qk = taxProfileQK.forClient(clientId)

  const profileQuery = useQuery({
    enabled: clientId > 0,
    queryKey: qk,
    queryFn: () => taxProfileApi.get(clientId),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: (data: TaxProfileUpdatePayload) => taxProfileApi.update(clientId, data),
    onSuccess: (updated) => {
      toast.success('פרטי מס עודכנו בהצלחה')
      queryClient.setQueryData(qk, updated)
    },
    onError: (err) => {
      showErrorToast(err, 'שגיאה בעדכון פרטי מס')
    },
  })

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isPending,
    error: profileQuery.error ? getErrorMessage(profileQuery.error, 'שגיאה בטעינת פרטי מס') : null,
    updateProfile: (data: TaxProfileUpdatePayload) => updateMutation.mutate(data),
    isUpdating: updateMutation.isPending,
  }
}
