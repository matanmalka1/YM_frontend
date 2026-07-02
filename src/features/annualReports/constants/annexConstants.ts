import type { AnnualReportScheduleKey } from '../api'

export type FieldDef = {
  key: string
  label: string
  type: 'text' | 'number' | 'date'
}

/**
 * Field definitions per schedule. Keys MUST match the backend per-schedule
 * validators in `annual_report_annex_schemas.py` (SCHEDULE_VALIDATORS) — the
 * service validates the submitted `data` dict against those Pydantic models and
 * silently drops any unknown key, so a mismatch stores an empty row.
 */
export const SCHEDULE_FIELDS: Record<AnnualReportScheduleKey, FieldDef[]> = {
  schedule_a: [
    { key: 'gross_income', label: 'הכנסה ברוטו', type: 'number' },
    { key: 'cost_of_goods', label: 'עלות המכר', type: 'number' },
    { key: 'gross_profit', label: 'רווח גולמי', type: 'number' },
    { key: 'operating_expenses', label: 'הוצאות תפעול', type: 'number' },
    { key: 'net_income', label: 'הכנסה נטו', type: 'number' },
  ],
  schedule_b: [
    { key: 'property_address', label: 'כתובת הנכס', type: 'text' },
    { key: 'rental_income', label: 'הכנסה משכירות', type: 'number' },
    { key: 'depreciation_claimed', label: 'פחת שנתבע', type: 'number' },
    { key: 'maintenance_expenses', label: 'הוצאות אחזקה', type: 'number' },
    { key: 'net_rental_income', label: 'הכנסה נטו משכירות', type: 'number' },
  ],
  schedule_gimmel: [
    { key: 'security_name', label: 'שם נייר הערך', type: 'text' },
    { key: 'quantity', label: 'כמות', type: 'number' },
    { key: 'purchase_price', label: 'מחיר רכישה', type: 'number' },
    { key: 'sale_price', label: 'מחיר מכירה', type: 'number' },
    { key: 'gain_loss', label: 'רווח/הפסד', type: 'number' },
  ],
  schedule_dalet: [
    { key: 'country', label: 'מדינה', type: 'text' },
    { key: 'income_type', label: 'סוג הכנסה', type: 'text' },
    { key: 'gross_income', label: 'הכנסה ברוטו', type: 'number' },
    { key: 'foreign_tax_paid', label: 'מס זר ששולם', type: 'number' },
    { key: 'net_income', label: 'הכנסה נטו', type: 'number' },
  ],
  form_150: [
    { key: 'foreign_entity_name', label: 'שם חבר בני האדם', type: 'text' },
    { key: 'country', label: 'מדינה', type: 'text' },
    { key: 'holding_percentage', label: 'שיעור החזקה (%)', type: 'number' },
    { key: 'control_rights', label: 'זכויות שליטה', type: 'text' },
  ],
  form_1504: [
    { key: 'partnership_name', label: 'שם השותפות', type: 'text' },
    { key: 'partnership_id_number', label: 'מספר מזהה שותפות', type: 'text' },
    { key: 'share_percentage', label: 'שיעור חלק (%)', type: 'number' },
    { key: 'income_share', label: 'חלק בהכנסה', type: 'number' },
  ],
  form_6111: [
    { key: 'turnover_amount', label: 'מחזור', type: 'number' },
    { key: 'accounting_method', label: 'שיטת דיווח', type: 'text' },
    { key: 'bookkeeping_basis', label: 'בסיס ניהול ספרים', type: 'text' },
  ],
  form_1344: [
    { key: 'loss_type', label: 'סוג ההפסד', type: 'text' },
    { key: 'originating_year', label: 'שנת מקור', type: 'number' },
    { key: 'loss_amount', label: 'סכום ההפסד', type: 'number' },
    { key: 'utilized_amount', label: 'סכום שנוצל', type: 'number' },
  ],
  form_1399: [
    { key: 'asset_description', label: 'תיאור הנכס', type: 'text' },
    { key: 'sale_date', label: 'תאריך מכירה', type: 'date' },
    { key: 'proceeds_amount', label: 'תמורה', type: 'number' },
    { key: 'cost_amount', label: 'עלות', type: 'number' },
    { key: 'capital_gain', label: 'רווח הון', type: 'number' },
  ],
  form_1350: [
    { key: 'company_name', label: 'שם החברה', type: 'text' },
    { key: 'withdrawal_amount', label: 'סכום המשיכה', type: 'number' },
    { key: 'withdrawal_date', label: 'תאריך משיכה', type: 'date' },
    { key: 'balance_at_year_end', label: 'יתרה לסוף שנה', type: 'number' },
  ],
  form_1327: [
    { key: 'trust_name', label: 'שם הנאמנות', type: 'text' },
    { key: 'trustee_name', label: 'שם הנאמן', type: 'text' },
    { key: 'israel_income', label: 'הכנסה בישראל', type: 'number' },
    { key: 'foreign_income', label: 'הכנסה מחו"ל', type: 'number' },
  ],
  form_1342: [
    { key: 'asset_description', label: 'תיאור הנכס', type: 'text' },
    { key: 'asset_cost', label: 'עלות הנכס', type: 'number' },
    { key: 'depreciation_rate', label: 'שיעור פחת (%)', type: 'number' },
  ],
  form_1343: [
    { key: 'asset_description', label: 'תיאור הנכס', type: 'text' },
    { key: 'qualifying_amount', label: 'סכום מזכה', type: 'number' },
    { key: 'extra_deduction_amount', label: 'ניכוי נוסף', type: 'number' },
  ],
  form_1348: [
    { key: 'foreign_residency_country', label: 'מדינת תושבות', type: 'text' },
    { key: 'days_in_israel', label: 'ימים בישראל', type: 'number' },
    { key: 'tie_breaker_basis', label: 'בסיס שובר שוויון', type: 'text' },
  ],
  form_858: [
    { key: 'partnership_name', label: 'שם השותפות', type: 'text' },
    { key: 'units_held', label: 'יחידות שהוחזקו', type: 'number' },
    { key: 'income_share', label: 'חלק בהכנסה', type: 'number' },
    { key: 'expense_share', label: 'חלק בהוצאה', type: 'number' },
  ],
}

/** Flattened annex field-key → Hebrew label, across all schedules (for nested `data` rendering). */
export const ANNEX_FIELD_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SCHEDULE_FIELDS).flatMap((fields) => fields.map((f) => [f.key, f.label])),
)

export const ALL_SCHEDULES: AnnualReportScheduleKey[] = [
  'schedule_a',
  'schedule_b',
  'schedule_gimmel',
  'schedule_dalet',
  'form_150',
  'form_1504',
  'form_6111',
  'form_1344',
  'form_1399',
  'form_1350',
  'form_1327',
  'form_1342',
  'form_1343',
  'form_1348',
  'form_858',
]
