import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DetailDrawer } from '../../../components/ui/overlays/DetailDrawer'
import { Badge } from '../../../components/ui/primitives/Badge'
import { Button } from '../../../components/ui/primitives/Button'
import { DatePicker } from '../../../components/ui/inputs/DatePicker'
import { SkeletonBlock } from '../../../components/ui/primitives/SkeletonBlock'
import { usersApi, usersQK } from '../api'
import { formatDateTime } from '../../../utils/utils'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import type { ListAuditLogsParams } from '../api'

const auditActionLabel: Record<string, string> = {
  login_success: 'כניסה למערכת',
  login_failure: 'כניסה נכשלה',
  user_created: 'משתמש נוצר',
  user_updated: 'פרטים עודכנו',
  user_activated: 'הופעל',
  user_deactivated: 'הושבת',
  password_reset: 'סיסמה אופסה',
  logout: 'יציאה מהמערכת',
}

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
    from: fromDate ? `${fromDate}T00:00:00` : undefined,
    to: toDate ? `${toDate}T23:59:59` : undefined,
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
      title="לוג ביקורת משתמשים"
      subtitle={total > 0 ? `${total} רשומות` : undefined}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DatePicker label="מתאריך" value={fromDate} onChange={handleFromDateChange} compact />
        <DatePicker label="עד תאריך" value={toDate} onChange={handleToDateChange} compact />
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} width="w-full" height="h-14" rounded="xl" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-negative-600">שגיאה בטעינת לוג הביקורת</p>}

      {!isPending && !isError && logs.length === 0 && <p className="text-sm text-gray-500">אין רשומות להצגה</p>}

      {!isPending && !isError && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">{auditActionLabel[log.action] ?? log.action}</span>
                <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                  {log.status === 'success' ? 'הצלחה' : 'כישלון'}
                </Badge>
              </div>
              {log.email && <p className="text-xs text-gray-500">אימייל: {log.email}</p>}
              {log.reason && <p className="text-xs text-gray-500">סיבה: {log.reason}</p>}
              <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
            </div>
          ))}

          {hasMore && (
            <Button variant="outline" fullWidth onClick={() => setPage((p) => p + 1)} disabled={isPending}>
              טען עוד ({total - page * PAGE_SIZE} נותרו)
            </Button>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button variant="outline" fullWidth onClick={handleClose}>
          סגירה
        </Button>
      </div>
    </DetailDrawer>
  )
}
