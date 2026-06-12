import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'
import type { CreateBusinessPayload } from '../api'
import { chargesApi, chargesQK, useChargeCreateMutation } from '@/features/charges'
import type { CreateChargePayload } from '@/features/charges'
import { bindersApi, bindersQK } from '@/features/binders'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'

const RELATED_PAGE_SIZE = 5

export const useClientDetailsActions = (clientId: number, activeTab: string, shouldLoadRelatedData: boolean) => {
  const queryClient = useQueryClient()
  const shouldFetchRelatedData = activeTab === 'details' && shouldLoadRelatedData

  const relatedBindersQuery = useQuery({
    queryKey: bindersQK.forClientPage(clientId, 1, RELATED_PAGE_SIZE),
    queryFn: () => bindersApi.listClientBinders(clientId, { page: 1, page_size: RELATED_PAGE_SIZE }),
    enabled: shouldFetchRelatedData,
  })

  const relatedChargesQuery = useQuery({
    queryKey: chargesQK.forClientPage(clientId, 1, RELATED_PAGE_SIZE),
    queryFn: () => chargesApi.list({ client_record_id: clientId, page: 1, page_size: RELATED_PAGE_SIZE }),
    enabled: shouldFetchRelatedData,
  })

  const createBusinessMutation = useMutation({
    mutationFn: (payload: CreateBusinessPayload) => clientsApi.createBusiness(clientId, payload),
    onSuccess: () => {
      toast.success('העסק נוצר בהצלחה')
      void queryClient.invalidateQueries({ queryKey: clientsQK.businessesAll(clientId) })
      void queryClient.invalidateQueries({ queryKey: clientsQK.businesses(clientId) })
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת עסק'),
  })

  const createChargeMutation = useChargeCreateMutation([chargesQK.forClientPage(clientId, 1, RELATED_PAGE_SIZE)])

  const handleCreateBusiness = useCallback(
    async (payload: CreateBusinessPayload): Promise<void> => {
      await createBusinessMutation.mutateAsync(payload)
    },
    [createBusinessMutation],
  )

  const handleCreateCharge = useCallback(
    async (payload: CreateChargePayload): Promise<boolean> => {
      try {
        await createChargeMutation.mutateAsync(payload)
        return true
      } catch {
        return false
      }
    },
    [createChargeMutation],
  )

  return {
    binders: relatedBindersQuery.data?.items ?? [],
    bindersTotal: relatedBindersQuery.data?.total ?? 0,
    charges: relatedChargesQuery.data?.items ?? [],
    chargesTotal: relatedChargesQuery.data?.total ?? 0,
    isFetchingRelatedData: relatedBindersQuery.isFetching || relatedChargesQuery.isFetching,
    handleCreateBusiness,
    isCreatingBusiness: createBusinessMutation.isPending,
    handleCreateCharge,
    isCreatingCharge: createChargeMutation.isPending,
    createChargeError: createChargeMutation.error,
  }
}
