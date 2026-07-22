import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '@/features/clients/api'
import { getErrorMessage } from '@/utils/utils'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useAdvancePaymentClientConfig = (clientId: number) => {
  const query = useQuery({
    enabled: clientId > 0,
    queryKey: clientsQK.detail(clientId),
    queryFn: () => clientsApi.getById(clientId),
    retry: false,
  })

  return {
    config: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? getErrorMessage(query.error, ADVANCED_PAYMENTS_ERROR_MESSAGES.clientConfig.load) : null,
  }
}
