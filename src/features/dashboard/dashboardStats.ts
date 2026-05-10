import { Archive, CreditCard, FileText } from 'lucide-react'
import type { DashboardOverviewResponse } from './api'
import type { StatItem } from './components/DashboardStatsGrid'

type DashboardStatsData = Pick<
  DashboardOverviewResponse,
  | 'vat_stats'
  | 'binders_in_office'
  | 'binders_ready_for_pickup'
  | 'open_charges_count'
  | 'open_charges_amount_ils'
>

type VatPeriodType = 'monthly' | 'bimonthly'

const withParams = (base: string, params: Record<string, string>) => `${base}?${new URLSearchParams(params).toString()}`

const HREFS = {
  vat: (period: string, periodType: VatPeriodType) => withParams('/tax/vat', { period, period_type: periodType }),
  advancePayments: (period: '1' | '2') => withParams('/tax/advance-payments', { period }),
  bindersReadyForPickup: withParams('/binders', { status: 'ready_for_pickup' }),
  openCharges: withParams('/charges', { status: 'issued' }),
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

export const buildDashboardStats = (data: DashboardStatsData, isAdvisor: boolean): StatItem[] => {
  const stats: StatItem[] = [
    buildVatStat('monthly_vat', 'מע״מ חודשי', data.vat_stats.monthly, 'monthly'),
    buildVatStat('bimonthly_vat', 'מע״מ דו־חודשי', data.vat_stats.bimonthly, 'bimonthly'),
    buildAdvanceStat('monthly_advance', 'מקדמות חודשיות', data.vat_stats.advance_payments.monthly, '1'),
    buildAdvanceStat('bimonthly_advance', 'מקדמות דו־חודשיות', data.vat_stats.advance_payments.bimonthly, '2'),
  ]

  if (isAdvisor) {
    stats.push({
      key: 'open_charges',
      title: 'חיובים פתוחים',
      value: `${data.open_charges_count.toLocaleString('he-IL')} חיובים פתוחים`,
      description: data.open_charges_amount_ils ? `${data.open_charges_amount_ils} לגבייה` : 'ללא חיובים פתוחים',
      icon: CreditCard,
      variant: data.open_charges_count > 0 ? 'red' : 'green',
      urgent: data.open_charges_count > 0,
      href: HREFS.openCharges,
      actionLabel: data.open_charges_count > 0 ? 'פתח חיובים' : 'כל החיובים שולמו',
    })

    if (data.binders_ready_for_pickup > 0) {
      stats.push({
        key: 'binders_pickup',
        title: 'קלסרים לאיסוף',
        value: `${data.binders_ready_for_pickup.toLocaleString('he-IL')} ממתינים לאיסוף`,
        description:
          data.binders_in_office > 0
            ? `${data.binders_in_office.toLocaleString('he-IL')} קלסרים במשרד`
            : 'אין קלסרים במשרד',
        icon: Archive,
        variant: 'amber',
        urgent: true,
        href: HREFS.bindersReadyForPickup,
        actionLabel: 'פתח קלסרים',
      })
    }
  }

  return stats
}
