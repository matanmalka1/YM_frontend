import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { getErrorMessage, parsePositiveInt, showErrorToast } from '../../../utils/utils'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
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
import { buildClientColumns } from '../components/list/ClientColumns'
import { useClientQuery } from './useClientQuery'
import { useClientsFilters } from './useClientsFilters'
import { useDeletedClientConflict } from './useDeletedClientConflict'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

const EDIT_FORM_ID = 'client-edit-form-list'

export const useClientsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { searchParams, getParam, getPage, setFilter, setPage, resetFilters } = useSearchParamFilters()
  const { isAdvisor, can } = useRole()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [editingClientId, setEditingClientId] = useState<number | null>(null)

  const conflict = useDeletedClientConflict()

  const filters = {
    search: getParam('search'),
    status: parseClientStatus(searchParams.get('status')),
    entity_type: parseEntityType(searchParams.get('entity_type')),
    accountant_id: can.editClients ? parsePositiveInt(searchParams.get('accountant_id'), 0) || undefined : undefined,
    sort_by: parseClientSortBy(searchParams.get('sort_by')),
    order: parseClientSortOrder(searchParams.get('order')),
    page: getPage(),
    page_size: parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE_SM),
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
  const stats = listData?.stats ?? { osek_patur: 0, osek_murshe: 0, company_ltd: 0, employee: 0 }
  const error = listError ? getErrorMessage(listError, CLIENTS_ERROR_MESSAGES.client.listLoad) : null

  const createMutation = useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.create(payload),
    onSuccess: (data) => {
      const summary = data.impact.items.map((i) => `${i.label}: ${i.count}`).join(' | ')
      toast.success(`לקוח נוצר בהצלחה\n${summary}`)
      queryClient.invalidateQueries({ queryKey: clientsQK.all })
      conflict.clearConflict()
    },
    onError: async (err, payload) => {
      const handled = await conflict.handleCreateError(err, payload.id_number)
      if (!handled) showErrorToast(err, CLIENTS_ERROR_MESSAGES.client.create)
    },
  })

  const updateMutation = useMutationWithToast<
    Awaited<ReturnType<typeof clientsApi.update>>,
    { clientId: number; payload: UpdateClientPayload }
  >({
    mutationFn: ({ clientId, payload }) => clientsApi.update(clientId, payload),
    successMessage: 'הלקוח עודכן בהצלחה',
    errorMessage: CLIENTS_ERROR_MESSAGES.client.update,
    invalidateKeys: [clientsQK.all],
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

  const filterBar = useClientsFilters({
    filters,
    onFilterChange: handleFilterChange,
    onReset: handleReset,
    showAccountantFilter: can.editClients,
  })

  const createClient = async (payload: CreateClientPayload): Promise<void> => {
    await createMutation.mutateAsync(payload)
  }
  const updateClient = (clientId: number, payload: UpdateClientPayload) =>
    updateMutation.mutateAsync({ clientId, payload })

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

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.accountant_id || filters.entity_type)
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
    },
    filters: filterBar,
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
        action: isEmptyState
          ? can.createClients
            ? { label: 'לקוח חדש', onClick: openCreate }
            : undefined
          : hasActiveFilters
            ? { label: 'איפוס סינון', onClick: handleReset }
            : undefined,
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
        open: showCreateModal && !conflict.isOpen,
        onClose: closeCreateModal,
        onSubmit: createClient,
        onRestoreDeletedClient: async (clientId: number) => {
          const restored = await conflict.restoreDeletedClient(clientId)
          setShowCreateModal(false)
          navigate(CLIENT_ROUTES.detail(restored.id))
          return restored
        },
        isAdvisor,
        isLoading: createMutation.isPending,
        restoreLoading: conflict.restoreLoading,
      },
      importExportProps: {
        open: showImportExport,
        onClose: () => setShowImportExport(false),
      },
      deletedClientProps: {
        open: conflict.isOpen,
        deletedClient: conflict.deletedClientInfo,
        isAdvisor,
        onRestore: conflict.handleRestoreClient,
        onForceCreate: conflict.clearConflict,
        onDismiss: () => {
          conflict.clearConflict()
          setShowCreateModal(true)
        },
        restoreLoading: conflict.restoreLoading,
        forceCreateLoading: false,
      },
    },
    permissions: {
      can,
      isAdvisor,
    },
  }
}
