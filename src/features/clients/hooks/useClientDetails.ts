import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clientsApi, clientsQK, type UpdateClientPayload, type ClientRecordResponse } from '../api'
import { getErrorMessage, isPositiveInt, showErrorToast } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'

type UseClientDetailsParams = { clientId: number | null; taxYear?: number }

type UseClientDetailsResult = {
  client: ClientRecordResponse | null
  isValidId: boolean
  isLoading: boolean
  error: string | null
  updateClient: (payload: UpdateClientPayload) => Promise<void>
  isUpdating: boolean
  deleteClient: () => Promise<void>
  isDeleting: boolean
  can: ReturnType<typeof useRole>['can']
}

export const useClientDetails = ({ clientId, taxYear }: UseClientDetailsParams): UseClientDetailsResult => {
  const id = Number(clientId)
  const isValidId = isPositiveInt(id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { can } = useRole()

  const clientQuery = useQuery({
    queryKey: clientsQK.detail(id, taxYear),
    queryFn: () => clientsApi.getById(id, taxYear),
    enabled: isValidId,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(id, payload),
    onSuccess: async (updated) => {
      toast.success('פרטי הלקוח עודכנו')
      queryClient.setQueryData(clientsQK.detail(id, taxYear), updated)
      await queryClient.invalidateQueries({ queryKey: clientsQK.all })
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון פרטי לקוח'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.delete(id),
    onSuccess: async () => {
      toast.success('הלקוח נמחק בהצלחה')
      await queryClient.invalidateQueries({ queryKey: clientsQK.all })
      navigate('/clients')
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת לקוח'),
  })

  return {
    client: clientQuery.data ?? null,
    isValidId,
    isLoading: clientQuery.isLoading,
    error: clientQuery.error ? getErrorMessage(clientQuery.error, 'שגיאה בטעינת פרטי לקוח') : null,
    updateClient: async (payload) => {
      await updateMutation.mutateAsync(payload)
    },
    isUpdating: updateMutation.isPending,
    deleteClient: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
    can,
  }
}
