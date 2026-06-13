import { makeLabelGetter } from '../../utils/labels'
import type { AdvancePaymentFrequency, ClientRecordResponse, ClientStatus, EntityType, VatType } from './api'

export type ActiveClientDetailsTab =
  | 'details'
  | 'documents'
  | 'timeline'
  | 'charges'
  | 'vat'
  | 'tax-calendar'
  | 'advance-payments'
  | 'annual-reports'
  | 'communication'
  | 'notifications'
  | 'notes'
  | 'history'
export type ClientIdNumberType = Exclude<ClientRecordResponse['id_number_type'], null>
export type ClientSortBy = 'full_name' | 'created_at' | 'status' | 'entity_type'
export type ClientSortOrder = 'asc' | 'desc'

export const CLIENT_DETAILS_TABS: ActiveClientDetailsTab[] = [
  'details',
  'documents',
  'timeline',
  'charges',
  'vat',
  'tax-calendar',
  'advance-payments',
  'annual-reports',
  'communication',
  'notifications',
  'notes',
  'history',
]

export const CLIENT_DETAILS_TAB_LABELS: Record<ActiveClientDetailsTab, string> = {
  details: 'סקירה כללית',
  documents: 'מסמכים',
  timeline: 'ציר זמן',
  charges: 'חיובים',
  vat: 'מע"מ (לקוח)',
  'tax-calendar': 'מועדי מס',
  'advance-payments': 'מקדמות',
  'annual-reports': 'דוחות שנתיים',
  communication: 'תקשורת',
  notifications: 'התראות',
  notes: 'הערות',
  history: 'יומן שינויים',
}

export const ENTITY_TYPES = [
  'osek_patur',
  'osek_murshe',
  'company_ltd',
  'employee',
] as const satisfies readonly EntityType[]

export const CREATE_ENTITY_TYPES = ['osek_patur', 'osek_murshe', 'company_ltd'] as const
export type CreateEntityType = (typeof CREATE_ENTITY_TYPES)[number]

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
  active: 'success',
  frozen: 'warning',
  closed: 'neutral',
} as const satisfies Record<ClientStatus, 'success' | 'warning' | 'neutral'>

export const VAT_TYPES = ['monthly', 'bimonthly', 'exempt'] as const satisfies readonly VatType[]

export const VAT_TYPE_LABELS: Record<VatType, string> = {
  monthly: 'חודשי',
  bimonthly: 'דו-חודשי',
  exempt: 'פטור',
}

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

export const ADVANCE_PAYMENT_FREQUENCY_VALUES = [
  'monthly',
  'bimonthly',
] as const satisfies readonly AdvancePaymentFrequency[]

export const ADVANCE_PAYMENT_FREQUENCY_LABELS: Record<AdvancePaymentFrequency, string> = {
  monthly: 'חודשי',
  bimonthly: 'דו-חודשי',
}

export const ADVANCE_PAYMENT_FREQUENCY_OPTIONS = ADVANCE_PAYMENT_FREQUENCY_VALUES.map((v) => ({
  value: v,
  label: ADVANCE_PAYMENT_FREQUENCY_LABELS[v],
}))

export const CLIENT_SORT_BY_OPTIONS: { value: ClientSortBy; label: string }[] = [
  { value: 'full_name', label: 'שם לקוח' },
  { value: 'created_at', label: 'תאריך יצירה' },
  { value: 'status', label: 'סטטוס' },
  { value: 'entity_type', label: 'סוג יישות' },
]

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

export const deriveCreateClientIdNumberType = (entityType: CreateEntityType): ClientIdNumberType =>
  entityType === 'company_ltd' ? 'corporation' : 'individual'

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
