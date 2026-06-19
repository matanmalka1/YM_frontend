import { PAGE_SIZE_25 } from '@/constants/pagination.constants'
import type { TaxCalendarGroupsParams, TaxCalendarObligationType } from './api'
import {
  TAX_CALENDAR_GROUP_STATUSES,
  TAX_CALENDAR_OBLIGATION_TYPES,
  type TaxCalendarGroupStatusFilter,
} from './constants'

export const parseTaxCalendarGroupStatusFilter = (value: string | null): TaxCalendarGroupStatusFilter =>
  TAX_CALENDAR_GROUP_STATUSES.find((status) => status === value) ?? 'all'

export const parseTaxCalendarObligationType = (value: string | null): TaxCalendarObligationType | undefined =>
  TAX_CALENDAR_OBLIGATION_TYPES.find((obligationType) => obligationType === value)

export const TAX_CALENDAR_GROUP_PAGE_SIZE = PAGE_SIZE_25

export const taxCalendarCurrentYear = () => new Date().getFullYear()

export interface TaxCalendarCommonFilters {
  startYear: string
  endYear: string
  obligationType: TaxCalendarObligationType | undefined
  status: TaxCalendarGroupStatusFilter
  page: number
}

/** Reads the shared URL filters (years/obligation/status/page) used by both tax-calendar views. */
export const readTaxCalendarCommonFilters = (
  searchParams: URLSearchParams,
  getParam: (key: string) => string,
  getPage: () => number,
): TaxCalendarCommonFilters => {
  const year = String(taxCalendarCurrentYear())
  return {
    startYear: getParam('tax_year_after') || year,
    endYear: getParam('tax_year_before') || year,
    obligationType: parseTaxCalendarObligationType(searchParams.get('obligation_type')),
    status: parseTaxCalendarGroupStatusFilter(searchParams.get('status')),
    page: getPage(),
  }
}

type TaxCalendarCommonParams = Pick<
  TaxCalendarGroupsParams,
  'tax_year_after' | 'tax_year_before' | 'obligation_type' | 'status' | 'page' | 'page_size'
>

/** Maps the common filters into the shared TaxCalendarGroupsParams fields. */
export const toTaxCalendarCommonParams = (filters: TaxCalendarCommonFilters): TaxCalendarCommonParams => {
  const year = taxCalendarCurrentYear()
  return {
    tax_year_after: Number(filters.startYear) || year,
    tax_year_before: Number(filters.endYear) || year,
    obligation_type: filters.obligationType,
    status: filters.status,
    page: filters.page,
    page_size: TAX_CALENDAR_GROUP_PAGE_SIZE,
  }
}

/** Default values applied when resetting tax-calendar filters. */
export const taxCalendarYearResetDefaults = (): Record<string, string> => {
  const year = String(taxCalendarCurrentYear())
  return { tax_year_after: year, tax_year_before: year }
}
