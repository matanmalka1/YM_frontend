import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'

export type TaxCalendarObligationType = 'vat' | 'advance_payment' | 'annual_report'

export interface TaxCalendarGroupsSummary {
  groups: number
  linked: number
  open: number
  overdue: number
  done: number
}

export interface TaxCalendarGroupListResponse {
  items: TaxCalendarGroup[]
  page: number
  page_size: number
  total: number
  summary: TaxCalendarGroupsSummary
}

export interface TaxCalendarGroup {
  tax_calendar_entry_id: number
  obligation_type: TaxCalendarObligationType
  period: string | null
  period_months_count: number | null
  tax_year: number
  regulatory_due_date: string
  effective_due_date_min: string
  effective_due_date_max: string
  linked_count: number
  open_count: number
  done_count: number
  overdue_count: number
}

export interface TaxCalendarGroupsParams {
  tax_year_after?: number
  tax_year_before?: number
  obligation_type?: TaxCalendarObligationType
  status?: 'all' | 'open' | 'overdue' | 'done'
  include_empty?: boolean
  client_record_id?: number
  client_search?: string
  page?: number
  page_size?: number
}

export type TaxCalendarGroupItemSourceType = 'vat_work_item' | 'advance_payment' | 'annual_report'

export interface TaxCalendarGroupItem {
  source_type: TaxCalendarGroupItemSourceType
  source_id: number
  client_record_id: number
  office_client_number: number | null
  client_name: string | null
  period: string | null
  period_months_count: number | null
  tax_year: number | null
  status: string
  regulatory_due_date: string
  effective_due_date: string
  done: boolean
  overdue: boolean
}

export interface TaxCalendarGroupItemResponse {
  tax_calendar_entry_id: number
  obligation_type: TaxCalendarObligationType
  items: TaxCalendarGroupItem[]
  page: number
  page_size: number
  total: number
}

export const TAX_CALENDAR_OBLIGATION_LABELS: Record<TaxCalendarObligationType, string> = {
  vat: 'מע״מ',
  advance_payment: 'מקדמות מס הכנסה',
  annual_report: 'דוח שנתי',
}

export const taxCalendarQK = {
  groups: (params: TaxCalendarGroupsParams) => ['tax-calendar', 'groups', params] as const,
  groupItems: (taxCalendarEntryId: number, params: TaxCalendarGroupItemsParams = {}) =>
    ['tax-calendar', 'groups', taxCalendarEntryId, 'items', params] as const,
}

export const taxCalendarApi = {
  listGroups: async (params: TaxCalendarGroupsParams = {}): Promise<TaxCalendarGroupListResponse> => {
    const response = await api.get<TaxCalendarGroupListResponse>('/tax-calendar/groups', {
      params: toQueryParams(params),
    })
    return response.data
  },

  getGroupItems: async (
    taxCalendarEntryId: number,
    params: TaxCalendarGroupItemsParams = {},
  ): Promise<TaxCalendarGroupItemResponse> => {
    const response = await api.get<TaxCalendarGroupItemResponse>(`/tax-calendar/groups/${taxCalendarEntryId}/items`, {
      params: toQueryParams(params),
    })
    return response.data
  },
}

export interface TaxCalendarGroupItemsParams {
  page?: number
  page_size?: number
  client_search?: string
  client_record_id?: number
}
