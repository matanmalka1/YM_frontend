import { useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { formatDateTime } from '@/utils/utils'
import type { EntityAuditLogEntry } from '../../api/contracts'
import { useClientAuditTrail } from '../../hooks/useClientAuditTrail'

const PAGE_SIZE = 50

const ACTION_LABELS: Record<string, string> = {
  created: 'נוצר',
  updated: 'עודכן',
  deleted: 'נמחק',
  restored: 'שוחזר',
  status_changed: 'שינוי סטטוס',
  issued: 'הונפק',
  paid: 'שולם',
  canceled: 'בוטל',
  income_added: 'נוספה הכנסה',
  income_updated: 'עודכנה הכנסה',
  income_deleted: 'נמחקה הכנסה',
  expense_added: 'נוספה הוצאה',
  expense_updated: 'עודכנה הוצאה',
  expense_deleted: 'נמחקה הוצאה',
}

const shorten = (value: string): string => (value.length > 120 ? `${value.slice(0, 117)}...` : value)

const parseAuditValue = (value: string | null): unknown => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const unwrapScalarPayload = (value: unknown): unknown => {
  if (isRecord(value) && Object.keys(value).length === 1 && 'value' in value) return value.value
  return value
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const formatParsedDiff = (oldValue: unknown, newValue: unknown): string | null => {
  const oldPayload = unwrapScalarPayload(oldValue)
  const newPayload = unwrapScalarPayload(newValue)

  if (isRecord(oldPayload) || isRecord(newPayload)) {
    const oldRecord = isRecord(oldPayload) ? oldPayload : {}
    const newRecord = isRecord(newPayload) ? newPayload : {}
    const keys = Array.from(new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]))

    return keys
      .map((key) => {
        const oldText = formatValue(oldRecord[key])
        const newText = formatValue(newRecord[key])
        if (!(key in oldRecord)) return `${key}: ${newText}`
        if (!(key in newRecord)) return `${key}: ${oldText}`
        return `${key}: ${oldText} → ${newText}`
      })
      .filter(Boolean)
      .join('; ')
  }

  if (oldPayload !== null && oldPayload !== undefined && newPayload !== null && newPayload !== undefined) {
    return `${formatValue(oldPayload)} → ${formatValue(newPayload)}`
  }
  if (newPayload !== null && newPayload !== undefined) return formatValue(newPayload)
  if (oldPayload !== null && oldPayload !== undefined) return formatValue(oldPayload)
  return null
}

const formatAuditDetails = (entry: EntityAuditLogEntry): string => {
  const oldParsed = parseAuditValue(entry.old_value)
  const newParsed = parseAuditValue(entry.new_value)
  const parsedText =
    oldParsed === undefined || newParsed === undefined ? null : formatParsedDiff(oldParsed, newParsed)
  const rawText = [entry.old_value, entry.new_value].filter(Boolean).map((value) => shorten(value ?? '')).join(' → ')
  const details = parsedText || rawText

  return [details, entry.note].filter(Boolean).join('; ')
}

type ClientAuditTrailSectionProps = {
  clientId: number
}

export const ClientAuditTrailSection: React.FC<ClientAuditTrailSectionProps> = ({ clientId }) => {
  const [page, setPage] = useState(0)
  const { items, total, isError, isFetching, isPending } = useClientAuditTrail(clientId, page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const maxPage = totalPages - 1
  const safePage = Math.min(page, maxPage)

  if (isPending) return <p className="py-8 text-center text-sm text-gray-400">טוען...</p>
  if (isError) return <p className="py-8 text-center text-sm text-negative-600">שגיאה בטעינת ההיסטוריה</p>
  if (total === 0) return <p className="py-8 text-center text-sm text-gray-400">אין היסטוריית שינויים</p>

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-100" dir="rtl">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-right">תאריך</th>
              <th className="px-4 py-3 text-right">פעולה</th>
              <th className="px-4 py-3 text-right">פרטים</th>
              <th className="px-4 py-3 text-right">בוצע ע&quot;י</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                  {formatDateTime(entry.performed_at)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{ACTION_LABELS[entry.action] ?? entry.action}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xl">{formatAuditDetails(entry)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {entry.performed_by_name ?? `#${entry.performed_by}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500" dir="rtl">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
            disabled={safePage === 0 || isFetching}
          >
            הקודם
          </Button>
          <span>{isFetching ? 'טוען...' : `עמוד ${safePage + 1} מתוך ${totalPages}`}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPage((currentPage) => Math.min(maxPage, currentPage + 1))}
            disabled={safePage >= maxPage || isFetching}
          >
            הבא
          </Button>
        </div>
      )}
    </div>
  )
}

ClientAuditTrailSection.displayName = 'ClientAuditTrailSection'
