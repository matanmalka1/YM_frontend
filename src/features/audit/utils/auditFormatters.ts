import type { EntityAuditLogEntry } from '../api'
import { AUDIT_FIELD_LABELS } from '../audit.constants'

export type FieldValueLabels = Partial<Record<string, Record<string, string>>>

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
