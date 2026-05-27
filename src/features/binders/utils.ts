import { MONTH_NAMES } from '@/utils/utils'
import type { BinderAction, BinderResponse } from './types'

export const hasBinderAction = (binder: BinderResponse, action: BinderAction): boolean =>
  Boolean(binder.available_actions?.includes(action))


export const canMarkReadyForHandover = (locationStatus: string): boolean => locationStatus === 'in_office'

export const canRevertReadyForHandover = (locationStatus: string): boolean => locationStatus === 'ready_for_handover'

export const canHandoverToClient = (locationStatus: string): boolean => locationStatus === 'ready_for_handover'

export const toBinderPeriodValue = (year: number, monthStart: number, monthEnd: number): string => {
  if (monthStart === 1 && monthEnd === 12) return String(year)
  if (monthStart === monthEnd) return `${year}-${String(monthStart).padStart(2, '0')}`
  return `${year}-${String(monthStart).padStart(2, '0')}-${String(monthEnd).padStart(2, '0')}`
}

export const getBinderNumberLabel = (
  binderId: number | null,
  binders: BinderResponse[],
  selectedBinder: BinderResponse | null,
): string | null => {
  if (binderId == null) return null
  const fromList = binders.find((b) => b.id === binderId)
  if (fromList?.binder_number) return fromList.binder_number
  if (selectedBinder?.id === binderId) return selectedBinder.binder_number
  return `#${binderId}`
}

export const formatStructuredBinderPeriod = (
  year?: number | null,
  monthStart?: number | null,
  monthEnd?: number | null,
): string | null => {
  if (!year) return null
  if (!monthStart || !monthEnd) return String(year)
  if (monthStart === 1 && monthEnd === 12) return String(year)

  const startLabel = MONTH_NAMES[monthStart - 1]
  const endLabel = MONTH_NAMES[monthEnd - 1]
  if (!startLabel || !endLabel) return String(year)
  if (monthStart === monthEnd) return `${startLabel} ${year}`
  return `${startLabel}-${endLabel} ${year}`
}
