import type { IncomeSourceType, ExpenseCategoryType } from './api'

export { LineRow } from './components/financials/FinancialLineRow'

export const INCOME_LABELS: Record<IncomeSourceType, string> = {
  business: 'הכנסות עסק',
  salary: 'משכורת',
  interest: 'ריבית',
  dividends: 'דיבידנד',
  capital_gains: 'רווחי הון',
  rental: 'שכירות',
  foreign: 'הכנסות מחו"ל',
  pension: 'פנסיה / קצבה',
  other: 'אחר',
}

export const EXPENSE_LABELS: Record<ExpenseCategoryType, string> = {
  office_rent: 'שכירות משרד',
  professional_services: 'שירותים מקצועיים',
  salaries: 'שכר עבודה',
  depreciation: 'פחת',
  vehicle: 'רכב',
  marketing: 'שיווק ופרסום',
  insurance: 'ביטוח',
  communication: 'תקשורת',
  travel: 'נסיעות',
  training: 'הכשרה מקצועית',
  bank_fees: 'עמלות בנק',
  other: 'אחר',
}

export const CREATE_REPORT_CLIENT_TYPES = [
  'individual',
  'self_employed',
  'corporation',
  'public_institution',
  'partnership',
  'control_holder',
  'exempt_dealer',
] as const

export const REPORT_DEADLINE_TYPES = ['standard', 'extended', 'custom'] as const
export const REPORT_SUBMISSION_METHODS = ['online', 'manual', 'representative'] as const
export const REPORT_EXTENSION_REASONS = ['military_service', 'health_reason', 'general', 'war_situation'] as const
