import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vatReportsApi, type CreateVatWorkItemPayload } from '../api'
import { vatReportsQK } from '../api/queryKeys'
import { toast } from '@/utils/toast'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useVatClientSummary = (
  clientId: number,
  yearParams?: { period_year_after?: number; period_year_before?: number },
) => {
  const queryClient = useQueryClient()

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: vatReportsQK.clientSummary(clientId, yearParams),
    queryFn: () => vatReportsApi.getClientSummary(clientId, yearParams),
    staleTime: QUERY_STALE_TIME.default,
  })

  // Raw mutation: caller surfaces the failure inline (createError in the modal),
  // so no error toast here — useMutationWithToast would double up the feedback.
  const createMutation = useMutation({
    mutationFn: (payload: CreateVatWorkItemPayload) => vatReportsApi.create(payload),
    onSuccess: async () => {
      toast.success('תיק מע"מ נוצר בהצלחה')
      await queryClient.invalidateQueries({ queryKey: vatReportsQK.clientSummary(clientId, yearParams) })
    },
  })

  return {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    createMutation,
  }
}
