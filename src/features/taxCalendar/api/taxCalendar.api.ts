import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { TAX_CALENDAR_ENDPOINTS } from './endpoints'
import type { TaxCalendarGroupListResponse, TaxCalendarGroupsParams } from './contracts'

export const taxCalendarApi = {
  listGroups: async (params: TaxCalendarGroupsParams = {}): Promise<TaxCalendarGroupListResponse> => {
    const response = await api.get<TaxCalendarGroupListResponse>(TAX_CALENDAR_ENDPOINTS.groups, {
      params: toQueryParams(params),
    })
    return response.data
  },
}
