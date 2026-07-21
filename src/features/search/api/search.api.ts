import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { SEARCH_ENDPOINTS } from './endpoints'
import type { SearchMatchesParams, SearchMatchesResponse, SearchParams, SearchResponse } from './contracts'

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(SEARCH_ENDPOINTS.search, {
      params: toQueryParams(params),
    })
    return response.data
  },
  listMatches: async (params: SearchMatchesParams): Promise<SearchMatchesResponse> => {
    const response = await api.get<SearchMatchesResponse>(SEARCH_ENDPOINTS.items, {
      params: toQueryParams(params),
    })
    return response.data
  },
}
