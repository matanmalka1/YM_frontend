import { makeLabelGetter, makeVariantGetter } from '../../utils/labels'
import type { AdvancePaymentFrequency, ClientRecordResponse, ClientStatus, EntityType } from './api'
import { CLIENTS_MESSAGES } from './messages'
import { VAT_REPORTING_FREQUENCIES, VAT_REPORTING_FREQUENCY_LABELS } from '@/types/vatReporting'

export const TURNOVER_SOURCE_LABELS: Record<string, string> = {
  reported: CLIENTS_MESSAGES.info.turnoverSourceReported,
  manual: CLIENTS_MESSAGES.info.turnoverSourceManual,
  none: '',
}

export type ActiveClientDetailsTab =
  | 'details'
  | 'documents'
  | 'binders'
  | 'timeline'
  | 'charges'
  | 'vat'
  | 'advance-payments'
  | 'annual-reports'
  | 'communication'
  | 'notifications'
  | 'notes'
  | 'tasks'
export type ClientIdNumberType = Exclude<ClientRecordResponse['id_number_type'], null>
export type ClientSortBy = 'full_name' | 'created_at' | 'status' | 'entity_type'
export type ClientSortOrder = 'asc' | 'desc'

/** @auditContract Read by the backend enum-sync audit. */
export const CLIENT_ID_NUMBER_TYPES = [
  'individual',
  'corporation',
  'passport',
  'other',
] as const satisfies readonly ClientIdNumberType[]

export const CLIENT_DETAILS_TABS: ActiveClientDetailsTab[] = [
  'details',
  'documents',
  'binders',
  'timeline',
  'charges',
  'vat',
  'advance-payments',
  'annual-reports',
  'communication',
  'notifications',
  'notes',
  'tasks',
]

export const CLIENT_DETAILS_TAB_LABELS: Record<ActiveClientDetailsTab, string> = {
  details: 'סקירה כללית',
  documents: 'מסמכים',
  binders: 'קלסרים',
  timeline: 'ציר זמן ושינויים',
  charges: 'חיובים',
  vat: 'מע"מ (לקוח)',
  'advance-payments': 'מקדמות',
  'annual-reports': 'דוחות שנתיים',
  communication: 'תקשורת',
  notifications: 'הודעות',
  notes: 'הערות',
  tasks: 'משימות',
}

export const ENTITY_TYPES = ['osek_patur', 'osek_murshe', 'company_ltd', 'employee'] as const satisfies readonly EntityType[]

export const CREATE_ENTITY_TYPES = ['osek_patur', 'osek_murshe', 'company_ltd'] as const

export const CLIENT_ID_NUMBER_TYPE_LABELS: Record<ClientIdNumberType, string> = {
  individual: 'יחיד / עוסק',
  corporation: 'חברה / תאגיד',
  passport: 'דרכון',
  other: 'אחר',
}
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  osek_patur: 'עוסק פטור',
  osek_murshe: 'עוסק מורשה',
  company_ltd: 'חברה בע"מ',
  employee: 'שכיר',
}
export const ENTITY_TYPE_OPTIONS = ENTITY_TYPES.map((type) => ({
  value: type,
  label: ENTITY_TYPE_LABELS[type],
}))

export const CLIENT_STATUSES = ['active', 'frozen', 'closed'] as const satisfies readonly ClientStatus[]

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'פעיל',
  frozen: 'מוקפא',
  closed: 'סגור',
}

export const CLIENT_STATUS_BADGE_VARIANTS = {
  active: 'positive',
  frozen: 'warning',
  closed: 'neutral',
} as const satisfies Record<ClientStatus, 'positive' | 'warning' | 'neutral'>
export const getClientStatusBadgeVariant = makeVariantGetter(CLIENT_STATUS_BADGE_VARIANTS)

export const VAT_TYPES = VAT_REPORTING_FREQUENCIES
export const VAT_TYPE_LABELS = VAT_REPORTING_FREQUENCY_LABELS

export const CLIENT_STATUS_OPTIONS = CLIENT_STATUSES.map((status) => ({
  value: status,
  label: CLIENT_STATUS_LABELS[status],
}))

export const VAT_REPORTING_FREQUENCY_OPTIONS = VAT_TYPES.map((type) => ({
  value: type,
  label: VAT_TYPE_LABELS[type],
}))
export const CREATE_CLIENT_ENTITY_OPTIONS = CREATE_ENTITY_TYPES.map((type) => ({
  value: type,
  label: ENTITY_TYPE_LABELS[type],
}))
export const CREATE_CLIENT_VAT_OPTIONS = VAT_REPORTING_FREQUENCY_OPTIONS.filter((option) => option.value !== 'exempt')

export const ADVANCE_PAYMENT_FREQUENCY_VALUES = ['monthly', 'bimonthly'] as const satisfies readonly AdvancePaymentFrequency[]

export const ADVANCE_PAYMENT_FREQUENCY_LABELS: Record<AdvancePaymentFrequency, string> = {
  monthly: 'חודשי',
  bimonthly: 'דו-חודשי',
}

export const ADVANCE_PAYMENT_FREQUENCY_OPTIONS = ADVANCE_PAYMENT_FREQUENCY_VALUES.map((v) => ({
  value: v,
  label: ADVANCE_PAYMENT_FREQUENCY_LABELS[v],
}))

const CLIENT_SORT_BY_VALUES = ['full_name', 'created_at', 'status', 'entity_type'] as const satisfies readonly ClientSortBy[]

const CLIENT_SORT_ORDER_VALUES = ['asc', 'desc'] as const satisfies readonly ClientSortOrder[]

