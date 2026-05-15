import { useQuery } from '@tanstack/react-query'
import { signatureRequestsApi, signatureRequestsQK } from '../api'
import type { SignatureRequestResponse } from '../api'
import { getErrorMessage } from '../../../utils/utils'

type Params = { page?: number; pageSize?: number }

type Result = {
  items: SignatureRequestResponse[]
  total: number
  businessLookup: Record<number, { name: string; clientId: number | null }>
  isLoading: boolean
  error: string | null
}

export const usePendingSignatureRequests = ({ page = 1, pageSize = 50 }: Params = {}): Result => {
  const listQuery = useQuery({
    queryKey: signatureRequestsQK.pending({ page, page_size: pageSize }),
    queryFn: () => signatureRequestsApi.listPending({ page, page_size: pageSize }),
  })

  const items = listQuery.data?.items ?? []
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
    total: listQuery.data?.total ?? 0,
    businessLookup,
    isLoading: listQuery.isLoading,
    error: listQuery.error ? getErrorMessage(listQuery.error, 'שגיאה בטעינת בקשות חתימה') : null,
  }
}
