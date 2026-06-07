import type { ComponentType } from 'react'
import {
  Banknote,
  CalendarClock,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Scale,
  Scissors,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { DeadlineType } from '../../api'
import type { SectionKey } from '../../types'

type IconComponent = ComponentType<{ size?: number; className?: string }>

export const PANEL_NAV_ITEMS: { key: SectionKey; icon: IconComponent; label: string }[] = [
  { key: 'overview', icon: LayoutDashboard, label: 'סקירה' },
  { key: 'financials', icon: TrendingUp, label: 'הכנסות והוצאות' },
  { key: 'tax', icon: Scale, label: 'חישוב מס' },
  { key: 'deductions', icon: Scissors, label: 'ניכויים' },
  { key: 'timeline', icon: CalendarClock, label: 'ציר זמן' },
]

export const PANEL_TAB_VARIANTS: Record<'active' | 'inactive', string> = {
  active: 'border-b-2 border-info-600 text-info-700 font-semibold bg-info-50/40',
  inactive: 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
}

export const SIDEBAR_NAV_VARIANTS: Record<'active' | 'inactive', string> = {
  active: 'bg-info-50 text-info-700 font-semibold border-r-2 border-info-600',
  inactive: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
}

export const DEADLINE_OPTIONS: { value: DeadlineType; label: string }[] = [
  { value: 'standard', label: 'סטנדרטי (29.05 ידני / 30.06 מקוון / 31.07 חברה)' },
  { value: 'extended', label: 'מורחב מייצגים — 31 ינואר' },
  { value: 'custom', label: 'מותאם אישית' },
]

export const CLIENT_TYPE_LABELS = {
  individual: 'יחיד (1301)',
  self_employed: 'עצמאי (1301)',
  corporation: 'חברה (1214)',
  public_institution: 'מלכ"ר / מוסד ציבורי (1215)',
  partnership: 'שותף בשותפות (1301)',
  control_holder: 'בעל שליטה (1301)',
  exempt_dealer: 'עוסק פטור (1301)',
} as const

export const SUMMARY_CARD_META = {
  recognizedExpenses: { title: 'הוצאות', icon: Receipt, variant: 'purple' },
  advancesPaid: { title: 'מקדמות ששולמו', icon: PiggyBank },
  finalBalance: { title: 'יתרה סופית', icon: PiggyBank },
  annualTax: { title: 'מס שנתי', icon: TrendingDown },
  netProfit: { title: 'רווח נקי', icon: TrendingUp, variant: 'green' },
  grossIncome: { title: 'הכנסות ברוטו', icon: Banknote, variant: 'neutral' },
} as const

export const ALERT_WINDOW_DAYS = 60
export const LOCALE = 'he-IL'
export const SKELETON_CARD_COUNT = 5
