import type { DataTableProps } from '@/components/ui/table'
import { formatCurrencyILS, parsePositiveInt } from '@/utils/utils'
import { toOptionalNumber, toOptionalString } from '@/utils/filters'
import { chargesApi, type ChargeStatusStat, type ChargesListParams } from './api'
import { CHARGE_PERIOD_YEAR_SPAN, CHARGE_STATUS_OPTIONS, CHARGE_TYPE_OPTIONS_WITH_ALL } from './constants'
import type { ChargeAction, ChargesFilters } from './types'
import { getChargePeriodLabel } from './utils'

export const getChargesFilters = (searchParams: URLSearchParams): ChargesFilters => ({
  client_record_id: searchParams.get('client_record_id') ?? '',
  status: searchParams.get('status') ?? '',
  charge_type: searchParams.get('charge_type') ?? '',
  page: parsePositiveInt(searchParams.get('page'), 1),
  page_size: parsePositiveInt(searchParams.get('page_size'), 20),
})

export const toChargesListParams = (filters: ChargesFilters): ChargesListParams => ({
  client_record_id: toOptionalNumber(filters.client_record_id),
  status: toOptionalString(filters.status),
  charge_type: toOptionalString(filters.charge_type),
  page: filters.page,
  page_size: filters.page_size,
})

export const buildChargePeriodOptions = (monthsCovered: number) => {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: CHARGE_PERIOD_YEAR_SPAN * 2 + 1 },
    (_, index) => currentYear - CHARGE_PERIOD_YEAR_SPAN + index,
  )

  return [
    { value: '', label: 'ללא תקופה' },
    ...years.flatMap((year) =>
      Array.from({ length: 12 }, (_, monthIndex) => {
        const value = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
        return { value, label: getChargePeriodLabel(value, monthsCovered) }
      }),
    ),
  ]
}

export const buildChargeFilterBadges = (
  filters: ChargesFilters,
  onFilterChange: (key: string, value: string) => void,
) =>
  [
    getFilterBadge('status', filters.status, CHARGE_STATUS_OPTIONS, onFilterChange),
    getFilterBadge('charge_type', filters.charge_type, CHARGE_TYPE_OPTIONS_WITH_ALL, onFilterChange),
  ].filter((badge): badge is NonNullable<typeof badge> => badge !== null)

export const runChargeActionRequest = (chargeId: number, action: ChargeAction, reason?: string) => {
  if (action === 'issue') return chargesApi.issue(chargeId)
  if (action === 'markPaid') return chargesApi.markPaid(chargeId)
  return chargesApi.cancel(chargeId, reason)
}

export const getChargeStatusStatDisplay = (stat: ChargeStatusStat, isAdvisor: boolean): string =>
  isAdvisor ? formatCurrencyILS(stat.amount, { compact: true, fractionDigits: 2 }) : String(stat.count)

export const getChargeRowClassName = (status: string): string => {
  if (status === 'canceled') return 'text-gray-400'
  if (status === 'issued') return 'bg-primary-50/20'
  return ''
}

export const getChargesEmptyState = (
  isAdvisor: boolean,
  onCreate: () => void,
): DataTableProps<unknown>['emptyState'] => ({
  title: 'לא נמצאו חיובים',
  message: isAdvisor
    ? 'אין חיובים התואמים את הסינון. ניתן ליצור חיוב חדש בטופס למעלה.'
    : 'אין חיובים התואמים את הסינון הנוכחי.',
  action: isAdvisor ? { label: 'חיוב חדש', onClick: onCreate } : undefined,
})

const getFilterBadge = (
  key: string,
  value: string,
  options: { value: string; label: string }[],
  onFilterChange: (key: string, value: string) => void,
) => {
  if (!value) return null
  return {
    key,
    label: options.find((option) => option.value === value)?.label ?? value,
    onRemove: () => onFilterChange(key, ''),
  }
}
