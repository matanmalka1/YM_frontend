import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type { AttentionUrgency } from './api/contracts'
import type { DashboardCreateModal } from './hooks/useDashboardCreateModals'

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
  href?: string
  modal?: DashboardCreateModal
}

export const QUICK_ACTIONS: QuickActionDef[] = [
  { id: 'create-vat', label: 'צור דוח מע״מ חדש', description: 'יצירת דוח לתקופה חדשה', modal: 'vat' },
  { id: 'advance-payments', label: 'צור מקדמה חדשה', description: 'פתיחת טופס מקדמה חדשה', modal: 'advancePayment' },
  { id: 'create-charge', label: 'צור חיוב חדש', description: 'יצירת חיוב ללקוח', modal: 'charge' },
  { id: 'create-client', label: 'צור לקוח חדש', description: 'יצירת כרטיס לקוח', modal: 'client' },
]

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
