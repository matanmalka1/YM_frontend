import type { AnnualReportScheduleKey } from './api'

export type FieldDef = {
  key: string
  label: string
  type: 'text' | 'number' | 'date'
}

const FOREIGN_INCOME_FIELDS: FieldDef[] = [
  { key: 'country', label: 'מדינה', type: 'text' },
  { key: 'income_type', label: 'סוג הכנסה', type: 'text' },
  { key: 'gross_amount', label: 'סכום ברוטו', type: 'number' },
  { key: 'foreign_tax_paid', label: 'מס זר ששולם', type: 'number' },
  { key: 'credit_claimed', label: 'זיכוי נדרש', type: 'number' },
]

const GENERIC_NOTE_FIELD: FieldDef[] = [
  { key: 'notes', label: 'פרטים', type: 'text' },
  { key: 'amount', label: 'סכום', type: 'number' },
]

export const SCHEDULE_FIELDS: Record<AnnualReportScheduleKey, FieldDef[]> = {
  schedule_a: [
    { key: 'business_income', label: 'הכנסה מעסק', type: 'number' },
    { key: 'business_expenses', label: 'הוצאות עסק', type: 'number' },
    { key: 'net_business_income', label: 'הכנסה נטו מעסק', type: 'number' },
  ],
  schedule_b: [
    { key: 'property_address', label: 'כתובת הנכס', type: 'text' },
    { key: 'rental_income', label: 'הכנסה משכירות', type: 'number' },
  ],
  schedule_gimmel: FOREIGN_INCOME_FIELDS,
  schedule_dalet: [
    { key: 'asset_name', label: 'שם הנכס', type: 'text' },
    { key: 'purchase_date', label: 'תאריך רכישה', type: 'date' },
    { key: 'cost', label: 'עלות', type: 'number' },
    { key: 'depreciation_rate', label: 'שיעור פחת (%)', type: 'number' },
    { key: 'annual_depreciation', label: 'פחת שנתי', type: 'number' },
    { key: 'accumulated', label: 'פחת מצטבר', type: 'number' },
  ],
  form_150: GENERIC_NOTE_FIELD,
  form_1504: GENERIC_NOTE_FIELD,
  form_6111: GENERIC_NOTE_FIELD,
  form_1344: GENERIC_NOTE_FIELD,
  form_1399: [
    { key: 'asset_description', label: 'תיאור הנכס', type: 'text' },
    { key: 'sale_date', label: 'תאריך מכירה', type: 'date' },
    { key: 'sale_price', label: 'מחיר מכירה', type: 'number' },
    { key: 'purchase_price', label: 'מחיר רכישה', type: 'number' },
    { key: 'taxable_gain', label: 'רווח חייב', type: 'number' },
  ],
  form_1350: GENERIC_NOTE_FIELD,
  form_1327: GENERIC_NOTE_FIELD,
  form_1342: [
    { key: 'asset_name', label: 'שם הנכס', type: 'text' },
    { key: 'cost', label: 'עלות', type: 'number' },
    { key: 'depreciation_rate', label: 'שיעור פחת (%)', type: 'number' },
    { key: 'annual_depreciation', label: 'פחת שנתי', type: 'number' },
  ],
  form_1343: GENERIC_NOTE_FIELD,
  form_1348: GENERIC_NOTE_FIELD,
  form_858: GENERIC_NOTE_FIELD,
}

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

