import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { TAX_CALENDAR_ENDPOINTS } from './endpoints'
import type {
  TaxCalendarGroupItemResponse,
  TaxCalendarGroupItemsParams,
  TaxCalendarGroupListResponse,
  TaxCalendarGroupsParams,
} from './contracts'

export const taxCalendarApi = {
  listGroups: async (params: TaxCalendarGroupsParams = {}): Promise<TaxCalendarGroupListResponse> => {
    const response = await api.get<TaxCalendarGroupListResponse>(TAX_CALENDAR_ENDPOINTS.groups, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getGroupItems: async (
    taxCalendarEntryId: number,
    params: TaxCalendarGroupItemsParams = {},
  ): Promise<TaxCalendarGroupItemResponse> => {
    const response = await api.get<TaxCalendarGroupItemResponse>(TAX_CALENDAR_ENDPOINTS.groupItems(taxCalendarEntryId), {
      params: toQueryParams(params),
    })
    return response.data
  },
}
