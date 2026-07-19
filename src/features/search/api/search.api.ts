import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { SEARCH_ENDPOINTS } from './endpoints'
import type { SearchItemsParams, SearchItemsResponse, SearchParams, SearchResponse } from './contracts'

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(SEARCH_ENDPOINTS.search, {
      params: toQueryParams(params),
    })
    return response.data
  },
  listItems: async (params: SearchItemsParams): Promise<SearchItemsResponse> => {
    const response = await api.get<SearchItemsResponse>(SEARCH_ENDPOINTS.items, {
      params: toQueryParams(params),
    })
    return response.data
  },
}
