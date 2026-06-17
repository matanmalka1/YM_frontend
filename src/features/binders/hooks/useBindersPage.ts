import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { bindersApi, bindersQK } from '../api'
import type { ListBindersParams } from '../types'
import { getErrorMessage } from '../../../utils/utils'
import { useBindersFilters } from './useBindersFilters'
import { useBinderSelection } from './useBinderSelection'
import { useBinderMutations } from './useBinderMutations'
import { useBindersPageDialogs } from './useBindersPageDialogs'
import { buildBindersColumns } from '../components/table/BindersColumns'

interface UseBindersPageParams {
  /** Opens the receive-material drawer; the drawer's open state stays page-owned in Wave 0A. */
  onOpenReceive: () => void
}

export const useBindersPage = ({ onOpenReceive }: UseBindersPageParams) => {
  const { filters, setPage, handleFilterChange, handleMultiFilterChange, handleReset, handleSort } = useBindersFilters()

  const listParams = useMemo<ListBindersParams>(
    () => ({
      location_status: filters.location_status || undefined,
      capacity_status: filters.capacity_status || undefined,
      client_record_id: filters.client_record_id,
      binder_number: filters.binder_number || undefined,
      year: filters.year ? Number(filters.year) : undefined,
      page: filters.page,
      page_size: filters.page_size,
      sort_by: filters.sort_by,
      order: filters.order,
    }),
    [
      filters.binder_number,
      filters.capacity_status,
      filters.client_record_id,
      filters.location_status,
      filters.order,
      filters.page,
      filters.page_size,
      filters.sort_by,
      filters.year,
    ],
  )

  const bindersQuery = useQuery({
    queryKey: bindersQK.list(listParams),
    queryFn: () => bindersApi.list(listParams),
    placeholderData: keepPreviousData,
  })

  const pageItems = useMemo(() => bindersQuery.data?.items ?? [], [bindersQuery.data?.items])
  const total = bindersQuery.data?.total ?? 0
  const lastCountersRef = useRef({
    total: 0,
    location_in_office: 0,
    location_ready_for_handover: 0,
    location_handed_over: 0,
    capacity_open: 0,
    capacity_full: 0,
  })

  useEffect(() => {
    if (bindersQuery.data?.counters) {
      lastCountersRef.current = bindersQuery.data.counters
    }
  }, [bindersQuery.data?.counters])

  const counters = bindersQuery.data?.counters ?? lastCountersRef.current

  const { deepLinkBinderId, selectedBinder, handleSelectBinder, handleCloseDrawer } = useBinderSelection(pageItems)

  const mutations = useBinderMutations(handleCloseDrawer)
  const { actionLoadingId, receiveMaterial, markFull, reopenCapacity, revertReadyForHandover } = mutations

  const dialogs = useBindersPageDialogs({
    getSelectedBinder: () => selectedBinder,
    markReadyForHandover: mutations.markReadyForHandover,
    markReadyForHandoverBulk: mutations.markReadyForHandoverBulk,
    handoverToClient: mutations.handoverToClient,
    handoverToClientBulk: mutations.handoverToClientBulk,
    deleteBinder: mutations.deleteBinder,
  })

  const columns = useMemo(
    () =>
      buildBindersColumns({
        actionLoadingId,
        onReceiveMaterial: (id) => void receiveMaterial(id),
        onMarkFull: (id) => void markFull(id),
        onReopenCapacity: (id) => void reopenCapacity(id),
        onMarkReadyForHandover: dialogs.openReadyForHandoverDialog,
        onMarkReadyForHandoverBulk: (id) => {
          const binder = pageItems.find((item) => item.id === id) ?? null
          dialogs.openBulkReadyForHandoverDialog(binder ?? undefined)
        },
        onRevertReadyForHandover: (id) => void revertReadyForHandover(id),
        onHandoverToClient: dialogs.openHandoverToClientDialog,
        onHandoverToClientBulk: (id) => {
          const binder = pageItems.find((item) => item.id === id) ?? null
          dialogs.openHandoverToClientBulkDialog(binder ?? undefined)
        },
        onOpenDetail: (id) => handleSelectBinder({ id }),
        onDelete: dialogs.openDeleteDialog,
      }),
    [
      actionLoadingId,
      pageItems,
      dialogs,
      receiveMaterial,
      markFull,
      reopenCapacity,
      revertReadyForHandover,
      handleSelectBinder,
    ],
  )

  const isFiltered = Boolean(
    filters.location_status ||
    filters.capacity_status ||
    filters.client_record_id ||
    filters.client_name ||
    filters.binder_number ||
    filters.year,
  )

  return {
    status: {
      isLoading: bindersQuery.isPending,
      isFetching: bindersQuery.isFetching,
      error: bindersQuery.error ? getErrorMessage(bindersQuery.error, 'שגיאה בטעינת רשימת קלסרים') : null,
      loadingMessage: 'טוען קלסרים...',
    },
    headerProps: {
      title: 'קלסרים',
      description: 'רשימת הקלסרים במשרד — סינון לפי לקוח, מספר קלסר, סטטוס ותקופה',
    },
    stats: {
      counters,
      countersLoading: false,
      locationStatus: filters.location_status,
      onFilterChange: handleFilterChange,
    },
    filters: {
      values: filters,
      onFilterChange: handleFilterChange,
      onMultiFilterChange: handleMultiFilterChange,
      resetFilters: handleReset,
      onSort: handleSort,
    },
    table: {
      data: pageItems,
      columns,
      pagination: {
        page: filters.page,
        pageSize: filters.page_size,
        total,
        onPageChange: setPage,
      },
      emptyState: {
        isEmpty: pageItems.length === 0,
        isFiltered,
        emptyMessage: 'אין קלסרים התואמים לסינון הנוכחי',
        title: 'לא נמצאו קלסרים',
        message: 'נסה לאפס את הסינון, או קלוט חומר חדש.',
        action: { label: 'קליטת חומר', onClick: onOpenReceive },
      },
    },
    // Wave 0A: dialog/drawer STATE ownership stays in its hooks; grouped here for
    // the page to compose JSX from. Heavier orchestration cleanup is Wave 0B.
    modals: {
      dialogs,
      isHandingOverToClient: mutations.isHandingOverToClient,
      isDeleting: mutations.isDeleting,
      isMarkingReadyForHandover: mutations.isMarkingReadyForHandover,
      isMarkingReadyForHandoverBulk: mutations.isMarkingReadyForHandoverBulk,
      isHandingOverToClientBulk: mutations.isHandingOverToClientBulk,
    },
    drawers: {
      detailOpen: deepLinkBinderId !== undefined,
      selectedBinder,
      onSelect: handleSelectBinder,
      onCloseDetail: handleCloseDrawer,
      actionLoadingId: mutations.actionLoadingId,
      receiveMaterial: mutations.receiveMaterial,
      markFull: mutations.markFull,
      reopenCapacity: mutations.reopenCapacity,
      revertReadyForHandover: mutations.revertReadyForHandover,
    },
  }
}
