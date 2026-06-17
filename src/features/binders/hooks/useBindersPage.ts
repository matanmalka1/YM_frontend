import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { bindersApi, bindersQK } from '../api'
import type { ListBindersParams } from '../types'
import { getErrorMessage } from '../../../utils/utils'
import { getBinderNumberLabel } from '../utils'
import { useBindersFilters } from './useBindersFilters'
import { useBinderSelection } from './useBinderSelection'
import { useBinderMutations } from './useBinderMutations'
import { useBindersPageDialogs } from './useBindersPageDialogs'
import { useReceiveBinderDrawer } from './useReceiveBinderDrawer'
import { buildBindersColumns } from '../components/table/BindersColumns'

export const useBindersPage = () => {
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

  // Receive-material drawer ownership (moved into the hook in Wave 0B).
  const [receiveOpen, setReceiveOpen] = useState(false)
  const openReceive = () => setReceiveOpen(true)
  const receiveDrawer = useReceiveBinderDrawer({ onSuccess: () => setReceiveOpen(false) })
  const closeReceive = () => {
    receiveDrawer.handleReset()
    setReceiveOpen(false)
  }

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
      onRowClick: handleSelectBinder,
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
        action: { label: 'קליטת חומר', onClick: openReceive },
      },
    },
    // Dialog/drawer STATE stays owned by useBindersPageDialogs / useBinderSelection /
    // useReceiveBinderDrawer; the hook only pre-wires ready-to-spread prop objects so
    // the page is pure slot composition (Wave 0B).
    modals: {
      dialogsProps: {
        confirmHandoverForId: dialogs.confirmHandoverForId,
        confirmDeleteForId: dialogs.confirmDeleteForId,
        confirmReadyForHandoverForId: dialogs.confirmReadyForHandoverForId,
        handoverRecipientName: dialogs.handoverRecipientName,
        setHandoverRecipientName: dialogs.setHandoverRecipientName,
        isHandingOverToClient: mutations.isHandingOverToClient,
        isDeleting: mutations.isDeleting,
        isMarkingReadyForHandover: mutations.isMarkingReadyForHandover,
        onConfirmHandoverToClient: () => void dialogs.confirmHandoverToClient(),
        onCancelHandoverToClient: dialogs.closeHandoverToClientDialog,
        onConfirmDelete: () => void dialogs.confirmDelete(),
        onCancelDelete: dialogs.closeDeleteDialog,
        onConfirmReadyForHandover: () => void dialogs.confirmReadyForHandover(),
        onCancelReadyForHandover: dialogs.closeReadyForHandoverDialog,
        getBinderNumberLabel: (id: number | null) => getBinderNumberLabel(id, pageItems, selectedBinder),
        bulkReadyForHandoverOpen: dialogs.bulkReadyForHandoverOpen,
        onCloseBulkReadyForHandover: dialogs.closeBulkReadyForHandoverDialog,
        onConfirmBulkReadyForHandover: () => void dialogs.confirmBulkReadyForHandover(),
        bulkReadyForHandoverYear: dialogs.bulkReadyForHandoverYear,
        bulkReadyForHandoverMonth: dialogs.bulkReadyForHandoverMonth,
        setBulkReadyForHandoverYear: dialogs.setBulkReadyForHandoverYear,
        setBulkReadyForHandoverMonth: dialogs.setBulkReadyForHandoverMonth,
        isMarkingReadyForHandoverBulk: mutations.isMarkingReadyForHandoverBulk,
        dialogBinder: dialogs.dialogBinder,
        handoverToClientBulkOpen: dialogs.handoverToClientBulkOpen,
        onCloseHandoverToClientBulk: dialogs.closeHandoverToClientBulkDialog,
        onSubmitHandoverToClientBulk: dialogs.submitHandoverToClientBulk,
        isHandingOverToClientBulk: mutations.isHandingOverToClientBulk,
      },
    },
    drawers: {
      openReceive,
      detail: {
        open: deepLinkBinderId !== undefined,
        binder: selectedBinder,
        onClose: handleCloseDrawer,
        actionLoading: selectedBinder ? actionLoadingId === selectedBinder.id : false,
        onReceiveMaterial: selectedBinder ? () => void receiveMaterial(selectedBinder.id) : undefined,
        onMarkFull: selectedBinder ? () => void markFull(selectedBinder.id) : undefined,
        onReopenCapacity: selectedBinder ? () => void reopenCapacity(selectedBinder.id) : undefined,
        onMarkReadyForHandover: selectedBinder ? () => dialogs.openReadyForHandoverDialog(selectedBinder.id) : undefined,
        onMarkReadyForHandoverBulk: selectedBinder
          ? () => dialogs.openBulkReadyForHandoverDialog(selectedBinder)
          : undefined,
        onRevertReadyForHandover: selectedBinder ? () => void revertReadyForHandover(selectedBinder.id) : undefined,
        onHandoverToClient: selectedBinder ? () => dialogs.openHandoverToClientDialog(selectedBinder.id) : undefined,
        onHandoverToClientBulk: selectedBinder
          ? () => dialogs.openHandoverToClientBulkDialog(selectedBinder)
          : undefined,
        onDelete: selectedBinder ? () => dialogs.openDeleteDialog(selectedBinder.id) : undefined,
      },
      receive: {
        open: receiveOpen,
        onClose: closeReceive,
        form: receiveDrawer.form,
        clientQuery: receiveDrawer.clientQuery,
        selectedClient: receiveDrawer.selectedClient,
        businesses: receiveDrawer.businesses,
        annualReports: receiveDrawer.annualReports,
        hasActiveBinder: receiveDrawer.hasActiveBinder,
        vatType: receiveDrawer.vatType,
        onClientSelect: receiveDrawer.handleClientSelect,
        onClientQueryChange: receiveDrawer.handleClientQueryChange,
        onSubmit: receiveDrawer.handleSubmit,
        isSubmitting: receiveDrawer.isSubmitting,
      },
    },
  }
}