const CLIENT_SORT_BY_LABELS: Record<ClientSortBy, string> = {
  full_name: 'שם לקוח',
  created_at: 'תאריך יצירה',
  status: 'סטטוס',
  entity_type: 'סוג יישות',
}

export const CLIENT_SORT_BY_OPTIONS: { value: ClientSortBy; label: string }[] = CLIENT_SORT_BY_VALUES.map((value) => ({
  value,
  label: CLIENT_SORT_BY_LABELS[value],
}))

const SORT_ORDER_LABELS: Record<ClientSortBy, Record<ClientSortOrder, string>> = {
  full_name: { asc: 'שם לקוח: א׳ → ת׳', desc: 'שם לקוח: ת׳ → א׳' },
  created_at: { asc: 'תאריך יצירה: ישן → חדש', desc: 'תאריך יצירה: חדש → ישן' },
  status: { asc: 'סדר עולה', desc: 'סדר יורד' },
  entity_type: { asc: 'סוג יישות: א׳ → ת׳', desc: 'סוג יישות: ת׳ → א׳' },
}

export const getClientSortOrderOptions = (sortBy: ClientSortBy): { value: ClientSortOrder; label: string }[] => [
  { value: 'asc', label: SORT_ORDER_LABELS[sortBy]?.asc ?? 'סדר עולה' },
  { value: 'desc', label: SORT_ORDER_LABELS[sortBy]?.desc ?? 'סדר יורד' },
]

export const DEFAULT_CLIENT_SORT_BY: ClientSortBy = 'created_at'
export const DEFAULT_CLIENT_SORT_ORDER: ClientSortOrder = 'desc'

const isOneOf = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value !== null && (values as readonly string[]).includes(value)

/** Parse an untrusted URL value into ClientStatus, or undefined when absent/invalid. */
export const parseClientStatus = (value: string | null): ClientStatus | undefined =>
  isOneOf(CLIENT_STATUSES, value) ? value : undefined

/** Parse an untrusted URL value into EntityType, or undefined when absent/invalid. */
export const parseEntityType = (value: string | null): EntityType | undefined =>
  isOneOf(ENTITY_TYPES, value) ? value : undefined

/** Parse an untrusted URL value into ClientSortBy, falling back to the default. */
export const parseClientSortBy = (value: string | null): ClientSortBy =>
  isOneOf(CLIENT_SORT_BY_VALUES, value) ? value : DEFAULT_CLIENT_SORT_BY

/** Parse an untrusted URL value into ClientSortOrder, falling back to the default. */
export const parseClientSortOrder = (value: string | null): ClientSortOrder =>
  isOneOf(CLIENT_SORT_ORDER_VALUES, value) ? value : DEFAULT_CLIENT_SORT_ORDER

export const CREATE_CLIENT_DEFAULT_VALUES = {
  full_name: '',
  id_number: '',
  entity_type: undefined,
  phone: '',
  email: '',
  address_street: '',
  address_building_number: '',
  address_apartment: '',
  address_city: '',
  address_zip_code: '',
  vat_reporting_frequency: null,
  advance_rate: null,
  accountant_id: '',
  business_name: '',
  business_opened_at: null,
} as const

export const CREATE_CLIENT_VALIDATION_MESSAGES = {
  vatFrequencyRequired: 'יש לציין תדירות דיווח מע"מ',
  paturVatFrequencyForbidden: 'אין להזין תדירות דיווח מע"מ עבור עוסק פטור',
  idDigitsCompany: 'ח.פ חייב להכיל ספרות בלבד',
  idDigitsIndividual: 'מספר תעודת זהות חייב להכיל ספרות בלבד',
  idLengthCompany: 'ח.פ חייב להכיל בדיוק 9 ספרות',
  idLengthIndividual: 'מספר תעודת זהות חייב להכיל בדיוק 9 ספרות',
  idChecksumCompany: 'מספר ח.פ אינו תקין',
  idChecksumIndividual: 'מספר תעודת זהות אינו תקין',
  streetContainsNumber: 'שדה הרחוב צריך להכיל שם בלבד — הזן מספר בניין בשדה הייעודי',
} as const

/**
 * Entity-type-driven field labels used across the create-client form steps and review.
 * Centralized so the company/non-company copy does not drift between steps.
 */
export const getCreateClientEntityLabels = (isCompany: boolean) => ({
  name: isCompany ? 'שם חברה' : 'שם מלא',
  idNumber: isCompany ? 'ח.פ' : 'ת.ז',
  idNumberPlaceholder: isCompany ? '512345678' : '123456789',
  businessName: isCompany ? 'שם חברה' : 'שם עסק',
  businessOpenedAt: isCompany ? 'תאריך התאגדות' : 'תאריך פתיחת תיק',
  contactSection: isCompany ? 'חברה ופרטי קשר' : 'עסק ופרטי קשר',
})

export const getClientIdNumberTypeLabel = makeLabelGetter(CLIENT_ID_NUMBER_TYPE_LABELS)

export const getEntityTypeLabel = makeLabelGetter(ENTITY_TYPE_LABELS)
export const getClientStatusLabel = makeLabelGetter(CLIENT_STATUS_LABELS)
export const getVatTypeLabel = makeLabelGetter(VAT_TYPE_LABELS)

export const getClientVatReportingLabel = (
  client: Pick<ClientRecordResponse, 'entity_type' | 'vat_reporting_frequency'>,
): string => {
  if (client.entity_type === 'employee') return 'לא רלוונטי'
  return client.vat_reporting_frequency ? getVatTypeLabel(client.vat_reporting_frequency) : '—'
}
