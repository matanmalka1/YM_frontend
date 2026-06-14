import type { TaxCalendarObligationType } from './api'
import {
  TAX_CALENDAR_GROUP_STATUSES,
  TAX_CALENDAR_OBLIGATION_TYPES,
  type TaxCalendarGroupStatusFilter,
} from './constants'

export const parseTaxCalendarGroupStatusFilter = (value: string | null): TaxCalendarGroupStatusFilter =>
  TAX_CALENDAR_GROUP_STATUSES.find((status) => status === value) ?? 'all'

export const parseTaxCalendarObligationType = (value: string | null): TaxCalendarObligationType | undefined =>
  TAX_CALENDAR_OBLIGATION_TYPES.find((obligationType) => obligationType === value)
