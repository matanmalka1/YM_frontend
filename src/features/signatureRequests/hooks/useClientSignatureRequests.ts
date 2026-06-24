import { useQuery } from '@tanstack/react-query'
import { signatureRequestsApi, signatureRequestsQK } from '../api'
import type { SignatureRequestResponse } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { SIGNATURE_REQUESTS_ERROR_MESSAGES } from '../errorMessages'

type Params = { clientId: number | null; page?: number; pageSize?: number }

type Result = {
  items: SignatureRequestResponse[]
  total: number
  isLoading: boolean
  error: string | null
}

export const useClientSignatureRequests = ({ clientId, page = 1, pageSize = 10 }: Params): Result => {
  const enabled = clientId != null && clientId > 0

  const { data, isLoading, error } = useQuery({
    queryKey: signatureRequestsQK.forClientPage(clientId ?? 0, { page, page_size: pageSize }),
    queryFn: () => signatureRequestsApi.listForClient(clientId!, { page, page_size: pageSize }),
    enabled,
  })

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? getErrorMessage(error, SIGNATURE_REQUESTS_ERROR_MESSAGES.list.load) : null,
  }
}
