import type { LucideIcon } from 'lucide-react'
import { ClipboardList, ReceiptText, UserPlus, Wallet } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { AttentionUrgency } from './api/contracts'
import type { DashboardCreateModal } from './hooks/useDashboardCreateModals'

const withParams = (base: string, params: Record<string, string>) => `${base}?${new URLSearchParams(params).toString()}`

export type VatPeriodType = 'monthly' | 'bimonthly'

export const DASHBOARD_HREFS = {
  vat: (period: string, periodType: VatPeriodType) => withParams('/tax/vat', { period, period_type: periodType }),
  advancePayments: (year: string | number, periodMonthsCount: 1 | 2) =>
    withParams('/tax/advance-payments', { year: String(year), period: String(periodMonthsCount) }),
  openCharges: withParams('/charges', { status: 'issued' }),
}

export const DASHBOARD_COPY = {
  pageTitle: 'לוח בקרה',
  pageSubtitle: 'תמונת מצב תפעולית להיום',
  roleMissing: 'לא ניתן לזהות תפקיד משתמש',
  loadingDashboard: 'טוען נתוני לוח בקרה...',
  dashboardLoaded: 'נתונים נטענו בהצלחה',
  dashboardLoadError: 'שגיאה בטעינת לוח הבקרה',
  permissionDenied: 'אין הרשאה לצפות בנתוני לוח בקרה זה',
} as const

export const DASHBOARD_LOADING_CARD_COUNT = 5

export const DASHBOARD_ONBOARDING_COPY = {
  title: 'עדיין אין נתונים במערכת',
  description: 'כדי להתחיל: צור לקוח ראשון. המערכת תפתח קלסר ותייצר מועדים רלוונטיים אוטומטית.',
  cta: 'צור לקוח ראשון',
} as const

const ATTENTION_ALL_CLEAR = 'הכל תקין — אין דברים דחופים לטיפול'

export const ATTENTION_BOARD_COPY = {
  title: 'דרוש טיפול',
  subtitleEmpty: ATTENTION_ALL_CLEAR,
  subtitleActive: 'הדברים החשובים לטיפול עכשיו',
  empty: ATTENTION_ALL_CLEAR,
} as const

export interface QuickActionDef {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href?: string
  modal?: DashboardCreateModal
}

export const QUICK_ACTIONS: QuickActionDef[] = [
  { id: 'create-client', label: 'לקוח חדש', description: 'יצירת כרטיס לקוח', icon: UserPlus, modal: 'client' },
  { id: 'create-vat', label: 'דוח מע״מ', description: 'יצירת דוח לתקופה חדשה', icon: ClipboardList, modal: 'vat' },
  { id: 'create-charge', label: 'חיוב חדש', description: 'יצירת חיוב ללקוח', icon: ReceiptText, modal: 'charge' },
  {
    id: 'advance-payments',
    label: 'מקדמה',
    description: 'פתיחת טופס מקדמה חדשה',
    icon: Wallet,
    modal: 'advancePayment',
  },
]

export const VAT_STAT_LABELS = {
  vatMonthly: 'מע״מ חודשי',
  vatBimonthly: 'מע״מ דו-חודשי',
  advanceMonthly: 'מקדמות חודשיות',
  advanceBimonthly: 'מקדמות דו-חודשיות',
} as const

export const ATTENTION_URGENCY_LABELS: Record<AttentionUrgency, string> = {
  overdue: 'באיחור',
  approaching: 'דחוף',
  important: 'חשוב',
  upcoming: 'בקרוב',
}

export const ATTENTION_URGENCY_VARIANTS: Record<AttentionUrgency, BadgeVariant> = {
  overdue: 'error',
  approaching: 'warning',
  important: 'info',
  upcoming: 'neutral',
}
