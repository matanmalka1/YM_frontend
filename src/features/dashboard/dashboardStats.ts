import { CreditCard, FileText } from 'lucide-react'
import { formatCount, formatCurrencyILS } from '@/utils/utils'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import type { DashboardOverviewResponse } from './api'
import type { StatItem } from './components/DashboardStatsGrid'
import { DASHBOARD_HREFS, type VatPeriodType } from './dashboardConstants'

type DashboardStatsData = Pick<
  DashboardOverviewResponse,
  'vat_stats' | 'open_charges_count' | 'open_charges_amount_ils'
>

const getVatStatVariant = (stat: DashboardStatsData['vat_stats']['monthly']): StatItem['variant'] => {
  if (stat.pending <= 0) return 'green'
  return stat.completion_percent >= 80 ? 'amber' : 'red'
}

const buildVatStat = (
  key: string,
  title: string,
  stat: DashboardStatsData['vat_stats']['monthly'],
  periodType: VatPeriodType,
): StatItem => {
  const variant = getVatStatVariant(stat)

  return {
    key,
    title,
    value: `${formatCount(stat.pending)} דוחות ממתינים`,
    description: `${stat.period_label} · ${stat.status_label}`,
    icon: FileText,
    variant,
    urgent: variant === 'red',
    href: DASHBOARD_HREFS.vat(stat.period, periodType),
    progress: stat.completion_percent,
    actionLabel: stat.required > 0 ? 'פתח דוחות מע״מ' : 'צור דוח מע״מ ראשון',
  }
}

const buildAdvanceStat = (
  key: string,
  title: string,
  stat: DashboardStatsData['vat_stats']['monthly'],
  period: 1 | 2,
): StatItem => {
  const variant = getVatStatVariant(stat)

  return {
    key,
    title,
    value: `${formatCount(stat.pending)} מקדמות לתשלום`,
    description: `${stat.period_label} · ממתינות לתשלום`,
    icon: CreditCard,
    variant,
    urgent: variant === 'red',
    href: DASHBOARD_HREFS.advancePayments(getOperationalTaxYear(), period),
    progress: stat.completion_percent,
    actionLabel: 'פתח מקדמות מס הכנסה',
  }
}

export const buildDashboardStats = (data: DashboardStatsData, isAdvisor: boolean): StatItem[] => {
  const stats: StatItem[] = [
    buildVatStat('monthly_vat', 'מע״מ חודשי', data.vat_stats.monthly, 'monthly'),
    buildVatStat('bimonthly_vat', 'מע״מ דו־חודשי', data.vat_stats.bimonthly, 'bimonthly'),
    buildAdvanceStat('monthly_advance', 'מקדמות חודשיות', data.vat_stats.advance_payments.monthly, 1),
    buildAdvanceStat('bimonthly_advance', 'מקדמות דו־חודשיות', data.vat_stats.advance_payments.bimonthly, 2),
  ]

  if (isAdvisor) {
    stats.push({
      key: 'open_charges',
      title: 'חיובים פתוחים',
      value: `${formatCount(data.open_charges_count)} חיובים פתוחים`,
      description: data.open_charges_amount_ils
        ? `${formatCurrencyILS(data.open_charges_amount_ils)} לגבייה`
        : 'ללא חיובים פתוחים',
      icon: CreditCard,
      variant: data.open_charges_count > 0 ? 'red' : 'green',
      urgent: data.open_charges_count > 0,
      href: DASHBOARD_HREFS.openCharges,
      actionLabel: data.open_charges_count > 0 ? 'פתח חיובים' : 'כל החיובים שולמו',
    })
  }

  return stats
}
