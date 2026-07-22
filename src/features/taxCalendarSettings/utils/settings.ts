import type { TaxCalendarSettingsEntry } from '../api'
import { TAX_CALENDAR_OBLIGATION_TYPE_LABELS } from '../constants'
import { TAX_CALENDAR_SETTINGS_ERROR_MESSAGES } from '../errorMessages'

const MIN_TAX_CALENDAR_YEAR = 2000
const MAX_TAX_CALENDAR_YEAR = 2100

export const getDefaultYearRange = (today = new Date()) => {
  const year = String(today.getFullYear())
  return { startYear: year, endYear: year }
}

export const parseYearInput = (value: string, label: string): { value: number | null; error: string | null } => {
  const trimmed = value.trim()
  if (!trimmed) return { value: null, error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.required(label) }

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed)) {
    return { value: null, error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.invalidYear(label) }
  }
  if (parsed < MIN_TAX_CALENDAR_YEAR || parsed > MAX_TAX_CALENDAR_YEAR) {
    return {
      value: null,
      error: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.validation.yearRange(label, MIN_TAX_CALENDAR_YEAR, MAX_TAX_CALENDAR_YEAR),
    }
  }
  return { value: parsed, error: null }
}

export const getTaxCalendarObligationLabel = (value: string): string =>
  TAX_CALENDAR_OBLIGATION_TYPE_LABELS[value as keyof typeof TAX_CALENDAR_OBLIGATION_TYPE_LABELS] ?? value

export type TaxCalendarEntryGroup = {
  key: string
  taxYear: number
  obligationType: string
  entries: TaxCalendarSettingsEntry[]
}

export const groupTaxCalendarEntries = (entries: TaxCalendarSettingsEntry[]): TaxCalendarEntryGroup[] => {
  const groups = new Map<string, TaxCalendarEntryGroup>()
  for (const entry of entries) {
    const key = `${entry.tax_year}-${entry.obligation_type}`
    const existing = groups.get(key)
    if (existing) existing.entries.push(entry)
    else groups.set(key, { key, taxYear: entry.tax_year, obligationType: entry.obligation_type, entries: [entry] })
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        a.taxYear - b.taxYear ||
        getTaxCalendarObligationLabel(a.obligationType).localeCompare(getTaxCalendarObligationLabel(b.obligationType), 'he'),
    )
    .map((group) => ({
      ...group,
      entries: [...group.entries].sort(
        (a, b) => (a.period ?? '').localeCompare(b.period ?? '', 'he') || a.due_date.localeCompare(b.due_date),
      ),
    }))
}
