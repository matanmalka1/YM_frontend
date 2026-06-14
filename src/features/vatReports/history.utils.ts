import type { VatAuditLogResponse } from './api'
import { formatVatAmount } from './utils'
import { AUTO_TRANSITION_NOTE, INVOICE_TYPE_LABELS } from './history.constants'
import { VAT_FILING_METHOD_LABELS } from './constants'
import { getVatWorkItemStatusLabel } from './constants'

const asLabel = (value: unknown, labels: Record<string, string>): string =>
  labels[String(value ?? '')] ?? String(value ?? '')

const toStringValue = (value: unknown): string => String(value)

const formatOverrideState = (value: unknown): string => (value ? 'בוצעה עקיפה' : 'לא בוצעה עקיפה')

const pushIfDefined = (parts: string[], value: unknown, builder: (v: unknown) => string): void => {
  if (value !== undefined) parts.push(builder(value))
}

const parseJsonObject = (raw: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

const toDetailText = (raw: string | null): string | null => {
  if (!raw) return null
  const parsed = parseJsonObject(raw)
  if (!parsed) return raw

  const parts: string[] = []
  pushIfDefined(parts, parsed.invoice_id, (v) => `חשבונית #${toStringValue(v)}`)
  pushIfDefined(parts, parsed.type, (v) => `סוג: ${asLabel(v, INVOICE_TYPE_LABELS)}`)
  pushIfDefined(parts, parsed.number, (v) => `מספר: ${toStringValue(v)}`)
  pushIfDefined(parts, parsed.vat_amount, (v) => `מע"מ: ${formatVatAmount(Number(v))}`)
  pushIfDefined(parts, parsed.status, (v) => `סטטוס: ${getVatWorkItemStatusLabel(String(v ?? ''))}`)
  pushIfDefined(parts, parsed.period, (v) => `תקופה: ${toStringValue(v)}`)
  pushIfDefined(parts, parsed.final_vat_amount, (v) => `סכום מע"מ סופי: ${formatVatAmount(Number(v))}`)
  pushIfDefined(parts, parsed.filing_method, (v) => `אופן הגשה: ${asLabel(v, VAT_FILING_METHOD_LABELS)}`)
  pushIfDefined(parts, parsed.is_overridden, formatOverrideState)

  if (parts.length > 0) return parts.join(' | ')
  return raw
}

const firstDetailText = (...values: Array<string | null>): string | null => {
  for (const value of values) {
    const text = toDetailText(value)
    if (text) return text
  }
  return null
}

const normalizeNote = (note: string | null): string | null =>
  note === AUTO_TRANSITION_NOTE ? 'העברה אוטומטית בהזנת חשבונית ראשונה' : note

const formatStatusTransition = (oldValue: string | null, newValue: string | null): string => {
  const hasOld = Boolean(oldValue)
  const hasNew = Boolean(newValue)
  const oldStatus = getVatWorkItemStatusLabel(String(oldValue ?? ''))
  const newStatus = getVatWorkItemStatusLabel(String(newValue ?? ''))

  if (hasOld && hasNew) return `מ-${oldStatus} ל-${newStatus}`
  if (hasNew) return `ל-${newStatus}`
  if (hasOld) return `מ-${oldStatus}`
  return ''
}

const formatVatOverride = (oldValue: string | null, newValue: string | null): string | null => {
  if (!oldValue || !newValue) return null
  return `מע"מ מחושב: ${formatVatAmount(Number(oldValue))} | מע"מ חלופי: ${formatVatAmount(Number(newValue))}`
}

export const formatVatHistoryDetails = (entry: VatAuditLogResponse): string => {
  const note = normalizeNote(entry.note)

  if (entry.action === 'status_changed') {
    const transition = formatStatusTransition(entry.old_value, entry.new_value)
    if (note && transition) return `${note} | ${transition}`
    if (note) return note
    if (transition) return transition
  }

  if (note) return note

  const overrideDetails = formatVatOverride(entry.old_value, entry.new_value)
  if (entry.action === 'vat_override' && overrideDetails) return overrideDetails

  if ((entry.action === 'filed' || entry.action === 'vat_calculated') && entry.new_value !== null) {
    const rawValue = entry.new_value.trim()
    const numeric = Number(rawValue)
    if (rawValue !== '' && Number.isFinite(numeric)) return `מע"מ נטו: ${formatVatAmount(numeric)}`
  }

  return firstDetailText(entry.new_value, entry.old_value) ?? '—'
}
