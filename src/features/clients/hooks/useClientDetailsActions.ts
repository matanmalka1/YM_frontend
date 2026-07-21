import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'
import type { CreateBusinessPayload } from '../api'
import { chargesApi, chargesQK } from '@/features/charges'
import { bindersApi, bindersQK } from '@/features/binders'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

const RELATED_COUNT_PAGE_SIZE = 1

export const useClientDetailsActions = (clientId: number, activeTab: string) => {
  const shouldFetchRelatedData = activeTab === 'details'

  const { data: relatedBindersData, isFetching: relatedBindersFetching } = useQuery({
    queryKey: bindersQK.forClientPage(clientId, 1, RELATED_COUNT_PAGE_SIZE),
    queryFn: () => bindersApi.listClientBinders(clientId, { page: 1, page_size: RELATED_COUNT_PAGE_SIZE }),
    enabled: shouldFetchRelatedData,
  })

  const { data: relatedChargesData, isFetching: relatedChargesFetching } = useQuery({
    queryKey: chargesQK.forClientPage(clientId, 1, RELATED_COUNT_PAGE_SIZE),
    queryFn: () => chargesApi.list({ client_record_id: clientId, page: 1, page_size: RELATED_COUNT_PAGE_SIZE }),
    enabled: shouldFetchRelatedData,
  })

  const createBusinessMutation = useMutationWithToast({
    mutationFn: (payload: CreateBusinessPayload) => clientsApi.createBusiness(clientId, payload),
    successMessage: 'העסק נוצר בהצלחה',
    errorMessage: CLIENTS_ERROR_MESSAGES.business.create,
    invalidateKeys: [clientsQK.businessesAll(clientId), clientsQK.businesses(clientId)],
  })

  const handleCreateBusiness = useCallback(
    async (payload: CreateBusinessPayload): Promise<void> => {
      await createBusinessMutation.mutateAsync(payload)
    },
    [createBusinessMutation],
  )

  return {
    bindersTotal: relatedBindersData?.total ?? 0,
    chargesTotal: relatedChargesData?.total ?? 0,
    isFetchingRelatedData: relatedBindersFetching || relatedChargesFetching,
    handleCreateBusiness,
    isCreatingBusiness: createBusinessMutation.isPending,
  }
}
