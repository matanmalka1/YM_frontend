import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '@/features/clients'
import { getErrorMessage, isPositiveInt } from '@/utils/utils'
import { BUSINESSES_MESSAGES } from '../messages'

type UseBusinessDetailsParams = {
  clientId: number | null
  businessId: number | null
}

export const useBusinessDetails = ({ clientId, businessId }: UseBusinessDetailsParams) => {
  const clientIdValid = isPositiveInt(clientId)
  const businessIdValid = isPositiveInt(businessId)
  const isValidId = clientIdValid && businessIdValid
  const validClientId = clientIdValid ? clientId : null
  const validBusinessId = businessIdValid ? businessId : null

  const {
    data: clientData,
    isLoading: clientLoading,
    error: clientError,
  } = useQuery({
    queryKey: clientsQK.detail(validClientId ?? 0),
    queryFn: () => clientsApi.getById(validClientId ?? 0),
    enabled: isValidId,
  })

  const {
    data: businessData,
    isLoading: businessLoading,
    error: businessError,
  } = useQuery({
    queryKey: clientsQK.businessDetail(validClientId ?? 'none', validBusinessId ?? 'none'),
    queryFn: () => clientsApi.getBusinessById(validClientId ?? 0, validBusinessId ?? 0),
    enabled: isValidId,
  })

  const business = businessData?.client_id === clientId ? businessData : null

  const isLoading = clientLoading || businessLoading
  const error = clientError
    ? getErrorMessage(clientError, BUSINESSES_MESSAGES.details.clientLoadError)
    : businessError
      ? getErrorMessage(businessError, BUSINESSES_MESSAGES.details.businessLoadError)
      : businessData && businessData.client_id !== clientId
        ? BUSINESSES_MESSAGES.details.wrongClientError
        : null

  return {
    client: clientData ?? null,
    business,
    isLoading,
    error,
    isValidId,
  }
}
