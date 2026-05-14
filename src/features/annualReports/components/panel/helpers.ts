import type { AnnualReportFull, AdvancesSummary } from '../../api'
import { formatClientOfficeId, formatCurrencyILS } from '@/utils/utils'
import { ALERT_WINDOW_DAYS, CLIENT_TYPE_LABELS, LOCALE } from './constants'
import { formatAnnualReportDate, parseAnnualReportCalendarDate } from '../shared/annualReports.constants'

export type AlertVariant = 'error' | 'warning' | 'info' | 'success'
export type AlertIcon = 'alert' | 'check' | 'info' | 'x'

export interface AlertBannerData {
  variant: AlertVariant
  icon: AlertIcon
  message: string
  cta?: { label: string; onClick: () => void }
}

type BalanceAlertInput = {
  balance_type: AdvancesSummary['balance_type']
  final_balance: number | string
}

export const formatPanelDate = (value: string | null): string => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(LOCALE)
}

export const getClientLabel = (report: AnnualReportFull): string => {
  const officeId = formatClientOfficeId(report.client_record_id)
  return report.client_name ? `${report.client_name} (${officeId})` : `לקוח ${officeId}`
}

export const getClientTypeLabel = (report: AnnualReportFull): string =>
  CLIENT_TYPE_LABELS[report.client_type] ?? report.client_type

export const clampPercent = (value: number): number => Math.max(0, Math.min(100, value))

export const sortReportsByTaxYearDesc = (reports: AnnualReportFull[]): AnnualReportFull[] =>
  [...reports].sort((a, b) => b.tax_year - a.tax_year)

export const getBalanceVariant = (balanceType: AdvancesSummary['balance_type']) => {
  if (balanceType === 'due') return 'red'
  if (balanceType === 'refund') return 'green'
  return 'neutral'
}

export const getBalanceDescription = (advances: AdvancesSummary): string => {
  const absBalance = Math.abs(Number(advances.final_balance))
  if (advances.balance_type === 'due') return `יתרה: ₪${absBalance.toLocaleString(LOCALE)} לתשלום`
  if (advances.balance_type === 'refund') return `יתרה: ₪${absBalance.toLocaleString(LOCALE)} החזר`
  return 'מאוזן'
}

export const getFinalBalanceText = (finalBalance: number | string | null | undefined): string => {
  if (finalBalance == null) return '—'
  const amount = Number(finalBalance)
  return amount > 0 ? `${formatCurrencyILS(amount)} לתשלום` : `${formatCurrencyILS(Math.abs(amount))} החזר`
}

export const formatAbsCurrency = (value: number | string): string => formatCurrencyILS(Math.abs(Number(value)))

export const getAlertBanners = (report: AnnualReportFull, advances?: BalanceAlertInput): AlertBannerData[] => {
  const banners: AlertBannerData[] = []
  const finalBalance = Number(advances?.final_balance ?? 0)

  if (advances?.balance_type === 'due' && finalBalance > 0) {
    banners.push({
      variant: 'error',
      icon: 'x',
      message: `יתרת מס לתשלום — ${formatCurrencyILS(finalBalance)}. לאחר קיזוז מקדמות ששולמו.`,
      cta: { label: 'שלח הודעה', onClick: () => {} },
    })
  }

  if (report.filing_deadline) {
    const deadline = parseAnnualReportCalendarDate(report.filing_deadline)
    if (!deadline) return banners
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)

    if (daysLeft > 0 && daysLeft <= ALERT_WINDOW_DAYS) {
      banners.push({
        variant: 'warning',
        icon: 'alert',
        message: `מועד הגשת הדוח לשנת מס ${report.tax_year} הוא ${formatAnnualReportDate(report.filing_deadline)} — נותרו ${daysLeft} ימים.`,
      })
    }

    if (daysLeft < 0) {
      banners.push({
        variant: 'error',
        icon: 'x',
        message: `מועד הגשת הדוח לשנת מס ${report.tax_year} חלף לפני ${Math.abs(daysLeft)} ימים.`,
      })
    }
  }

  if (report.status === 'submitted' && report.submitted_at) {
    banners.push({
      variant: 'info',
      icon: 'info',
      message: `הדוח הוגש ב-${formatPanelDate(report.submitted_at)} ממתין לאישור רשות המסים.`,
    })
  }

  if (report.status === 'closed') {
    banners.push({
      variant: 'success',
      icon: 'check',
      message: `דוח שנת מס ${report.tax_year} אושר וסגור בהצלחה.`,
    })
  }

  if (advances?.balance_type === 'refund' && finalBalance < 0) {
    banners.push({
      variant: 'success',
      icon: 'check',
      message: `צפוי החזר מס בסך ${formatCurrencyILS(Math.abs(finalBalance))} לשנת מס ${report.tax_year}.`,
    })
  }

  return banners
}
