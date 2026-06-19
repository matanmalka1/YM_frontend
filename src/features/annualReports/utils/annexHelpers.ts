import type { AnnualReportScheduleKey, AnnexDataLine, ScheduleEntry } from '../api'
import { getScheduleLabel } from '../api'
import { ALL_SCHEDULES, type FieldDef } from '../constants/annexConstants'

export const getInputType = (type: FieldDef['type']) => {
  if (type === 'date') return 'date'
  if (type === 'number') return 'number'
  return 'text'
}

export const getLineFieldValue = (line: AnnexDataLine, key: string) =>
  String((line.data as Record<string, unknown>)[key] ?? '')

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

export const toggleExpandedSchedule = (expanded: Record<string, boolean>, key: AnnualReportScheduleKey) => ({
  ...expanded,
  [key]: !expanded[key],
})

export const normalizeNotes = (notes: string) => notes.trim() || undefined
