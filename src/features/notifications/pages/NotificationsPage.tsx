import { useMemo, useState } from 'react'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/primitives/Card'
import { Badge, type BadgeVariant } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { DataTable, type Column } from '@/components/ui/table'
import { DetailDrawer, DrawerField, DrawerSection } from '@/components/ui/overlays/DetailDrawer'
import { formatDateTime } from '@/utils/utils'
import {
  MANUAL_NOTIFICATION_TRIGGERS,
  TRIGGER_LABELS,
  useNotificationsPaginated,
  type ListNotificationsParams,
  type NotificationItem,
  type NotificationStatus,
  type NotificationTrigger,
} from '@/features/notifications'

const STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: 'ממתינה',
  sent: 'נשלחה',
  failed: 'נכשלה',
  skipped: 'דולגה',
}

const STATUS_VARIANTS: Record<NotificationStatus, BadgeVariant> = {
  pending: 'info',
  sent: 'success',
  failed: 'error',
  skipped: 'warning',
}

const TRIGGER_OPTIONS = MANUAL_NOTIFICATION_TRIGGERS.map((trigger) => ({
  value: trigger,
  label: TRIGGER_LABELS[trigger],
}))

export const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<25 | 50>(25)
  const [trigger, setTrigger] = useState<NotificationTrigger | ''>('')
  const [status, setStatus] = useState<NotificationStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [triggeredBy, setTriggeredBy] = useState('')
  const [selected, setSelected] = useState<NotificationItem | null>(null)

  const params: ListNotificationsParams = {
    page,
    page_size: pageSize,
    trigger,
    status,
    date_from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
    date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
    triggered_by: triggeredBy ? Number(triggeredBy) : undefined,
  }

  const { data, isPending, error } = useNotificationsPaginated(params)
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
            <div className="text-sm font-medium text-gray-900">{item.trigger_label || TRIGGER_LABELS[item.trigger]}</div>
            <div className="text-xs text-gray-400">{item.domain_label || 'כללי'}</div>
          </div>
        ),
      },
      {
        key: 'client',
        header: 'לקוח',
        render: (item) => <span className="text-sm text-gray-700">{item.client_name ?? `#${item.client_record_id}`}</span>,
      },
      {
        key: 'status',
        header: 'סטטוס',
        render: (item) => (
          <Badge variant={STATUS_VARIANTS[item.status]} size="sm">
            {STATUS_LABELS[item.status]}
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

  const resetToFirstPage = (fn: () => void) => {
    fn()
    setPage(1)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="הודעות" description="מרכז הודעות שנשלחו ונרשמו במערכת" />

      <Card>
        <div className="grid gap-3 md:grid-cols-6">
          <Select
            label="סוג הודעה"
            value={trigger}
            onChange={(e) => resetToFirstPage(() => setTrigger(e.target.value as NotificationTrigger | ''))}
          >
            <option value="">כל הסוגים</option>
            {TRIGGER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            label="סטטוס"
            value={status}
            onChange={(e) => resetToFirstPage(() => setStatus(e.target.value as NotificationStatus | ''))}
          >
            <option value="">כל הסטטוסים</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input label="מתאריך" type="date" value={dateFrom} onChange={(e) => resetToFirstPage(() => setDateFrom(e.target.value))} />
          <Input label="עד תאריך" type="date" value={dateTo} onChange={(e) => resetToFirstPage(() => setDateTo(e.target.value))} />
          <Input label="מזהה משתמש שלח" type="number" value={triggeredBy} onChange={(e) => resetToFirstPage(() => setTriggeredBy(e.target.value))} />
          <Select
            label="כמות בעמוד"
            value={String(pageSize)}
            onChange={(e) => resetToFirstPage(() => setPageSize(Number(e.target.value) as 25 | 50))}
          >
            <option value="25">25</option>
            <option value="50">50</option>
          </Select>
        </div>
      </Card>

      <DataTable
        data={items}
        columns={columns}
        getRowKey={(item) => item.id}
        onRowClick={setSelected}
        isLoading={isPending}
        emptyMessage="אין הודעות להצגה"
        emptyState={{
          icon: Bell,
          message: error ? 'שגיאה בטעינת הודעות' : 'אין הודעות להצגה',
          variant: error ? 'error' : 'default',
        }}
      />

      {total > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            עמוד {page} מתוך {totalPages} · {total} הודעות
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronRight className="h-4 w-4" />
              הקודם
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              הבא
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <DetailDrawer
        open={selected !== null}
        title={selected?.subject_snapshot || selected?.trigger_label || 'הודעה'}
        subtitle={selected ? formatDateTime(selected.created_at) : undefined}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-4">
            <DrawerSection title="פרטים">
              <DrawerField label="סוג" value={selected.trigger_label || TRIGGER_LABELS[selected.trigger]} />
              <DrawerField label="תחום" value={selected.domain_label || 'כללי'} />
              <DrawerField label="לקוח" value={selected.client_name ?? `#${selected.client_record_id}`} />
              <DrawerField label="נמען" value={selected.recipient ?? '—'} />
              <DrawerField label="סטטוס" value={STATUS_LABELS[selected.status]} />
            </DrawerSection>
            <DrawerSection title="תוכן">
              <div className="whitespace-pre-wrap py-3 text-sm leading-7 text-gray-800">
                {selected.content_snapshot || 'תוכן ההודעה לא זמין'}
              </div>
            </DrawerSection>
          </div>
        )}
      </DetailDrawer>
    </div>
  )
}

NotificationsPage.displayName = 'NotificationsPage'
