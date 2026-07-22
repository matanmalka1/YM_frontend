import { formatDate, getReportingPeriodLabelWithYear } from '@/utils/utils'
import type { TaxCalendarGroup, TaxCalendarGroupItem } from './api'
import { TAX_CALENDAR_OBLIGATION_LABELS } from './constants'
import { TAX_CALENDAR_SOURCE_TYPE_LABELS } from './constants'
import { TAX_CALENDAR_MESSAGES } from './messages'

export const formatTaxCalendarGroupTitle = (group: TaxCalendarGroup): string => {
  const obligationLabel = TAX_CALENDAR_OBLIGATION_LABELS[group.obligation_type]
  const periodLabel = getReportingPeriodLabelWithYear(group.period, group.period_months_count, group.tax_year)
  return `${obligationLabel} · ${periodLabel}`
}

export const formatTaxCalendarEffectiveDueDateRange = (group: TaxCalendarGroup): string => {
  if (group.effective_due_date_min !== group.effective_due_date_max) {
    return `${formatDate(group.effective_due_date_min)}–${formatDate(group.effective_due_date_max)}`
  }
  return formatDate(group.effective_due_date_min)
}

export const hasTaxCalendarGroupOverride = (group: TaxCalendarGroup): boolean =>
  group.effective_due_date_min !== group.regulatory_due_date || group.effective_due_date_max !== group.regulatory_due_date

export const getTaxCalendarItemPath = (item: TaxCalendarGroupItem): string => {
  if (item.source_type === 'vat_work_item') return `/tax/vat/${item.source_id}`
  if (item.source_type === 'annual_report') return `/tax/reports/${item.source_id}`
  return `/tax/advance-payments/${item.client_record_id}/${item.source_id}`
}

export const getClientTaxCalendarItemPath = (item: TaxCalendarGroupItem): string => {
  if (item.source_type === 'vat_work_item') {
    return `/clients/${item.client_record_id}/vat/${item.source_id}`
  }
  if (item.source_type === 'annual_report') {
    return `/clients/${item.client_record_id}/annual-reports/${item.source_id}`
  }
  return `/clients/${item.client_record_id}/advance-payments/${item.source_id}`
}

export const getTaxCalendarItemStateLabel = (item: TaxCalendarGroupItem): string => {
  if (item.done) return TAX_CALENDAR_MESSAGES.item.done
  if (item.overdue) return TAX_CALENDAR_MESSAGES.item.overdue
  return TAX_CALENDAR_MESSAGES.item.open
}

export const getTaxCalendarItemStateVariant = (item: TaxCalendarGroupItem): 'positive' | 'warning' | 'negative' => {
  if (item.done) return 'positive'
  if (item.overdue) return 'negative'
  return 'warning'
}

export const getTaxCalendarGroupStateLabel = (group: TaxCalendarGroup): string => {
  if (group.overdue_count > 0) return TAX_CALENDAR_MESSAGES.item.overdue
  if (group.done_count > 0 && group.open_count === 0) return TAX_CALENDAR_MESSAGES.item.done
  return TAX_CALENDAR_MESSAGES.item.open
}

export const getTaxCalendarGroupStateVariant = (group: TaxCalendarGroup): 'positive' | 'warning' | 'negative' => {
  if (group.overdue_count > 0) return 'negative'
  if (group.done_count > 0 && group.open_count === 0) return 'positive'
  return 'warning'
}

export const getTaxCalendarGroupDueDatePrefix = (group: TaxCalendarGroup): string =>
  group.obligation_type === 'advance_payment' ? TAX_CALENDAR_MESSAGES.item.paymentDue : TAX_CALENDAR_MESSAGES.item.reportingDue

export const getTaxCalendarSourceTypeLabel = (item: TaxCalendarGroupItem): string =>
  TAX_CALENDAR_SOURCE_TYPE_LABELS[item.source_type]
