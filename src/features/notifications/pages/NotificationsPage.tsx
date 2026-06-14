import { useCallback, useMemo, useState } from 'react'
import { Bell, Eye, Plus, Send } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table/RowActions'
import type { Column } from '@/components/ui/table'
import { DetailDrawer, DrawerField, DrawerSection } from '@/components/ui/overlays/DetailDrawer'
import { FIRST_PAGE } from '@/constants/pagination.constants'
import { useRole } from '@/hooks/useRole'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parsePositiveInt } from '@/utils/utils'
import { formatDateTime } from '@/utils/utils'
import {
  CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS,
  TRIGGER_LABELS,
  SendNotificationModal,
  isNotificationStatus,
  isNotificationTrigger,
  useNotifications,
  useNotificationDetail,
  type ListNotificationsParams,
  type NotificationItem,
} from '@/features/notifications'
import { useActiveUserOptions } from '@/features/users'
import {
  NOTIFICATION_DOMAIN_LABELS,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_STATUS_VARIANTS,
  NOTIFICATION_TRIGGER_OPTIONS,
  NOTIFICATIONS_PAGE_SIZE_OPTIONS,
} from './NotificationsPage.constants'

const ENGLISH_TEXT_PATTERN = /[A-Za-z]/

const getTriggerLabel = (item: Pick<NotificationItem, 'trigger' | 'trigger_label'>) =>
  item.trigger_label || TRIGGER_LABELS[item.trigger] || 'הודעה'

const getDomainLabel = (domain: string | null | undefined) => {
  if (!domain) return 'כללי'
  if (NOTIFICATION_DOMAIN_LABELS[domain]) return NOTIFICATION_DOMAIN_LABELS[domain]
  return ENGLISH_TEXT_PATTERN.test(domain) ? 'כללי' : domain
}

type SelectedClientFilter = {
  id: number
  name: string
}

