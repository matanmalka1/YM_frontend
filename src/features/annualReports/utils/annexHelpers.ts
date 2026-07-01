import type { AnnualReportScheduleKey, AnnexDataLine, ScheduleEntry } from '../api'
import { getScheduleLabel } from '../api'
import { ALL_SCHEDULES, type FieldDef } from '../constants/annexConstants'
import { formatCount, formatDate, formatShekelAmount } from '@/utils/utils'

export const getInputType = (type: FieldDef['type']) => {
  if (type === 'date') return 'date'
  if (type === 'number') return 'number'
  return 'text'
}

const isPercentField = (field: FieldDef): boolean =>
  field.key.includes('rate') ||
  field.key.includes('percentage') ||
  field.label.includes('%') ||
  field.label.includes('שיעור')

const COUNT_FIELD_KEY_HINTS = ['points', 'quantity', 'units', 'days', 'year']

const isCountField = (field: FieldDef): boolean =>
  field.label.includes('נקודות') || COUNT_FIELD_KEY_HINTS.some((hint) => field.key.includes(hint))

const isMoneyField = (field: FieldDef): boolean =>
  field.type === 'number' && !isPercentField(field) && !isCountField(field)

const getRawLineFieldValue = (line: AnnexDataLine, key: string): unknown => (line.data as Record<string, unknown>)[key]

const toDisplayScalar = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

export const getLineFieldValue = (line: AnnexDataLine, field: FieldDef): string => {
  const value = toDisplayScalar(getRawLineFieldValue(line, field.key))
  if (value == null || value === '') return '—'
  if (field.type === 'date') return formatDate(String(value))
  if (isPercentField(field)) return `${formatCount(value)}%`
  if (isMoneyField(field)) return formatShekelAmount(value)
  if (field.type === 'number') return formatCount(value)
  return String(value)
}

export const getAvailableSchedules = (schedules: ScheduleEntry[]) => {
  const existing = new Set(schedules.map((entry) => entry.schedule))
  return ALL_SCHEDULES.filter((key) => !existing.has(key))
}

export const buildScheduleOptions = (available: AnnualReportScheduleKey[], placeholder: string) => [
  { value: '', label: placeholder, disabled: true },
  ...available.map((key) => ({ value: key, label: getScheduleLabel(key) })),
]

export const getCompletedCount = (schedules: ScheduleEntry[]) =>
  schedules.filter((schedule) => schedule.is_complete).length

export const normalizeNotes = (notes: string) => notes.trim() || undefined
