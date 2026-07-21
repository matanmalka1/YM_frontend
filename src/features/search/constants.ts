import { getAdvancePaymentStatusLabel } from '@/features/advancedPayments'
import { getStatusLabel as getAnnualReportStatusLabel } from '@/features/annualReports'
import { getBinderLocationStatusLabel } from '@/features/binders'
import { getChargeStatusLabel } from '@/features/charges'
import { getNotificationStatusLabel } from '@/features/notifications'
import { getTaskStatusLabel } from '@/features/tasks'
import { getVatWorkItemStatusLabel } from '@/features/vatReports'
import { DOC_TYPE_LABELS } from '@/features/documents'
import type { SearchMatchGroupKey, SearchMatchType } from './api/contracts'

/** Group key in the response ↔ the type of the rows inside it. */
export const SEARCH_GROUP_TYPES: Record<SearchMatchGroupKey, SearchMatchType> = {
  binders: 'binder',
  documents: 'document',
  vat_work_items: 'vat_work_item',
  annual_reports: 'annual_report',
  advance_payments: 'advance_payment',
  charges: 'charge',
  tasks: 'task',
  notifications: 'notification',
}

/** Display order of the match groups — the declaration order above. */
export const SEARCH_GROUP_ORDER = Object.keys(SEARCH_GROUP_TYPES) as SearchMatchGroupKey[]

/**
 * Statuses come from eight different backend enums whose values overlap (`filed`/`submitted`,
 * `canceled`, `closed`, `pending`). Each type resolves through its owning domain's label map —
 * one flat map would silently mislabel colliding values.
 */
const STATUS_LABEL_GETTERS: Record<SearchMatchType, (status: string) => string> = {
  binder: getBinderLocationStatusLabel,
  document: (status) => status,
  vat_work_item: getVatWorkItemStatusLabel,
  annual_report: getAnnualReportStatusLabel,
  advance_payment: getAdvancePaymentStatusLabel,
  charge: getChargeStatusLabel,
  task: getTaskStatusLabel,
  notification: getNotificationStatusLabel,
}

const getSearchMatchStatusLabel = (type: SearchMatchType, status: string): string => STATUS_LABEL_GETTERS[type](status)

/**
 * Documents carry no work status, so their badge shows the document type instead — that is
 * what `detail` holds for them.
 */
export const getSearchMatchBadgeLabel = (type: SearchMatchType, status: string | null, detail: string | null) => {
  if (status !== null) return getSearchMatchStatusLabel(type, status)
  if (type === 'document' && detail) return DOC_TYPE_LABELS[detail] ?? detail
  return null
}
