import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { WORK_QUEUE_ENDPOINTS } from './endpoints'
import { workQueueListResponseSchema, type WorkQueueListResponse, type WorkQueueParams } from './contracts'

const toSearchParams = (params?: WorkQueueParams): URLSearchParams | undefined => {
  if (!params) return undefined

  return toQueryParams({
    ...params,
    search: params.search?.trim() || undefined,
  })
}

export const workQueueApi = {
  list: async (params?: WorkQueueParams): Promise<WorkQueueListResponse> => {
    const response = await api.get<WorkQueueListResponse>(WORK_QUEUE_ENDPOINTS.list, {
      params: toSearchParams(params),
    })
    return workQueueListResponseSchema.parse(response.data)
  },
}
