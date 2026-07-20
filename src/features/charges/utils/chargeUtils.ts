import { formatCurrencyILS, MONTH_NAMES } from '../../../utils/utils'
import type { ChargeListItem } from '../api'
import { CHARGE_PERIOD_PATTERN } from '../constants'
import { CHARGES_MESSAGES } from '../messages'
import type { BackendAction } from '@/lib/actions/types'

type ChargeBusiness = { id: number; business_name?: string | null }

const hasChargeAction = (actions: BackendAction[] | null | undefined, key: string): boolean =>
  actions?.some((action) => action.key === key) ?? false

export const canIssue = (actions: BackendAction[] | null | undefined): boolean =>
  hasChargeAction(actions, 'issue_charge')

export const canMarkPaid = (actions: BackendAction[] | null | undefined): boolean =>
  hasChargeAction(actions, 'mark_paid')

export const canCancel = (actions: BackendAction[] | null | undefined): boolean =>
  hasChargeAction(actions, 'cancel_charge')

export const canDeleteCharge = (actions: BackendAction[] | null | undefined): boolean =>
  hasChargeAction(actions, 'delete_charge')

export const canEditCharge = (actions: BackendAction[] | null | undefined): boolean =>
  hasChargeAction(actions, 'edit_charge')

export const getChargePeriodLabel = (period: string | null, monthsCovered: number | null): string => {
  if (!period) return '—'

  const match = CHARGE_PERIOD_PATTERN.exec(period)
  if (!match) return period

  const [yearPart, monthPart] = period.split('-')
  const startYear = Number(yearPart)
  const startMonthIndex = Number(monthPart) - 1
  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(startMonthIndex) ||
    startMonthIndex < 0 ||
    startMonthIndex >= MONTH_NAMES.length
  ) {
    return period
  }

  const coverage = monthsCovered === 2 ? 2 : 1
  const startLabel = MONTH_NAMES[startMonthIndex]

  if (coverage === 1) {
    return `${startLabel} ${startYear}`
  }

  const endDate = new Date(startYear, startMonthIndex + coverage - 1, 1)
  const endLabel = MONTH_NAMES[endDate.getMonth()]
  const endYear = endDate.getFullYear()

  if (endYear === startYear) {
    return `${startLabel}-${endLabel} ${startYear}`
  }

  return `${startLabel} ${startYear} - ${endLabel} ${endYear}`
}

export const getChargeAmountText = (charge: ChargeListItem): string => {
  if (!charge.amount) return '—'
  return formatCurrencyILS(charge.amount, { compact: true, fractionDigits: 2 })
}

export const getChargeClientLabel = (charge: ChargeListItem): string =>
  charge.client_name ?? `לקוח #${charge.client_record_id}`

export const getChargeBusinessLabel = (business: ChargeBusiness): string =>
  business.business_name ?? CHARGES_MESSAGES.create.businessName(business.id)
