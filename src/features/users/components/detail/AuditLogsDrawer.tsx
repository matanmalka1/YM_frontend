import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { DatePicker } from '../../../../components/ui/inputs/DatePicker'
import { SkeletonBlock } from '../../../../components/ui/primitives/SkeletonBlock'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import { usersApi, usersQK } from '../../api'
import { formatDateTime } from '../../../../utils/utils'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import type { ListAuditLogsParams } from '../../api'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { USERS_MESSAGES } from '../../messages'
import { USERS_ERROR_MESSAGES } from '../../errorMessages'

const auditActionLabel: Record<string, string> = USERS_MESSAGES.auditLog.actionLabels

interface AuditLogsDrawerProps {
  open: boolean
  onClose: () => void
}

export const AuditLogsDrawer: React.FC<AuditLogsDrawerProps> = ({ open, onClose }) => {
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const params: ListAuditLogsParams = {
    page,
    page_size: PAGE_SIZE,
    created_after: fromDate ? `${fromDate}T00:00:00` : undefined,
    created_before: toDate ? `${toDate}T23:59:59` : undefined,
  }

  const { data, isPending, isError } = useQuery({
    queryKey: usersQK.auditLogs(params),
    queryFn: () => usersApi.listAuditLogs(params),
    enabled: open,
  })

  const logs = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = page * PAGE_SIZE < total

  const handleClose = () => {
    setPage(1)
    setFromDate('')
    setToDate('')
    onClose()
  }

  const handleFromDateChange = (value: string) => {
    setFromDate(value)
    setPage(1)
  }

  const handleToDateChange = (value: string) => {
    setToDate(value)
    setPage(1)
  }

  return (
    <DetailDrawer
      open={open}
      onClose={handleClose}
      title={USERS_MESSAGES.auditLog.title}
      subtitle={total > 0 ? USERS_MESSAGES.auditLog.recordsCount(total) : undefined}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DatePicker label={USERS_MESSAGES.auditLog.fromDate} value={fromDate} onChange={handleFromDateChange} compact />
        <DatePicker label={USERS_MESSAGES.auditLog.toDate} value={toDate} onChange={handleToDateChange} compact />
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} width="w-full" height="h-14" rounded="xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-negative-600">{USERS_ERROR_MESSAGES.auditLog.loadError}</p>}

      {!isPending && !isError && logs.length === 0 && (
        <p className="text-sm text-gray-500">{USERS_MESSAGES.auditLog.empty}</p>
      )}

      {!isPending && !isError && logs.length > 0 && (
        <div className="space-y-3">
          <Timeline>
            {logs.map((log) => (
              <TimelineEntry key={log.id}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {auditActionLabel[log.action] ?? log.action}
                    </span>
                    <Badge variant={log.status === 'success' ? 'positive' : 'negative'}>
                      {log.status === 'success' ? USERS_MESSAGES.auditLog.success : USERS_MESSAGES.auditLog.failure}
                    </Badge>
                  </div>
                  {log.email && (
                    <p className="text-xs text-gray-500">{USERS_MESSAGES.auditLog.emailPrefix(log.email)}</p>
                  )}
                  {log.reason && (
                    <p className="text-xs text-gray-500">{USERS_MESSAGES.auditLog.reasonPrefix(log.reason)}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
                </div>
              </TimelineEntry>
            ))}
          </Timeline>

          {hasMore && (
            <Button variant="outline" fullWidth onClick={() => setPage((p) => p + 1)} disabled={isPending}>
              {USERS_MESSAGES.auditLog.loadMore(total - page * PAGE_SIZE)}
            </Button>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button variant="outline" fullWidth onClick={handleClose}>
          {GLOBAL_UI_MESSAGES.actions.close}
        </Button>
      </div>
    </DetailDrawer>
  )
}
