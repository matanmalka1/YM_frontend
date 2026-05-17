import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'

export type TaxCalendarObligationType = 'vat' | 'advance_payment' | 'annual_report'

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
  start_year?: number
  end_year?: number
  obligation_type?: TaxCalendarObligationType
  include_empty?: boolean
  client_record_id?: number
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
}

export const TAX_CALENDAR_OBLIGATION_LABELS: Record<TaxCalendarObligationType, string> = {
  vat: 'מע״מ',
  advance_payment: 'מקדמות מס הכנסה',
  annual_report: 'דוח שנתי',
}

export const taxCalendarQK = {
  groups: (params: TaxCalendarGroupsParams) => ['tax-calendar', 'groups', params] as const,
  groupItems: (taxCalendarEntryId: number) => ['tax-calendar', 'groups', taxCalendarEntryId, 'items'] as const,
}

export const taxCalendarApi = {
  listGroups: async (params: TaxCalendarGroupsParams = {}): Promise<TaxCalendarGroup[]> => {
    const response = await api.get<TaxCalendarGroup[]>('/tax-calendar/groups', {
      params: toQueryParams(params),
    })
    return response.data
  },

  getGroupItems: async (taxCalendarEntryId: number): Promise<TaxCalendarGroupItemResponse> => {
    const response = await api.get<TaxCalendarGroupItemResponse>(`/tax-calendar/groups/${taxCalendarEntryId}/items`)
    return response.data
  },
}
