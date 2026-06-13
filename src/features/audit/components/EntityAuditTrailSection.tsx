import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/primitives/Card'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { usersApi, usersQK } from '@/features/users'
import { useRole } from '../../../hooks/useRole'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'
import type { EntityAuditLogEntry, EntityAuditType } from '../api'
import { useEntityAuditTrail } from '../hooks/useEntityAuditTrail'
import { AuditTrailTable } from './AuditTrailTable'

export type FieldValueLabels = Partial<Record<string, Record<string, string>>>

const EMPTY_FIELD_VALUE_LABELS: FieldValueLabels = {}
const AUDIT_USERS_LIST_PARAMS = { page: 1, page_size: 200 }

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

// Mirrors the action values persisted for each entity type.
const ACTIONS_BY_ENTITY_TYPE: Record<EntityAuditType, string[]> = {
  client: ['created', 'updated', 'deleted', 'restored'],
  business: ['created', 'updated', 'deleted', 'restored'],
  charge: ['created', 'updated', 'deleted', 'restored', 'issued', 'paid', 'canceled'],
  annual_report: [
    'created',
    'updated',
    'deleted',
    'restored',
    'status_changed',
    'annual_report_detail_updated',
    'annual_report_deadline_updated',
    'annex_line_added',
    'annex_line_updated',
    'annex_line_deleted',
    'income_added',
    'income_updated',
    'income_deleted',
    'expense_added',
    'expense_updated',
    'expense_deleted',
  ],
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

const translateValue = (field: string | null, value: string, labels: FieldValueLabels): string =>
  (field ? labels[field]?.[value] : undefined) ?? value

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

const formatFieldLabel = (key: string): string => FIELD_LABELS[key] ?? key

const makeAuditFormatter = (labels: FieldValueLabels) => {
  const formatValue = (value: unknown, field: string | null = null): string => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string') return translateValue(field, value, labels)
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return stringifyCompact(value)
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
          const label = formatFieldLabel(key)
          const oldText = formatValue(oldRecord[key], key)
          const newText = formatValue(newRecord[key], key)
          if (!(key in oldRecord)) return `${label}: ${newText}`
          if (!(key in newRecord)) return `${label}: ${oldText}`
          if (oldText === newText) return null
          return `${label}: ${oldText} → ${newText}`
        })
        .filter(Boolean)
        .join('; ')
    }

    if (oldPayload !== null && oldPayload !== undefined && newPayload !== null && newPayload !== undefined) {
      const oldText = formatValue(oldPayload)
      const newText = formatValue(newPayload)
      return oldText === newText ? null : `${oldText} → ${newText}`
    }
    if (newPayload !== null && newPayload !== undefined) return formatValue(newPayload)
    if (oldPayload !== null && oldPayload !== undefined) return formatValue(oldPayload)
    return null
  }

  return (entry: EntityAuditLogEntry): string => {
    const oldParsed = parseAuditValue(entry.old_value)
    const newParsed = parseAuditValue(entry.new_value)
    const parseFailed = oldParsed === undefined || newParsed === undefined
    const parsedText = parseFailed ? null : formatParsedDiff(oldParsed, newParsed)
    const rawText = [entry.old_value, entry.new_value]
      .filter(Boolean)
      .map((value) => shorten(value ?? ''))
      .join(' → ')
    const details = parseFailed ? rawText : parsedText

    const fallbackDetails =
      {
        created: 'ללא פרטים נוספים',
        deleted: 'ללא פרטים נוספים',
        restored: 'ללא פרטים נוספים',
      }[entry.action] ?? '—'

    return [details || fallbackDetails, entry.note].filter(Boolean).join('; ')
  }
}

type EntityAuditTrailSectionProps = {
  entityType: EntityAuditType
  entityId: number
  title?: string
  subtitle?: string
  compact?: boolean
  fieldValueLabels?: FieldValueLabels
}

