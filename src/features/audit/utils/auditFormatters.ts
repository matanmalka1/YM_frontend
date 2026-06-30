import { AUDIT_FIELD_LABELS } from '../constants'

export type FieldValueLabels = Partial<Record<string, Record<string, string>>>

/**
 * Minimal structural input for the diff formatter — old_value/new_value are JSON
 * values (dict | list | scalar | null), not strings. Decoupled from the full
 * EntityAuditLogEntry so non-audit callers (e.g. the timeline) can reuse it.
 */
export interface AuditDiffInput {
  old_value: unknown
  new_value: unknown
  action: string
  note?: string | null
}

export const EMPTY_FIELD_VALUE_LABELS: FieldValueLabels = {}

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const unwrapScalarPayload = (value: unknown): unknown => {
  if (isRecord(value) && Object.keys(value).length === 1 && 'value' in value) return value.value
  return value
}

const formatFieldLabel = (key: string): string => AUDIT_FIELD_LABELS[key] ?? key

export const makeAuditFormatter = (labels: FieldValueLabels) => {
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
        .flatMap((key) => {
          const label = formatFieldLabel(key)
          const oldText = formatValue(oldRecord[key], key)
          const newText = formatValue(newRecord[key], key)
          if (!(key in oldRecord)) return [`${label}: ${newText}`]
          if (!(key in newRecord)) return [`${label}: ${oldText}`]
          if (oldText === newText) return []
          return [`${label}: ${oldText} → ${newText}`]
        })
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

  return (entry: AuditDiffInput): string => {
    // old_value / new_value are already JSON values (dict | list | null) — no parsing.
    const details = formatParsedDiff(entry.old_value, entry.new_value)

    // action is namespaced `<entity_type>.<verb>`; the fallback keys off the verb.
    const verb = entry.action.split('.').slice(1).join('.') || entry.action
    const fallbackDetails =
      {
        created: 'ללא פרטים נוספים',
        deleted: 'ללא פרטים נוספים',
        restored: 'ללא פרטים נוספים',
      }[verb] ?? '—'

    return [details || fallbackDetails, entry.note].filter(Boolean).join('; ')
  }
}
