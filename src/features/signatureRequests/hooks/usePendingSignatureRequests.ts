import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { signatureRequestsApi, signatureRequestsQK } from '../api'
import type { SignatureRequestResponse } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { SIGNATURE_REQUESTS_ERROR_MESSAGES } from '../errorMessages'

type Params = { page?: number; pageSize?: number }

type Result = {
  items: SignatureRequestResponse[]
  total: number
  businessLookup: Record<number, { name: string; clientId: number | null }>
  isLoading: boolean
  error: string | null
}

export const usePendingSignatureRequests = ({ page = 1, pageSize = 50 }: Params = {}): Result => {
  const { data, isLoading, error } = useQuery({
    queryKey: signatureRequestsQK.pending({ page, page_size: pageSize }),
    queryFn: () => signatureRequestsApi.listPending({ page, page_size: pageSize }),
    staleTime: QUERY_STALE_TIME.short,
  })

  const items = data?.items ?? []
  const businessLookup = Object.fromEntries(
    items
      .filter((request) => request.business_id != null)
      .map((request) => [
        request.business_id,
        {
          name: request.business_name ?? `עסק #${request.business_id}`,
          clientId: request.client_record_id,
        },
      ]),
  ) as Record<number, { name: string; clientId: number }>

  return {
    items,
    total: data?.total ?? 0,
    businessLookup,
    isLoading,
    error: error ? getErrorMessage(error, SIGNATURE_REQUESTS_ERROR_MESSAGES.list.load) : null,
  }
}
