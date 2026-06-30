import type { EntityAuditType } from './api'
import { PAGE_SIZE_MD, PAGE_SIZE_MAX } from '@/constants/pagination.constants'

export const AUDIT_PAGE_SIZE = PAGE_SIZE_MD

export const AUDIT_USERS_LIST_PARAMS = { page: 1, page_size: PAGE_SIZE_MAX } as const

// Persisted action values are namespaced `<entity_type>.<verb>` (backend §7/§6).
const auditAction = (entityType: EntityAuditType, verb: string): string => `${entityType}.${verb}`

const GENERIC_VERB_LABELS: Record<string, string> = {
  created: 'נוצר',
  updated: 'עודכן',
  deleted: 'נמחק',
  restored: 'שוחזר',
  status_changed: 'שינוי סטטוס',
}

const CHARGE_VERB_LABELS: Record<string, string> = {
  issued: 'הונפק',
  paid: 'שולם',
  canceled: 'בוטל',
}

const ANNUAL_REPORT_VERB_LABELS: Record<string, string> = {
  deadline_updated: 'עודכן מועד הגשה',
  income_line_added: 'נוספה הכנסה',
  income_line_updated: 'עודכנה הכנסה',
  income_line_deleted: 'נמחקה הכנסה',
  expense_line_added: 'נוספה הוצאה',
  expense_line_updated: 'עודכנה הוצאה',
  expense_line_deleted: 'נמחקה הוצאה',
  annex_line_added: 'נוספה שורת נספח',
  annex_line_updated: 'עודכנה שורת נספח',
  annex_line_deleted: 'נמחקה שורת נספח',
}

const CLIENT_VERB_LABELS: Record<string, string> = {
  entity_type_changed: 'שינוי סוג ישות',
}

const CLIENT_LIKE_VERBS = ['created', 'updated', 'deleted', 'restored']

export const AUDIT_ACTIONS_BY_ENTITY_TYPE: Record<EntityAuditType, string[]> = {
  client: [...CLIENT_LIKE_VERBS, ...Object.keys(CLIENT_VERB_LABELS)].map((v) => auditAction('client', v)),
  business: CLIENT_LIKE_VERBS.map((v) => auditAction('business', v)),
  charge: [...CLIENT_LIKE_VERBS, ...Object.keys(CHARGE_VERB_LABELS)].map((v) => auditAction('charge', v)),
  annual_report: [...CLIENT_LIKE_VERBS, 'status_changed', ...Object.keys(ANNUAL_REPORT_VERB_LABELS)].map((v) =>
    auditAction('annual_report', v),
  ),
}

const buildActionLabels = (): Record<string, string> => {
  const labels: Record<string, string> = {}
  const verbLabel = (verb: string): string | undefined =>
    GENERIC_VERB_LABELS[verb] ?? CLIENT_VERB_LABELS[verb] ?? CHARGE_VERB_LABELS[verb] ?? ANNUAL_REPORT_VERB_LABELS[verb]
  for (const actions of Object.values(AUDIT_ACTIONS_BY_ENTITY_TYPE)) {
    for (const action of actions) {
      const verb = action.split('.').slice(1).join('.')
      const label = verbLabel(verb)
      if (label) labels[action] = label
    }
  }
  return labels
}

// Keyed by the full namespaced action (the value used in the table and filters).
export const AUDIT_ACTION_LABELS: Record<string, string> = buildActionLabels()

export const AUDIT_FIELD_LABELS: Record<string, string> = {
  full_name: 'שם לקוח',
  client_record_id: 'לקוח',
  client_type: 'סוג לקוח',
  id_number: 'מספר מזהה',
  entity_type: 'סוג ישות',
  business_name: 'שם עסק',
  business_id: 'עסק',
  office_client_number: 'מספר לקוח',
  status: 'סטטוס',
  amount: 'סכום',
  charge_type: 'סוג חיוב',
  category: 'קטגוריה',
  description: 'תיאור',
  form_type: 'סוג טופס',
  line_id: 'שורת דיווח',
  period: 'תקופה',
  months_covered: 'חודשים',
  source_type: 'סוג הכנסה',
  tax_year: 'שנת מס',
  vat_reporting_frequency: 'תדירות מע״מ',
  advance_payment_frequency: 'תדירות מקדמות',
  advance_rate: 'שיעור מקדמות',
  accountant_id: 'רואה חשבון',
  phone: 'טלפון',
  email: 'אימייל',
  address_street: 'רחוב',
  address_building_number: 'מספר בית',
  address_apartment: 'דירה',
  address_city: 'עיר',
  address_zip_code: 'מיקוד',
  opened_at: 'נפתח בתאריך',
  closed_at: 'נסגר בתאריך',
  issued_at: 'תאריך הנפקה',
  paid_at: 'תאריך תשלום',
  canceled_at: 'תאריך ביטול',
  cancellation_reason: 'סיבת ביטול',
  custom_deadline_note: 'הערת מועד מותאם',
  data: 'נתונים',
  deadline_type: 'סוג מועד',
  donation_amount: 'תרומות',
  filing_deadline: 'מועד הגשה',
  internal_notes: 'הערות פנימיות',
  line_number: 'מספר שורה',
  notes: 'הערות',
  schedule: 'נספח',
  annual_revenue: 'מחזור שנתי',
  advance_rate_updated_at: 'תאריך עדכון שיעור מקדמות',
}
