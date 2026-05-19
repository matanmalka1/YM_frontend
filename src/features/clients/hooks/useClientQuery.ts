import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientRecordResponse } from '../api'
import { getErrorMessage, isPositiveInt } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'

type UseClientQueryParams = { clientId: number | null }

type UseClientQueryResult = {
  client: ClientRecordResponse | null
  isValidId: boolean
  isLoading: boolean
  error: string | null
  can: ReturnType<typeof useRole>['can']
}

export const useClientQuery = ({ clientId }: UseClientQueryParams): UseClientQueryResult => {
  const id = Number(clientId)
  const isValidId = isPositiveInt(id)
  const { can } = useRole()

  const clientQuery = useQuery({
    queryKey: clientsQK.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: isValidId,
  })

  return {
    client: clientQuery.data ?? null,
    isValidId,
    isLoading: clientQuery.isPending && isValidId,
    error: clientQuery.error ? getErrorMessage(clientQuery.error, 'שגיאה בטעינת פרטי לקוח') : null,
    can,
  }
}
