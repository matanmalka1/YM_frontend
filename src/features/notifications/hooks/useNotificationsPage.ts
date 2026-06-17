import { useCallback, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { FIRST_PAGE } from '@/constants/pagination.constants'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parsePositiveInt } from '@/utils/utils'
import { useActiveUserOptions } from '@/features/users'

import {
  CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS,
  isNotificationStatus,
  isNotificationTrigger,
  type ListNotificationsParams,
} from '../api'
import { useNotifications } from './useNotifications'
import { useNotificationDetail } from './useNotificationDetail'
import { buildNotificationColumns } from '../components/table/NotificationsColumns'
import {
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_TRIGGER_OPTIONS,
  NOTIFICATIONS_PAGE_SIZE_OPTIONS,
} from '../constants'

const DEFAULT_PAGE_SIZE = 25

type SelectedClientFilter = {
  id: number
  name: string
}

export const useNotificationsPage = () => {
  const { isAdvisor } = useRole()
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage: setUrlPage } = useSearchParamFilters()

  const page = getPage(FIRST_PAGE)
  const pageSize = parsePositiveInt(searchParams.get('page_size'), DEFAULT_PAGE_SIZE)
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
  const usersQuery = useActiveUserOptions()
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const userOptions = useMemo(
    () => [
      { value: '', label: 'כל המשתמשים' },
      ...(usersQuery.data?.items ?? []).map((user) => ({
        value: String(user.id),
        label: user.full_name,
      })),
    ],
    [usersQuery.data?.items],
  )

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
        disabled: usersQuery.isPending,
      },
      {
        type: 'select' as const,
        key: 'page_size',
        label: 'כמות בעמוד',
        options: NOTIFICATIONS_PAGE_SIZE_OPTIONS,
        defaultValue: String(DEFAULT_PAGE_SIZE),
      },
    ],
    [userOptions, usersQuery.isPending],
  )

  const filterValues = {
    client_record_id: clientRecordId,
    client_name: clientName,
    trigger: trigger ?? '',
    status: status ?? '',
    created_after: dateFrom,
    created_before: dateTo,
    triggered_by: triggeredBy,
    page_size: String(pageSize),
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
      page_size: '',
    })

  return {
    status: {
      isLoading: isPending,
      isFetching,
      error: error ? 'שגיאה בטעינת הודעות' : null,
      loadingMessage: 'טוען הודעות...',
    },
    headerProps: {
      title: 'הודעות',
      description: 'מרכז הודעות שנשלחו ונרשמו במערכת',
    },
    permissions: { isAdvisor },
    filters: {
      fields: filterFields,
      values: filterValues,
      onChange: (key: string, value: string) => setFilter(key, value),
      onMultiChange: (updates: Record<string, string>) => setFilters(updates),
      onReset: resetFilters,
      gridClass: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-7',
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
        message: 'אין הודעות להצגה',
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
