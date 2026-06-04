import type { VatAutoPopulateSkippedItem } from '../../api'

export const DEFAULT_RECOGNITION_RATE = '100'
export const MAX_PERCENTAGE = 100
export const MIN_PERCENTAGE = 0
export const TREND_REPORT_LIMIT = 4

export const FINANCIAL_MESSAGES = {
  chooseCategory: 'יש לבחור קטגוריה',
  chooseType: 'יש לבחור סוג',
  positiveAmount: 'יש להזין סכום חיובי',
  recognitionRate: 'שיעור הכרה חייב להיות בין 0 ל-100',
  autoPopulateError: 'שגיאה במילוי אוטומטי מנתוני מע"מ',
  loadingFinancials: 'טוען נתונים פיננסיים...',
  loadingSummary: 'טוען סיכום רווח והפסד...',
  noIncome: 'לא הוזנו הכנסות',
  noExpenses: 'לא הוזנו הוצאות',
} as const

export const FIELD_PLACEHOLDERS = {
  amount: 'סכום ₪',
  description: 'תיאור (אופציונלי)',
  recognitionRate: 'שיעור הכרה (%)',
  documentReference: 'אסמכתא (אופציונלי)',
  incomeType: 'בחר סוג...',
  expenseCategory: 'בחר קטגוריה...',
} as const

export const INLINE_ADD_FORM_CLASS = 'mt-2 flex flex-col gap-2'
export const INLINE_EDIT_FORM_CLASS = 'mt-2 mb-2 space-y-2 rounded-md border border-info-100 bg-info-50/30 p-2'

export const MONEY_INPUT_PROPS = {
  type: 'number',
  min: '0',
  step: '0.01',
} as const

export const PERCENTAGE_INPUT_PROPS = {
  type: 'number',
  min: String(MIN_PERCENTAGE),
  max: String(MAX_PERCENTAGE),
  step: '1',
} as const

export const CHART_MARGIN = { top: 4, right: 8, bottom: 4, left: 8 }

export const CHART_LINES = [
  { dataKey: 'הכנסות', stroke: '#3b82f6', strokeWidth: 2 },
  { dataKey: 'הוצאות', stroke: '#ef4444', strokeWidth: 2 },
  { dataKey: 'רווח', stroke: '#22c55e', strokeWidth: 2 },
  { dataKey: 'מס', stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4 2' },
] as const

export const VAT_AUTO_POPULATE_SKIPPED_REASON_LABELS: Record<VatAutoPopulateSkippedItem['reason'], string> = {
  zero_total: 'סכום אפס — לא נוצרה שורה',
  negative_total: 'סכום שלילי — נדרש לבדיקה',
  negative_source_contribution: 'קטגוריית מקור שלילית בתוך סכום חיובי',
}

export const VAT_AUTO_POPULATE_ITEM_TYPE_LABELS: Record<VatAutoPopulateSkippedItem['item_type'], string> = {
  income: 'הכנסה',
  expense: 'הוצאה',
}