export const NotificationsPage: React.FC = () => {
  const { isAdvisor } = useRole()
  const { searchParams, setFilter, setFilters, setPage: setUrlPage } = useSearchParamFilters()

  const page = parsePositiveInt(searchParams.get('page'), FIRST_PAGE)
  const pageSize = parsePositiveInt(searchParams.get('page_size'), 25)
  const triggerParam = searchParams.get('trigger')
  const statusParam = searchParams.get('status')
  const trigger = isNotificationTrigger(triggerParam) ? triggerParam : undefined
  const status = isNotificationStatus(statusParam) ? statusParam : undefined
  const dateFrom = searchParams.get('created_after') ?? ''
  const dateTo = searchParams.get('created_before') ?? ''
  const triggeredBy = searchParams.get('triggered_by') ?? ''
  const clientRecordId = searchParams.get('client_record_id') ?? ''
  const clientName = searchParams.get('client_name') ?? ''

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

  const { data, isPending, error } = useNotifications(params)
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

  const columns = useMemo<Column<NotificationItem>[]>(
    () => [
      {
        key: 'created_at',
        header: 'תאריך',
        render: (item) => <span className="text-sm text-gray-700">{formatDateTime(item.created_at)}</span>,
      },
      {
        key: 'trigger',
        header: 'סוג',
        render: (item) => (
          <div className="min-w-0 text-right">
            <div className="text-sm font-medium text-gray-900">{getTriggerLabel(item)}</div>
            <div className="text-xs text-gray-400">{getDomainLabel(item.domain_label)}</div>
          </div>
        ),
      },
      {
        key: 'client',
        header: 'לקוח',
        render: (item) => (
          <span className="text-sm text-gray-700">{item.client_name ?? `#${item.client_record_id}`}</span>
        ),
      },
      {
        key: 'status',
        header: 'סטטוס',
        render: (item) => (
          <Badge variant={NOTIFICATION_STATUS_VARIANTS[item.status]} size="sm">
            {NOTIFICATION_STATUS_LABELS[item.status]}
          </Badge>
        ),
      },
      {
        key: 'recipient',
        header: 'נמען',
        render: (item) => <span className="text-sm text-gray-600">{item.recipient ?? '—'}</span>,
      },
    ],
    [],
  )

  const openSendModal = useCallback((client?: SelectedClientFilter | null) => {
    setSendClient(client ?? null)
    setSendOpen(true)
  }, [])

  const closeSendModal = useCallback(() => {
    setSendOpen(false)
    setSendClient(null)
  }, [])

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
        defaultValue: '25',
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

  const handleFilterChange = (key: string, value: string) => setFilter(key, value)
  const handleFilterMultiChange = (updates: Record<string, string>) => setFilters(updates)
  const handleFilterReset = () =>
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

  const tableColumns = useMemo<Column<NotificationItem>[]>(
    () => [
      ...columns,
      {
        key: 'actions',
        header: '',
        align: 'center',
        render: (item) => (
          <RowActionsMenu ariaLabel="פעולות הודעה">
            <RowActionItem
              label="צפייה בפרטים"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => setSelectedId(item.id)}
            />
            {isAdvisor && (
              <RowActionItem
                label="שליחת הודעה ללקוח"
                icon={<Send className="h-4 w-4" />}
                onClick={() =>
                  openSendModal({ id: item.client_record_id, name: item.client_name ?? `#${item.client_record_id}` })
                }
              />
            )}
          </RowActionsMenu>
        ),
      },
    ],
    [columns, isAdvisor, openSendModal],
  )

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="הודעות"
        description="מרכז הודעות שנשלחו ונרשמו במערכת"
        actions={
          isAdvisor ? (
            <Button variant="ghost" size="sm" onClick={() => openSendModal()}>
              שליחת הודעה
              <Plus className="h-3.5 w-3.5" />
            </Button>
          ) : undefined
        }
      />

      <FilterPanel
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onMultiChange={handleFilterMultiChange}
        onReset={handleFilterReset}
        gridClass="grid-cols-1 md:grid-cols-2 xl:grid-cols-7"
      />

      <PaginatedDataTable
        data={items}
        columns={tableColumns}
        getRowKey={(item) => item.id}
        onRowClick={(item) => setSelectedId(item.id)}
        isLoading={isPending}
        error={error ? 'שגיאה בטעינת הודעות' : null}
        page={page}
        pageSize={pageSize}
        total={total}
        label="הודעות"
        onPageChange={setUrlPage}
        showPagination={total > 0}
        emptyMessage="אין הודעות להצגה"
        emptyState={{
          icon: Bell,
          message: error ? 'שגיאה בטעינת הודעות' : 'אין הודעות להצגה',
          variant: error ? 'error' : 'default',
        }}
      />

      <DetailDrawer
        open={selectedId !== null}
        title={selected?.subject_snapshot || selected?.trigger_label || 'הודעה'}
        subtitle={selected ? formatDateTime(selected.created_at) : undefined}
        onClose={() => setSelectedId(null)}
        footer={
          selected && isAdvisor ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  openSendModal({
                    id: selected.client_record_id,
                    name: selected.client_name ?? `#${selected.client_record_id}`,
                  })
                }
              >
                שליחת הודעה ללקוח
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedId !== null && selectedLoading && <Alert variant="info" message="טוען את פרטי ההודעה..." />}
        {selectedError && <Alert variant="error" message="שגיאה בטעינת פרטי ההודעה" />}
        {selected && (
          <div className="space-y-4">
            <DrawerSection title="פרטים">
              <DrawerField label="סוג" value={getTriggerLabel(selected)} />
              <DrawerField label="תחום" value={getDomainLabel(selected.domain_label)} />
              <DrawerField label="לקוח" value={selected.client_name ?? `#${selected.client_record_id}`} />
              <DrawerField label="נמען" value={selected.recipient ?? '—'} />
              <DrawerField label="סטטוס" value={NOTIFICATION_STATUS_LABELS[selected.status]} />
            </DrawerSection>
            <DrawerSection title="תוכן">
              <div className="whitespace-pre-wrap py-3 text-sm leading-7 text-gray-800">
                {selected.content_snapshot || 'תוכן ההודעה לא זמין'}
              </div>
            </DrawerSection>
          </div>
        )}
      </DetailDrawer>

      {isAdvisor && (
        <SendNotificationModal
          open={sendOpen}
          onClose={closeSendModal}
          clientRecordId={sendClient?.id}
          allowedTriggers={CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS}
        />
      )}
    </div>
  )
}

NotificationsPage.displayName = 'NotificationsPage'
