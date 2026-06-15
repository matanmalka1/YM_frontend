import { useCallback, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { getErrorMessage, parsePositiveInt, showErrorToast } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import {
  clientsApi,
  clientsQK,
  type CreateClientPayload,
  type UpdateClientPayload,
  type ListClientsParams,
} from '../api'
import {
  DEFAULT_CLIENT_SORT_BY,
  DEFAULT_CLIENT_SORT_ORDER,
  type ClientSortBy,
  type ClientSortOrder,
} from '../constants'
import { useActionRunner } from '@/features/actions'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'
import { extractClientErrorCode } from '../utils/clientErrors'

export const useClientsPage = () => {
  const queryClient = useQueryClient()
  const { searchParams, getParam, getPage, setFilter, setPage, resetFilters } = useSearchParamFilters()
  const { isAdvisor, can } = useRole()

  const [deletedClientInfo, setDeletedClientInfo] = useState<{
    id: number
    full_name: string
    id_number: string
    deleted_at: string
  } | null>(null)

  const filters = {
    search: getParam('search'),
    status: (searchParams.get('status') as ListClientsParams['status']) ?? undefined,
    entity_type: (searchParams.get('entity_type') as ListClientsParams['entity_type']) ?? undefined,
    accountant_id: can.editClients ? parsePositiveInt(searchParams.get('accountant_id'), 0) || undefined : undefined,
    sort_by: (searchParams.get('sort_by') as ClientSortBy) || DEFAULT_CLIENT_SORT_BY,
    order: (searchParams.get('order') as ClientSortOrder) || DEFAULT_CLIENT_SORT_ORDER,
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), 20),
  }

  const apiParams: ListClientsParams = {
    search: filters.search || undefined,
    status: filters.status,
    entity_type: filters.entity_type,
    accountant_id: filters.accountant_id,
    sort_by: filters.sort_by,
    order: filters.order,
    page: filters.page,
    page_size: filters.page_size,
  }

  const {
    data: listData,
    isPending: loading,
    error: listError,
  } = useQuery({
    queryKey: clientsQK.list(apiParams),
    queryFn: () => clientsApi.list(apiParams),
    placeholderData: keepPreviousData,
  })

  const clientItems = listData?.items ?? []
  const total = listData?.total ?? 0
  const stats = listData?.stats ?? { active: 0, frozen: 0, closed: 0 }
  const error = listError ? getErrorMessage(listError, 'שגיאה בטעינת רשימת לקוחות') : null

  const createMutation = useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.create(payload),
    onSuccess: (data) => {
      const summary = data.impact.items.map((i) => `${i.label}: ${i.count}`).join(' | ')
      toast.success(`לקוח נוצר בהצלחה\n${summary}`)
      queryClient.invalidateQueries({ queryKey: clientsQK.all })
      setDeletedClientInfo(null)
    },
    onError: async (err, payload) => {
      const code = extractClientErrorCode(err)
      if (code === 'CLIENT.DELETED_EXISTS') {
        try {
          const deleted = await clientsApi.getConflictByIdNumber(payload.id_number)
          setDeletedClientInfo(deleted.deleted_clients[0] ?? null)
        } catch {
          showErrorToast(err, 'שגיאה ביצירת לקוח')
        }
      } else {
        showErrorToast(err, 'שגיאה ביצירת לקוח')
      }
    },
  })

  const updateMutation = useMutationWithToast<
    Awaited<ReturnType<typeof clientsApi.update>>,
    { clientId: number; payload: UpdateClientPayload }
  >({
    mutationFn: ({ clientId, payload }) => clientsApi.update(clientId, payload),
    successMessage: 'הלקוח עודכן בהצלחה',
    errorMessage: 'שגיאה בעדכון לקוח',
    invalidateKeys: [clientsQK.all],
  })

  const restoreMutation = useMutationWithToast<Awaited<ReturnType<typeof clientsApi.restore>>, number>({
    mutationFn: (clientId) => clientsApi.restore(clientId),
    successMessage: 'הלקוח שוחזר בהצלחה',
    errorMessage: 'שגיאה בשחזור לקוח',
    invalidateKeys: [clientsQK.all],
    onSuccess: () => setDeletedClientInfo(null),
  })

  const handleRestoreClient = useCallback(() => {
    if (!deletedClientInfo) return
    restoreMutation.mutate(deletedClientInfo.id)
  }, [deletedClientInfo, restoreMutation])

  const restoreDeletedClient = useCallback(
    async (clientId: number) => {
      const restored = await restoreMutation.mutateAsync(clientId)
      setDeletedClientInfo(null)
      return restored
    },
    [restoreMutation],
  )

  const handleDismissDeletedDialog = useCallback(() => {
    setDeletedClientInfo(null)
  }, [])

  const {
    activeActionKey,
    cancelPendingAction,
    confirmPendingAction,
    handleAction: onAction,
    pendingAction,
  } = useActionRunner({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientsQK.all }),
    errorFallback: 'שגיאה בביצוע פעולת לקוח',
  })

  const handleFilterChange = (
    name: 'accountant_id' | 'entity_type' | 'page_size' | 'search' | 'status' | 'sort_by' | 'order',
    value: string,
  ) => setFilter(name, value)

  const handleReset = () =>
    resetFilters({
      sort_by: DEFAULT_CLIENT_SORT_BY,
      order: DEFAULT_CLIENT_SORT_ORDER,
    })

  return {
    activeActionKey,
    clients: clientItems,
    error,
    filters,
    onAction,
    handleFilterChange,
    handleReset,
    loading,
    pendingAction,
    setPage,
    stats,
    total,
    cancelPendingAction,
    confirmPendingAction,
    createClient: async (payload: CreateClientPayload): Promise<void> => {
      await createMutation.mutateAsync(payload)
    },
    createLoading: createMutation.isPending,
    deletedClientInfo,
    deletedClientDialogOpen: deletedClientInfo !== null,
    handleRestoreClient,
    restoreDeletedClient,
    handleDismissDeletedDialog,
    restoreLoading: restoreMutation.isPending,
    updateClient: (clientId: number, payload: UpdateClientPayload) => updateMutation.mutateAsync({ clientId, payload }),
    updateLoading: updateMutation.isPending,
    isAdvisor,
    can,
  }
}
