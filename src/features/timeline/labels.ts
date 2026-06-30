import type { TimelineBinderStatus } from './api/contracts'
import type { FieldValueLabels } from '@/features/audit'
// eslint-disable-next-line no-restricted-imports -- avoid the binders feature barrel here; it loads timeline-adjacent drawer components.
import { BINDER_CAPACITY_STATUS_LABELS, BINDER_LOCATION_STATUS_LABELS } from '@/features/binders/constants'
// eslint-disable-next-line no-restricted-imports -- avoid the clients feature barrel here; it imports timeline detail components.
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  CLIENT_STATUS_LABELS,
  ENTITY_TYPE_LABELS,
  VAT_TYPE_LABELS,
} from '@/features/clients/constants'
// eslint-disable-next-line no-restricted-imports -- avoid the annualReports feature barrel here; it imports timeline query keys.
import { STATUS_LABELS as ANNUAL_REPORT_STATUS_LABELS } from '@/features/annualReports/api/utils'
// eslint-disable-next-line no-restricted-imports -- avoid the annualReports feature barrel here; it imports timeline query keys.
import { CLIENT_TYPE_LABELS as ANNUAL_REPORT_CLIENT_TYPE_LABELS } from '@/features/annualReports/constants/panelConstants'
// eslint-disable-next-line no-restricted-imports -- keep timeline label reuse scoped to charge constants, not the full feature barrel.
import { CHARGE_STATUS_LABELS, CHARGE_TYPE_LABELS } from '@/features/charges/constants'

const BINDER_LIFECYCLE_LABEL_MAP: Record<TimelineBinderStatus, string> = {
  null: 'חדש',
  in_office: BINDER_LOCATION_STATUS_LABELS.in_office,
  ready_for_handover: BINDER_LOCATION_STATUS_LABELS.ready_for_handover,
  handed_over: BINDER_LOCATION_STATUS_LABELS.handed_over,
  open: BINDER_CAPACITY_STATUS_LABELS.open,
  full: BINDER_CAPACITY_STATUS_LABELS.full,
}

const ANNUAL_REPORT_STATUS_LABEL_MAP: Record<string, string> = {
  not_started: 'טרם התחיל',
  collecting_docs: 'איסוף מסמכים',
  in_preparation: 'בהכנה',
  pending_client: 'ממתין ללקוח',
  submitted: 'הוגש',
  closed: 'נסגר',
  canceled: 'בוטל',
}

const STATUS_FIELD_VALUE_LABELS = {
  ...CLIENT_STATUS_LABELS,
  ...CHARGE_STATUS_LABELS,
  ...ANNUAL_REPORT_STATUS_LABELS,
}

export const TIMELINE_AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  advance_payment_frequency: ADVANCE_PAYMENT_FREQUENCY_LABELS,
  charge_type: CHARGE_TYPE_LABELS,
  client_type: ANNUAL_REPORT_CLIENT_TYPE_LABELS,
  entity_type: ENTITY_TYPE_LABELS,
  status: STATUS_FIELD_VALUE_LABELS,
  type: ENTITY_TYPE_LABELS,
  vat_reporting_frequency: VAT_TYPE_LABELS,
}

export const getTimelineStatusLabel = (status: string): string =>
  BINDER_LIFECYCLE_LABEL_MAP[status as TimelineBinderStatus] ?? 'לא ידוע'

export const getAnnualReportStatusLabel = (status: string): string => ANNUAL_REPORT_STATUS_LABEL_MAP[status] ?? status
