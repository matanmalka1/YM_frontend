import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vatReportsApi, vatReportsQK, type VatWorkItemStatus, type VatWorkItemStatusSummaryParams } from '../api'
import { VAT_WORK_ITEMS_STATS_STATUS_GROUPS } from '../constants/vatConstants'
import { toOptionalVatPeriodTypeFilter } from '../utils/filters'
import { buildVatEmptyStateTitle } from '../utils/filters'
import { useVatWorkItemGroups } from './useVatWorkItemGroups'
import { useVatWorkItemsFilters } from './useVatWorkItemsFilters'
import { useVatWorkItemListActions } from './useVatWorkItemListActions'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const VAT_PAGE_HEADER = {
  title: 'דוחות מע"מ (לקוח)',
  description: 'ניהול תיקי מע"מ חודשיים ברמת לקוח — הקלדה, בדיקה והגשה',
} as const

export const useVatWorkItemsPage = () => {
  const navigate = useNavigate()
  const filterState = useVatWorkItemsFilters()
  const actions = useVatWorkItemListActions()
  const { filters } = filterState
  const periodType = toOptionalVatPeriodTypeFilter(filters.period_type)
  const clientRecordId = filters.client_record_id ? Number(filters.client_record_id) : undefined
  const year = filters.year ? Number(filters.year) : undefined
  const summaryParams: VatWorkItemStatusSummaryParams = { year, period_type: periodType, client_record_id: clientRecordId }

  const summaryQuery = useQuery({
    queryKey: vatReportsQK.statusSummary(summaryParams),
    queryFn: () => vatReportsApi.getStatusSummary(summaryParams),
  })
  const groupsQuery = useVatWorkItemGroups({
    period_type: periodType,
    status: filters.status || undefined,
    client_record_id: clientRecordId,
    year,
  })
  const statsTotal = (statuses: readonly VatWorkItemStatus[]) =>
    statuses.reduce((total, status) => total + (summaryQuery.data?.[status] ?? 0), 0)
  const handleRowClick = useCallback((item: { id: number }) => navigate(`/tax/vat/${item.id}`), [navigate])

  return {
    status: {
      isLoading: groupsQuery.isLoading,
      isFetching: groupsQuery.isFetching,
      error: groupsQuery.error,
      loadingMessage: VAT_MESSAGES.page.loadingWorkItems,
    },
    headerProps: VAT_PAGE_HEADER,
    stats: {
      pending: statsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.pending),
      typing: statsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.typing),
      review: statsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.review),
      filed: statsTotal(VAT_WORK_ITEMS_STATS_STATUS_GROUPS.filed),
      visible: !summaryQuery.isLoading && groupsQuery.groups.length > 0,
    },
    filters: {
      fields: filterState.fields,
      values: filterState.values,
      onChange: filterState.onChange,
      onMultiChange: filterState.onMultiChange,
      onReset: filterState.onReset,
    },
    table: {
      groups: groupsQuery.groups,
      columns: actions.columns,
      isLoading: groupsQuery.isLoading,
      error: groupsQuery.error,
      onRowClick: handleRowClick,
      groupFilters: { status: filters.status || undefined, client_record_id: clientRecordId },
      focusPeriod: filterState.focusPeriod,
      emptyState: {
        title: buildVatEmptyStateTitle(filters),
        message: actions.permissions.canCreateVatWorkItem ? 'נסה לשנות את הסינון או לפתוח תיק חדש' : 'נסה לשנות את הסינון',
        action: actions.permissions.canCreateVatWorkItem
          ? { label: 'תיק חדש', onClick: filterState.createModal.openModal }
          : undefined,
      },
    },
    modals: {
      openCreate: filterState.createModal.openModal,
      createProps: {
        open: filterState.createModal.open,
        createError: actions.create.error,
        createLoading: actions.create.isLoading,
        onClose: filterState.createModal.closeModal,
        onSubmit: actions.create.submit,
        initialClientId: filterState.createModal.initialClientId,
        initialPeriod: filterState.createModal.initialPeriod,
      },
      deleteConfirmProps: {
        open: actions.deletion.open,
        title: VAT_MESSAGES.deleteWorkItem.title,
        message: VAT_ERROR_MESSAGES.deleteWorkItem.message,
        confirmLabel: GLOBAL_UI_MESSAGES.actions.delete,
        cancelLabel: GLOBAL_UI_MESSAGES.actions.cancel,
        confirmVariant: 'danger' as const,
        isLoading: actions.deletion.isLoading,
        onConfirm: actions.deletion.confirm,
        onCancel: actions.deletion.cancel,
      },
    },
    permissions: actions.permissions,
    sendBackWithNote: actions.sendBackWithNote,
  }
}
