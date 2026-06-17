import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
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
  type ClientRecordListItem,
} from '../api'
import { CLIENT_ROUTES } from '../api/endpoints'
import {
  DEFAULT_CLIENT_SORT_BY,
  DEFAULT_CLIENT_SORT_ORDER,
  parseClientSortBy,
  parseClientSortOrder,
  parseClientStatus,
  parseEntityType,
} from '../constants'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'
import { extractClientErrorCode } from '../utils/clientErrors'
import { buildClientColumns } from '../components/list/ClientColumns'
import { useClientQuery } from './useClientQuery'

const EDIT_FORM_ID = 'client-edit-form-list'

export const useClientsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { searchParams, getParam, getPage, setFilter, setPage, resetFilters } = useSearchParamFilters()
  const { isAdvisor, can } = useRole()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [editingClientId, setEditingClientId] = useState<number | null>(null)

  const [deletedClientInfo, setDeletedClientInfo] = useState<{
    id: number
    full_name: string
    id_number: string
    deleted_at: string
  } | null>(null)

  const filters = {
    search: getParam('search'),
    status: parseClientStatus(searchParams.get('status')),
    entity_type: parseEntityType(searchParams.get('entity_type')),
    accountant_id: can.editClients ? parsePositiveInt(searchParams.get('accountant_id'), 0) || undefined : undefined,
    sort_by: parseClientSortBy(searchParams.get('sort_by')),
    order: parseClientSortOrder(searchParams.get('order')),
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
    isFetching,
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

  const handleFilterChange = (
    name: 'accountant_id' | 'entity_type' | 'page_size' | 'search' | 'status' | 'sort_by' | 'order',
    value: string,
  ) => setFilter(name, value)

  const handleReset = () =>
    resetFilters({
      sort_by: DEFAULT_CLIENT_SORT_BY,
      order: DEFAULT_CLIENT_SORT_ORDER,
    })

  const createClient = async (payload: CreateClientPayload): Promise<void> => {
    await createMutation.mutateAsync(payload)
  }
  const updateClient = (clientId: number, payload: UpdateClientPayload) =>
    updateMutation.mutateAsync({ clientId, payload })

  const deletedClientDialogOpen = deletedClientInfo !== null
  const openCreate = useCallback(() => setShowCreateModal(true), [])
  const openImportExport = useCallback(() => setShowImportExport(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])

  // Deep-link: ?create=1 opens the create modal (advisor-only) then strips the param.
  useEffect(() => {
    if (searchParams.get('create') !== '1' || !can.createClients) return
    setShowCreateModal(true)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    navigate({ search: nextParams.toString() }, { replace: true, preventScrollReset: true })
  }, [can.createClients, searchParams, navigate])

  const columns = useMemo(
    () =>
      buildClientColumns({
        onEditClient: can.editClients ? (client: ClientRecordListItem) => setEditingClientId(client.id) : undefined,
      }),
    [can.editClients],
  )

  const {
    client: editingClient,
    isLoading: editingClientLoading,
    error: editingClientError,
  } = useClientQuery({ clientId: editingClientId })

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.accountant_id)
  const isEmptyState = !loading && !error && total === 0 && !hasActiveFilters

  return {
    status: {
      isLoading: loading,
      isFetching,
      error,
      loadingMessage: 'טוען לקוחות...',
    },
    isEmptyState,
    headerProps: {
      title: 'לקוחות',
      description: isEmptyState ? undefined : 'רשימת כל הלקוחות במערכת',
    },
    stats: {
      values: stats,
      selected: filters.status,
      onStatusClick: (status: string) => handleFilterChange('status', filters.status === status ? '' : status),
    },
    filters: {
      values: filters,
      onFilterChange: handleFilterChange,
      resetFilters: handleReset,
      showAccountantFilter: can.editClients,
    },
    table: {
      data: clientItems,
      columns,
      onRowClick: (client: ClientRecordListItem) => navigate(CLIENT_ROUTES.detail(client.id)),
      pagination: {
        page: filters.page,
        pageSize: filters.page_size,
        total,
        onPageChange: setPage,
        onPageSizeChange: (size: number) => handleFilterChange('page_size', String(size)),
      },
      emptyState: {
        isEmpty: clientItems.length === 0,
        isFiltered: hasActiveFilters,
        icon: Users,
        variant: (isEmptyState && can.createClients ? 'illustration' : 'default') as 'illustration' | 'default',
        title: isEmptyState ? 'אין לקוחות במערכת עדיין' : 'לא נמצאו לקוחות',
        message:
          isEmptyState && can.createClients
            ? 'צור לקוח ראשון או ייבא רשימת לקוחות קיימת. יצירת לקוח תפתח אוטומטית קלסר ראשוני, מועדי מס רלוונטיים ותיק דוח שנתי לפי סוג הלקוח.'
            : 'לא נמצאו לקוחות התואמים את החיפוש או הסינון הנוכחי.',
        action: isEmptyState && can.createClients ? { label: 'לקוח חדש', onClick: openCreate } : undefined,
        secondaryAction:
          isEmptyState && can.createClients ? { label: 'ייבוא לקוחות', onClick: openImportExport } : undefined,
      },
    },
    drawers: {
      edit: {
        open: editingClientId !== null,
        onClose: () => setEditingClientId(null),
        client: editingClient,
        isLoading: editingClientLoading,
        error: editingClientError,
        onSave: async (payload: UpdateClientPayload) => {
          if (editingClientId === null) return
          await updateClient(editingClientId, payload)
          setEditingClientId(null)
        },
        updateLoading: updateMutation.isPending,
        formId: EDIT_FORM_ID,
      },
    },
    modals: {
      openCreate,
      openImportExport,
      createProps: {
        open: showCreateModal && !deletedClientDialogOpen,
        onClose: closeCreateModal,
        onSubmit: createClient,
        onRestoreDeletedClient: async (clientId: number) => {
          const restored = await restoreDeletedClient(clientId)
          setShowCreateModal(false)
          navigate(CLIENT_ROUTES.detail(restored.id))
          return restored
        },
        isAdvisor,
        isLoading: createMutation.isPending,
        restoreLoading: restoreMutation.isPending,
      },
      importExportProps: {
        open: showImportExport,
        onClose: () => setShowImportExport(false),
      },
      deletedClientProps: {
        open: deletedClientDialogOpen,
        deletedClient: deletedClientInfo,
        isAdvisor,
        onRestore: handleRestoreClient,
        onForceCreate: handleDismissDeletedDialog,
        onDismiss: () => {
          handleDismissDeletedDialog()
          setShowCreateModal(true)
        },
        restoreLoading: restoreMutation.isPending,
        forceCreateLoading: false,
      },
    },
    permissions: {
      can,
      isAdvisor,
    },
  }
}
