import { VAT_PERIOD_TYPES, VAT_PERIOD_TYPE_OPTIONS, type VatPeriodTypeFilter } from './constants'
import { getVatWorkItemStatusLabel } from './constants'

export const toVatPeriodTypeFilter = (value: string | null): VatPeriodTypeFilter | '' =>
  VAT_PERIOD_TYPES.includes(value as VatPeriodTypeFilter) ? (value as VatPeriodTypeFilter) : ''

export const toOptionalVatPeriodTypeFilter = (value: VatPeriodTypeFilter | ''): VatPeriodTypeFilter | undefined =>
  value || undefined

interface VatEmptyStateFilters {
  status?: string
  year?: string
  clientSearchName?: string
  period_type?: VatPeriodTypeFilter | ''
}

export const buildVatEmptyStateTitle = (filters: VatEmptyStateFilters): string => {
  const parts: string[] = []

  if (filters.year) parts.push(`לשנת ${filters.year}`)

  if (filters.clientSearchName?.trim()) parts.push(`עבור "${filters.clientSearchName.trim()}"`)

  if (filters.status) {
    const label = getVatWorkItemStatusLabel(filters.status)
    parts.push(`בסטטוס "${label}"`)
  }

  if (filters.period_type) {
    const option = VAT_PERIOD_TYPE_OPTIONS.find((o) => o.value === filters.period_type)
    if (option) parts.push(`עבור לקוחות עם דיווח ${option.label}`)
  }

  if (parts.length === 0) return 'לא נמצאו תיקי מע"מ'
  return `לא נמצאו תיקי מע"מ ${parts.join(' ')}`
}
