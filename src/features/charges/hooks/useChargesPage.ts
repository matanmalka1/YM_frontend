import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { useBusinessesForClient } from '../../../hooks/useBusinessesForClient'
import { chargesApi, chargesQK, type CreateChargePayload, type ChargeListItem } from '../api'
import { getErrorMessage, parsePositiveInt } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { toast } from '../../../utils/toast'
import { useTableSelection } from '../../../hooks/useTableSelection'
import { DEFAULT_CHARGE_LIST_STATS } from '../constants'
import { getChargesFilters, toChargesListParams } from '../utils/chargeHelpers'
import { getChargeBusinessLabel } from '../utils/chargeUtils'
import { buildChargeColumns } from '../components/list/ChargeColumns'
import type { NotificationTrigger } from '@/features/notifications'
import { useChargeActions } from './useChargeActions'
import { useChargeCreateMutation } from './useChargeCreateMutation'
import { useChargesFilters } from './useChargesFilters'
import { CHARGES_MESSAGES } from '../messages'
import { CHARGES_ERROR_MESSAGES } from '../errorMessages'
import { CHARGE_ROUTES } from '../api/endpoints'

interface UseChargesPageOptions {
  /** Pins the list to one client (client-details tab): overrides any URL client filter, swaps the client-picker for a business filter. */
  pinnedClient?: { id: number; name: string }
}

export const useChargesPage = ({ pinnedClient }: UseChargesPageOptions = {}) => {
  const navigate = useNavigate()
  const { searchParams, setFilter, setPage, resetFilters, setSearchParams } = useSearchParamFilters()

  const filters = getChargesFilters(searchParams)
  const { businesses, isLoading: businessesLoading } = useBusinessesForClient({
    clientId: pinnedClient?.id,
    enabled: Boolean(pinnedClient),
  })
  const rawBusinessId = searchParams.get('business_id')
  const parsedBusinessId = pinnedClient ? parsePositiveInt(rawBusinessId, 0) : 0
  const businessFilterId =
    parsedBusinessId > 0 && businesses.some((business) => business.id === parsedBusinessId) ? parsedBusinessId : null

  const apiParams = {
    ...toChargesListParams(filters),
    ...(pinnedClient ? { client_record_id: pinnedClient.id, business_id: businessFilterId ?? undefined } : {}),
  }
  const filterBar = useChargesFilters({
    filters,
    onFilterChange: setFilter,
    onReset: resetFilters,
    pinnedBusinessFilter: pinnedClient ? { businesses, businessesLoading, selectedBusinessId: businessFilterId } : undefined,
  })

  const {
    data: listData,
    isPending: loading,
    isFetching,
    error: listError,
  } = useQuery({
    queryKey: chargesQK.list(apiParams),
    queryFn: () => chargesApi.list(apiParams),
    placeholderData: keepPreviousData,
  })

  const chargeItems = useMemo(() => listData?.items ?? [], [listData?.items])
  const total = listData?.total ?? 0
  const stats = listData?.stats ?? DEFAULT_CHARGE_LIST_STATS
  const error = listError ? getErrorMessage(listError, CHARGES_ERROR_MESSAGES.list.load) : null

  const { isAdvisor, isSecretary } = useRole()
  const createMutation = useChargeCreateMutation()
  const { clearSelection, selectedIds, toggleSelect, toggleSelectAll } = useTableSelection<number>()
  const { actionLoadingId, bulkLoading, runAction, runBulkAction } = useChargeActions({
    clearSelection,
    canAct: isAdvisor || isSecretary,
    selectedIds,
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notificationContext, setNotificationContext] = useState<{
    charge: ChargeListItem
    trigger: NotificationTrigger
  } | null>(null)

  const openCreate = useCallback(() => setShowCreateModal(true), [])
  const closeCreate = useCallback(() => setShowCreateModal(false), [])
  const closeNotification = useCallback(() => setNotificationContext(null), [])
  const openNotification = useCallback(
    (charge: ChargeListItem, trigger: NotificationTrigger) => setNotificationContext({ charge, trigger }),
    [],
  )

  // Deep-link: ?create=1 auto-opens the create modal (advisor only) then strips the param.
  useEffect(() => {
    if (searchParams.get('create') !== '1' || !isAdvisor) return
    setShowCreateModal(true)
    const next = new URLSearchParams(searchParams)
    next.delete('create')
    setSearchParams(next, { replace: true })
  }, [isAdvisor, searchParams, setSearchParams])

  const allIds = useMemo(() => chargeItems.map((charge) => charge.id), [chargeItems])
  const columns = useMemo(
    () =>
      buildChargeColumns({
        isAdvisor,
        includeClientColumns: !pinnedClient,
        actionLoadingId,
        runAction,
        onOpenDetail: (chargeId) =>
          navigate(pinnedClient ? CHARGE_ROUTES.clientDetail(pinnedClient.id, chargeId) : CHARGE_ROUTES.detail(chargeId)),
        selectedIds,
        onToggleSelect: toggleSelect,
        onToggleAll: toggleSelectAll,
        allIds,
        onSendNotification: openNotification,
      }),
    [
      isAdvisor,
      actionLoadingId,
      runAction,
      selectedIds,
      toggleSelect,
      toggleSelectAll,
      allIds,
      openNotification,
      navigate,
      pinnedClient,
    ],
  )

  const submitCreate = async (payload: CreateChargePayload): Promise<boolean> => {
    if (!isAdvisor) {
      toast.error(CHARGES_ERROR_MESSAGES.permissions.create)
      return false
    }

    try {
      await createMutation.mutateAsync(pinnedClient ? { ...payload, client_record_id: pinnedClient.id } : payload)
      return true
    } catch {
      return false
    }
  }

  return {
    status: {
      isLoading: loading,
      isFetching,
      error,
      loadingMessage: CHARGES_MESSAGES.list.loading,
    },
    headerProps: {
      title: CHARGES_MESSAGES.list.title,
      description: CHARGES_MESSAGES.list.description,
    },
    stats: {
      stats,
      isAdvisor,
    },
    filters: filterBar,
    table: {
      data: chargeItems,
      columns,
      pagination: {
        page: filters.page,
        pageSize: filters.page_size,
        total,
        onPageChange: setPage,
      },
      selection: {
        selectedCount: selectedIds.size,
        bulkLoading,
        onBulkAction: runBulkAction,
        onClearSelection: clearSelection,
      },
      onOpenCharge: (chargeId: number) =>
        navigate(pinnedClient ? CHARGE_ROUTES.clientDetail(pinnedClient.id, chargeId) : CHARGE_ROUTES.detail(chargeId)),
      onCreateCharge: openCreate,
    },
    modals: {
      createProps: {
        open: showCreateModal,
        createError: createMutation.error ? getErrorMessage(createMutation.error, CHARGES_ERROR_MESSAGES.mutations.create) : null,
        createLoading: createMutation.isPending,
        onClose: closeCreate,
        onSubmit: submitCreate,
        ...(pinnedClient
          ? {
              initialClient: pinnedClient,
              businesses,
              initialBusiness: (() => {
                const selected = businesses.find((business) => business.id === businessFilterId)
                return selected ? { id: selected.id, name: getChargeBusinessLabel(selected) } : null
              })(),
            }
          : {}),
      },
      notificationProps: notificationContext
        ? {
            open: true,
            onClose: closeNotification,
            clientRecordId: notificationContext.charge.client_record_id,
            initialTrigger: notificationContext.trigger,
            entityId: notificationContext.charge.id,
            disableTriggerChange: true,
          }
        : null,
    },
    permissions: {
      isAdvisor,
    },
  }
}
