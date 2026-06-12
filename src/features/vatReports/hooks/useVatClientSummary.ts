import { useQuery } from '@tanstack/react-query'
import { vatReportsApi, type CreateVatWorkItemPayload } from '../api'
import { vatReportsQK } from '../api/queryKeys'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useVatClientSummary = (
  clientId: number,
  yearParams?: { period_year_after?: number; period_year_before?: number },
) => {
  const summaryQuery = useQuery({
    queryKey: vatReportsQK.clientSummary(clientId, yearParams),
    queryFn: () => vatReportsApi.getClientSummary(clientId, yearParams),
    staleTime: QUERY_STALE_TIME.default,
  })

  const createMutation = useMutationWithToast<
    Awaited<ReturnType<typeof vatReportsApi.create>>,
    CreateVatWorkItemPayload
  >({
    mutationFn: (payload) => vatReportsApi.create(payload),
    successMessage: 'תיק מע"מ נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת תיק מע"מ',
    invalidateKeys: [vatReportsQK.clientSummary(clientId, yearParams)],
  })

  return {
    data: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    createMutation,
  }
}
