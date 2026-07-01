import type { ComponentType } from 'react'
import { CalendarClock, Files, LayoutDashboard, Scale, Scissors, TrendingUp } from 'lucide-react'
import type { SectionKey } from '../types'

type IconComponent = ComponentType<{ size?: number; className?: string }>

export const PANEL_NAV_ITEMS: { key: SectionKey; icon: IconComponent; label: string }[] = [
  { key: 'overview', icon: LayoutDashboard, label: 'סקירה' },
  { key: 'financials', icon: TrendingUp, label: 'הכנסות והוצאות' },
  { key: 'tax', icon: Scale, label: 'חישוב מס' },
  { key: 'deductions', icon: Scissors, label: 'ניכויים' },
  { key: 'annex', icon: Files, label: 'נספחים' },
  { key: 'timeline', icon: CalendarClock, label: 'ציר זמן' },
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

export const ALERT_WINDOW_DAYS = 60
