import { Bell, CreditCard, FileText } from 'lucide-react'
import type { DashboardOverviewResponse } from './api'
import type { StatItem } from './components/DashboardStatsGrid'

type DashboardStatsData = Pick<DashboardOverviewResponse, 'open_reminders' | 'vat_stats'>

type VatPeriodType = 'monthly' | 'bimonthly'

const withParams = (base: string, params: Record<string, string>) => `${base}?${new URLSearchParams(params).toString()}`

const HREFS = {
  remindersReady: withParams('/reminders', { status: 'pending', due: 'ready' }),
  vat: (period: string, periodType: VatPeriodType) => withParams('/tax/vat', { period, period_type: periodType }),
  advancePayments: (period: '1' | '2') => withParams('/tax/advance-payments', { period }),
}

const vatVariant = (pending: number): StatItem['variant'] => (pending > 0 ? 'red' : 'green')

const buildVatStat = (
  key: string,
  title: string,
  stat: DashboardStatsData['vat_stats']['monthly'],
  periodType: VatPeriodType,
): StatItem => ({
  key,
  title,
  value: `${stat.pending.toLocaleString('he-IL')} דוחות ממתינים`,
  description: `${stat.period_label} · ${stat.status_label}`,
  icon: FileText,
  variant: vatVariant(stat.pending),
  urgent: stat.pending > 0,
  href: HREFS.vat(stat.period, periodType),
  progress: stat.completion_percent,
  actionLabel: stat.required > 0 ? 'פתח דוחות מע״מ' : 'צור תיק מע״מ ראשון',
})

const buildAdvanceStat = (
  key: string,
  title: string,
  stat: DashboardStatsData['vat_stats']['monthly'],
  period: '1' | '2',
): StatItem => ({
  key,
  title,
  value: `${stat.pending.toLocaleString('he-IL')} מקדמות לתשלום`,
  description: `${stat.period_label} · ממתינות לתשלום`,
  icon: CreditCard,
  variant: vatVariant(stat.pending),
  urgent: stat.pending > 0,
  href: HREFS.advancePayments(period),
  progress: stat.completion_percent,
  actionLabel: 'פתח מקדמות מס הכנסה',
})

export const buildDashboardStats = (data: DashboardStatsData): StatItem[] => [
  {
    key: 'ready_reminders',
    title: 'תזכורות ידניות',
    value: `${data.open_reminders.toLocaleString('he-IL')} לטיפול עכשיו`,
    description: 'תזכורות ידניות שמועד הטיפול שלהן הגיע',
    icon: Bell,
    variant: 'amber',
    urgent: data.open_reminders > 0,
    href: HREFS.remindersReady,
    actionLabel: data.open_reminders > 0 ? 'פתח תזכורות' : 'צור תזכורת ראשונה',
  },
  buildVatStat('monthly_vat', 'מע״מ חודשי', data.vat_stats.monthly, 'monthly'),
  buildVatStat('bimonthly_vat', 'מע״מ דו־חודשי', data.vat_stats.bimonthly, 'bimonthly'),
  buildAdvanceStat('monthly_advance', 'מקדמות חודשיות', data.vat_stats.advance_payments.monthly, '1'),
  buildAdvanceStat('bimonthly_advance', 'מקדמות דו־חודשיות', data.vat_stats.advance_payments.bimonthly, '2'),
]
