import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'
import type { CreateBusinessPayload } from '../api'
import { chargesApi, chargesQK, useChargeCreateMutation } from '@/features/charges'
import type { CreateChargePayload } from '@/features/charges'
import { bindersApi, bindersQK } from '@/features/binders'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'

const RELATED_PAGE_SIZE = 5

export const useClientDetailsActions = (clientId: number, activeTab: string, shouldLoadRelatedData: boolean) => {
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

  const createBusinessMutation = useMutationWithToast({
    mutationFn: (payload: CreateBusinessPayload) => clientsApi.createBusiness(clientId, payload),
    successMessage: 'העסק נוצר בהצלחה',
    errorMessage: 'שגיאה ביצירת עסק',
    invalidateKeys: [clientsQK.businessesAll(clientId), clientsQK.businesses(clientId)],
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
