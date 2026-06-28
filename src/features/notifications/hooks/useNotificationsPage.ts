import { useCallback, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { FIRST_PAGE, PAGE_SIZE_25 } from '@/constants/pagination.constants'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { useActiveUserFilterOptions } from '@/features/users'

import {
  CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS,
  isNotificationStatus,
  isNotificationTrigger,
  type ListNotificationsParams,
} from '../api'
import { useNotifications } from './useNotifications'
import { useNotificationDetail } from './useNotificationDetail'
import { buildNotificationColumns } from '../components/list/NotificationsColumns'
import { NOTIFICATION_STATUS_OPTIONS, NOTIFICATION_TRIGGER_OPTIONS } from '../constants'
import { NOTIFICATIONS_MESSAGES } from '../messages'
import { NOTIFICATIONS_ERROR_MESSAGES } from '../errorMessages'

const DEFAULT_PAGE_SIZE = PAGE_SIZE_25

type SelectedClientFilter = {
  id: number
  name: string
}

export const useNotificationsPage = () => {
  const { isAdvisor } = useRole()
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage: setUrlPage } = useSearchParamFilters()

  const page = getPage(FIRST_PAGE)
  const pageSize = DEFAULT_PAGE_SIZE
  const triggerParam = searchParams.get('trigger')
  const statusParam = searchParams.get('status')
  const trigger = isNotificationTrigger(triggerParam) ? triggerParam : undefined
  const status = isNotificationStatus(statusParam) ? statusParam : undefined
  const dateFrom = getParam('created_after')
  const dateTo = getParam('created_before')
  const triggeredBy = getParam('triggered_by')
  const clientRecordId = getParam('client_record_id')
  const clientName = getParam('client_name')

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: selected, isPending: selectedLoading, error: selectedError } = useNotificationDetail(selectedId)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendClient, setSendClient] = useState<SelectedClientFilter | null>(null)

  const params: ListNotificationsParams = {
    page,
    page_size: pageSize,
    client_record_id: clientRecordId ? Number(clientRecordId) : undefined,
    trigger,
    status,
    created_after: dateFrom ? `${dateFrom}T00:00:00` : undefined,
    created_before: dateTo ? `${dateTo}T23:59:59` : undefined,
    triggered_by: triggeredBy ? Number(triggeredBy) : undefined,
  }

  const { data, isPending, isFetching, error } = useNotifications(params)
  const { options: userOptions, isPending: usersPending } = useActiveUserFilterOptions()
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const openSendModal = useCallback((client?: SelectedClientFilter | null) => {
    setSendClient(client ?? null)
    setSendOpen(true)
  }, [])

  const closeSendModal = useCallback(() => {
    setSendOpen(false)
    setSendClient(null)
  }, [])

  const columns = useMemo(
    () => buildNotificationColumns({ isAdvisor, onView: setSelectedId, onSend: openSendModal }),
    [isAdvisor, openSendModal],
  )

  const filterFields = useMemo(
    () => [
      { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name', label: 'לקוח' },
      { type: 'select' as const, key: 'trigger', label: 'סוג הודעה', options: NOTIFICATION_TRIGGER_OPTIONS },
      { type: 'select' as const, key: 'status', label: 'סטטוס', options: NOTIFICATION_STATUS_OPTIONS },
      {
        type: 'date-range' as const,
        fromKey: 'created_after',
        toKey: 'created_before',
        fromLabel: 'מתאריך',
        toLabel: 'עד תאריך',
      },
      {
        type: 'select' as const,
        key: 'triggered_by',
        label: 'נשלח על ידי',
        options: userOptions,
        disabled: usersPending,
      },
    ],
    [userOptions, usersPending],
  )

  const filterValues = {
    client_record_id: clientRecordId,
    client_name: clientName,
    trigger: trigger ?? '',
    status: status ?? '',
    created_after: dateFrom,
    created_before: dateTo,
    triggered_by: triggeredBy,
  }

  const resetFilters = () =>
    setFilters({
      client_record_id: '',
      client_name: '',
      trigger: '',
      status: '',
      created_after: '',
      created_before: '',
      triggered_by: '',
    })

  return {
    status: {
      isLoading: isPending,
      isFetching,
      error: error ? NOTIFICATIONS_ERROR_MESSAGES.page.loadError : null,
      loadingMessage: NOTIFICATIONS_MESSAGES.page.loading,
    },
    headerProps: {
      title: NOTIFICATIONS_MESSAGES.page.title,
      description: NOTIFICATIONS_MESSAGES.page.description,
    },
    permissions: { isAdvisor },
    filters: {
      fields: filterFields,
      values: filterValues,
      onChange: (key: string, value: string) => setFilter(key, value),
      onMultiChange: (updates: Record<string, string>) => setFilters(updates),
      onReset: resetFilters,
    },
    table: {
      data: items,
      columns,
      onRowClick: (item: { id: number }) => setSelectedId(item.id),
      pagination: {
        page,
        pageSize,
        total,
        onPageChange: setUrlPage,
      },
      label: 'הודעות',
      showPagination: total > 0,
      emptyState: {
        icon: Bell,
        message: NOTIFICATIONS_MESSAGES.page.empty,
      },
    },
    drawers: {
      detail: {
        open: selectedId !== null,
        notification: selected,
        isLoading: selectedId !== null && selectedLoading,
        error: selectedError,
        onClose: () => setSelectedId(null),
        onSend:
          selected && isAdvisor
            ? () =>
                openSendModal({
                  id: selected.client_record_id,
                  name: selected.client_name ?? `#${selected.client_record_id}`,
                })
            : undefined,
      },
    },
    modals: {
      openSend: openSendModal,
      sendProps: {
        open: sendOpen,
        onClose: closeSendModal,
        clientRecordId: sendClient?.id,
        allowedTriggers: CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS,
      },
    },
  }
}
