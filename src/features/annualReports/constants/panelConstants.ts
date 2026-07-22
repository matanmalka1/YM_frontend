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

export const ALERT_WINDOW_DAYS = 60