export const EntityAuditTrailSection: React.FC<EntityAuditTrailSectionProps> = ({
  entityType,
  entityId,
  title = 'היסטוריית שינויים',
  subtitle = 'פעולות שבוצעו על הרשומה',
  compact = false,
  fieldValueLabels = EMPTY_FIELD_VALUE_LABELS,
}) => {
  const formatAuditDetails = useMemo(() => makeAuditFormatter(fieldValueLabels), [fieldValueLabels])
  const { searchParams, setFilter, setSearchParams } = useSearchParamFilters()

  const keyPrefix = `${entityType}_${entityId}_audit_`
  const actionKey = `${keyPrefix}action`
  const userIdKey = `${keyPrefix}user_id`
  const createdAfterKey = `${keyPrefix}created_after`
  const createdBeforeKey = `${keyPrefix}created_before`
  const pageKey = `${keyPrefix}page`

  const action = searchParams.get(actionKey) ?? ''
  const userId = searchParams.get(userIdKey) ?? ''
  const userIdValue = parsePositiveInt(userId, 0)
  const selectedUserId = userIdValue ? String(userIdValue) : ''
  const createdAfter = searchParams.get(createdAfterKey) ?? ''
  const createdBefore = searchParams.get(createdBeforeKey) ?? ''
  const page = parsePositiveInt(searchParams.get(pageKey), 1) - 1
  const searchParamsString = searchParams.toString()

  const handleFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete(pageKey)
    setSearchParams(next)
  }

  const handleFilterReset = () => {
    const next = new URLSearchParams(searchParams)
    next.delete(actionKey)
    next.delete(userIdKey)
    next.delete(createdAfterKey)
    next.delete(createdBeforeKey)
    next.delete(pageKey)
    setSearchParams(next)
  }

  const handlePageChange = (nextPage: number) => setFilter(pageKey, String(nextPage + 1), false)

  const { isAdvisor } = useRole()

  const { data: usersData } = useQuery({
    queryKey: usersQK.list(AUDIT_USERS_LIST_PARAMS),
    queryFn: () => usersApi.list(AUDIT_USERS_LIST_PARAMS),
    enabled: isAdvisor,
  })

  const availableActions = ACTIONS_BY_ENTITY_TYPE[entityType] ?? Object.keys(ACTION_LABELS)
  const selectedAction = availableActions.includes(action) ? action : ''
  const actionOptions = [
    { value: '', label: 'כל הפעולות' },
    ...availableActions.map((value) => ({ value, label: ACTION_LABELS[value] ?? value })),
  ]

  const hasActiveFilters = Boolean(selectedAction || selectedUserId || createdAfter || createdBefore)

  const filters = {
    action: selectedAction || undefined,
    user_id: userIdValue || undefined,
    created_after: createdAfter || undefined,
    // End-of-day so the selected end date's events are included (created_at is a datetime)
    created_before: createdBefore ? `${createdBefore}T23:59:59.999` : undefined,
  }

  const { items, total, isError, isFetching, isPending } = useEntityAuditTrail(
    entityType,
    entityId,
    page,
    PAGE_SIZE,
    filters,
  )
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const maxPage = totalPages - 1
  const safePage = Math.min(page, maxPage)
  const cardClassName = compact ? 'shadow-none rounded-lg' : 'shadow-sm'

  useEffect(() => {
    if (isPending || page <= maxPage) return
    const next = new URLSearchParams(searchParamsString)
    if (maxPage === 0) next.delete(pageKey)
    else next.set(pageKey, String(maxPage + 1))
    setSearchParams(next, { replace: true })
  }, [isPending, maxPage, page, pageKey, searchParamsString, setSearchParams])

  const auditActors = new Map<number, string>()
  for (const entry of items) {
    auditActors.set(entry.performed_by, entry.performed_by_name ?? `#${entry.performed_by}`)
  }
  for (const user of usersData?.items ?? []) {
    auditActors.set(user.id, user.full_name)
  }
  if (userIdValue && !auditActors.has(userIdValue)) {
    auditActors.set(userIdValue, `#${userIdValue}`)
  }

  const userOptions = [
    { value: '', label: 'כל המשתמשים' },
    ...Array.from(auditActors, ([id, label]) => ({ value: String(id), label })),
  ]

  const filterFields = [
    { type: 'select' as const, key: actionKey, label: 'פעולה', options: actionOptions },
    { type: 'select' as const, key: userIdKey, label: 'משתמש', options: userOptions },
    {
      type: 'date-range' as const,
      fromKey: createdAfterKey,
      toKey: createdBeforeKey,
      fromLabel: 'מתאריך',
      toLabel: 'עד תאריך',
    },
  ]

  const filterPanel = (
    <FilterPanel
      fields={filterFields}
      values={{
        [actionKey]: selectedAction,
        [userIdKey]: selectedUserId,
        [createdAfterKey]: createdAfter,
        [createdBeforeKey]: createdBefore,
      }}
      onChange={handleFilterChange}
      onReset={handleFilterReset}
      gridClass="grid-cols-1 sm:grid-cols-4"
    />
  )

  const renderState = (message: string, className = 'text-gray-400') => (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <div className="space-y-3">
        {filterPanel}
        <p className={`py-8 text-center text-sm ${className}`}>{message}</p>
      </div>
    </Card>
  )

  if (isPending) {
    return renderState('טוען...')
  }

  if (isError) {
    return renderState('שגיאה בטעינת ההיסטוריה', 'text-negative-600')
  }

  if (total === 0) {
    return renderState(hasActiveFilters ? 'אין תוצאות התואמות את הסינון' : 'אין היסטוריית שינויים')
  }

  return (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <div className="space-y-3">
        {filterPanel}
        <AuditTrailTable
          items={items}
          actionLabels={ACTION_LABELS}
          formatDetails={formatAuditDetails}
          totalPages={totalPages}
          maxPage={maxPage}
          safePage={safePage}
          isFetching={isFetching}
          setPage={handlePageChange}
        />
      </div>
    </Card>
  )
}

EntityAuditTrailSection.displayName = 'EntityAuditTrailSection'
