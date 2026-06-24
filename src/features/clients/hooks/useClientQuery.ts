import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientRecordResponse } from '../api'
import { getErrorMessage, isPositiveInt } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

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

  const { data, isPending, error } = useQuery({
    queryKey: clientsQK.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: isValidId,
  })

  return {
    client: data ?? null,
    isValidId,
    isLoading: isPending && isValidId,
    error: error ? getErrorMessage(error, CLIENTS_ERROR_MESSAGES.client.detailLoad) : null,
    can,
  }
}
