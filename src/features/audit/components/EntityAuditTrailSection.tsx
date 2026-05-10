import { useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { formatDateTime } from '@/utils/utils'
import {
  ENTITY_TYPE_LABELS,
  CLIENT_STATUS_LABELS,
  VAT_TYPE_LABELS,
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
} from '@/features/clients/constants'
import type { EntityAuditLogEntry, EntityAuditType } from '../api'
import { useEntityAuditTrail } from '../hooks/useEntityAuditTrail'

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
  annual_report_detail_updated: 'עודכנו פרטי דוח',
  annual_report_deadline_updated: 'עודכן מועד הגשה',
  annex_line_added: 'נוספה שורת נספח',
  annex_line_updated: 'עודכנה שורת נספח',
  annex_line_deleted: 'נמחקה שורת נספח',
}

const FIELD_LABELS: Record<string, string> = {
  full_name: 'שם לקוח',
  client_record_id: 'לקוח',
  client_type: 'סוג לקוח',
  id_number: 'מספר מזהה',
  entity_type: 'סוג ישות',
  business_name: 'שם עסק',
  business_id: 'עסק',
  office_client_number: 'מספר לקוח',
  status: 'סטטוס',
  amount: 'סכום',
  charge_type: 'סוג חיוב',
  category: 'קטגוריה',
  description: 'תיאור',
  form_type: 'סוג טופס',
  line_id: 'שורת דיווח',
  period: 'תקופה',
  months_covered: 'חודשים',
  source_type: 'סוג הכנסה',
  tax_year: 'שנת מס',
  vat_reporting_frequency: 'תדירות מע״מ',
  advance_payment_frequency: 'תדירות מקדמות',
  advance_rate: 'שיעור מקדמות',
  accountant_id: 'רואה חשבון',
  phone: 'טלפון',
  email: 'אימייל',
  address_street: 'רחוב',
  address_building_number: 'מספר בית',
  address_apartment: 'דירה',
  address_city: 'עיר',
  address_zip_code: 'מיקוד',
  opened_at: 'נפתח בתאריך',
  closed_at: 'נסגר בתאריך',
  issued_at: 'תאריך הנפקה',
  paid_at: 'תאריך תשלום',
  canceled_at: 'תאריך ביטול',
  cancellation_reason: 'סיבת ביטול',
  custom_deadline_note: 'הערת מועד מותאם',
  data: 'נתונים',
  deadline_type: 'סוג מועד',
  donation_amount: 'תרומות',
  filing_deadline: 'מועד הגשה',
  internal_notes: 'הערות פנימיות',
  line_number: 'מספר שורה',
  notes: 'הערות',
  schedule: 'נספח',
  annual_revenue: 'מחזור שנתי',
  advance_rate_updated_at: 'תאריך עדכון שיעור מקדמות',
}

const FIELD_VALUE_LABELS: Partial<Record<string, Record<string, string>>> = {
  entity_type: ENTITY_TYPE_LABELS,
  client_type: ENTITY_TYPE_LABELS,
  status: CLIENT_STATUS_LABELS,
  vat_reporting_frequency: VAT_TYPE_LABELS,
  advance_payment_frequency: ADVANCE_PAYMENT_FREQUENCY_LABELS,
}

const translateValue = (field: string | null, value: string): string =>
  (field ? FIELD_VALUE_LABELS[field]?.[value] : undefined) ?? value

const shorten = (value: string): string => (value.length > 120 ? `${value.slice(0, 117)}...` : value)

const stringifyCompact = (value: unknown): string => {
  try {
    return shorten(JSON.stringify(value))
  } catch {
    return '—'
  }
}

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

const formatValue = (value: unknown, field: string | null = null): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return translateValue(field, value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return stringifyCompact(value)
}

const formatFieldLabel = (key: string): string => FIELD_LABELS[key] ?? key

const formatParsedDiff = (oldValue: unknown, newValue: unknown): string | null => {
  const oldPayload = unwrapScalarPayload(oldValue)
  const newPayload = unwrapScalarPayload(newValue)

  if (isRecord(oldPayload) || isRecord(newPayload)) {
    const oldRecord = isRecord(oldPayload) ? oldPayload : {}
    const newRecord = isRecord(newPayload) ? newPayload : {}
    const keys = Array.from(new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]))

    return keys
      .map((key) => {
        const label = formatFieldLabel(key)
        const oldText = formatValue(oldRecord[key], key)
        const newText = formatValue(newRecord[key], key)
        if (!(key in oldRecord)) return `${label}: ${newText}`
        if (!(key in newRecord)) return `${label}: ${oldText}`
        return `${label}: ${oldText} → ${newText}`
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
  const parsedText = oldParsed === undefined || newParsed === undefined ? null : formatParsedDiff(oldParsed, newParsed)
  const rawText = [entry.old_value, entry.new_value]
    .filter(Boolean)
    .map((value) => shorten(value ?? ''))
    .join(' → ')
  const details = parsedText || rawText

  const fallbackDetails =
    {
      created: 'ללא פרטים נוספים',
      deleted: 'ללא פרטים נוספים',
      restored: 'ללא פרטים נוספים',
    }[entry.action] ?? '—'

  return [details || fallbackDetails, entry.note].filter(Boolean).join('; ')
}

type EntityAuditTrailSectionProps = {
  entityType: EntityAuditType
  entityId: number
  title?: string
  subtitle?: string
  compact?: boolean
}

export const EntityAuditTrailSection: React.FC<EntityAuditTrailSectionProps> = ({
  entityType,
  entityId,
  title = 'היסטוריית שינויים',
  subtitle = 'פעולות שבוצעו על הרשומה',
  compact = false,
}) => {
  const [page, setPage] = useState(0)
  const { items, total, isError, isFetching, isPending } = useEntityAuditTrail(entityType, entityId, page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const maxPage = totalPages - 1
  const safePage = Math.min(page, maxPage)
  const cardClassName = compact ? 'shadow-none rounded-lg' : 'shadow-sm'

  const renderState = (message: string, className = 'text-gray-400') => (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <p className={`py-8 text-center text-sm ${className}`}>{message}</p>
    </Card>
  )

  if (isPending) {
    return renderState('טוען...')
  }

  if (isError) {
    return renderState('שגיאה בטעינת ההיסטוריה', 'text-negative-600')
  }

  if (total === 0) {
    return renderState('אין היסטוריית שינויים')
  }

  return (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
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
    </Card>
  )
}

EntityAuditTrailSection.displayName = 'EntityAuditTrailSection'
