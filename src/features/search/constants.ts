import type { OperationalSearchResultType } from './api/contracts'

export const OPERATIONAL_RESULT_LABELS: Record<OperationalSearchResultType, string> = {
  task: 'משימות',
  vat_work_item: 'דוחות מע״מ',
  annual_report: 'דוחות שנתיים',
  charge: 'חיובים',
  advance_payment: 'מקדמות',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'פתוחה',
  done: 'הושלמה',
  canceled: 'בוטלה',
  pending_materials: 'ממתין לחומרים',
  material_received: 'חומרים התקבלו',
  data_entry_in_progress: 'בהזנת נתונים',
  ready_for_review: 'מוכן לבדיקה',
  filed: 'הוגש',
  not_started: 'טרם התחיל',
  collecting_docs: 'איסוף מסמכים',
  in_preparation: 'בהכנה',
  pending_client: 'ממתין ללקוח',
  submitted: 'הוגש',
  closed: 'נסגר',
  draft: 'טיוטה',
  issued: 'פתוח',
  paid: 'שולם',
  pending: 'ממתינה',
  partial: 'שולם חלקית',
}

export const getOperationalStatusLabel = (status: string): string => STATUS_LABELS[status] ?? status
