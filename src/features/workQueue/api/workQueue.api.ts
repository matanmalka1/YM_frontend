import { api } from '@/api/client'
import { WORK_QUEUE_ENDPOINTS } from './endpoints'
import { workQueueItemSchema, type WorkQueueItem, type WorkQueueParams } from './contracts'

const toSearchParams = (params?: WorkQueueParams): URLSearchParams | undefined => {
  if (!params) return undefined

  const search = new URLSearchParams()
  if (params.client_record_id != null) search.set('client_record_id', String(params.client_record_id))
  if (params.business_id != null) search.set('business_id', String(params.business_id))
  if (params.include_task_history) search.set('include_task_history', 'true')
  params.exclude_source_types?.forEach((type) => search.append('exclude_source_types', type))
  return search
}

export const workQueueApi = {
  list: async (params?: WorkQueueParams): Promise<WorkQueueItem[]> => {
    const response = await api.get<WorkQueueItem[]>(WORK_QUEUE_ENDPOINTS.list, {
      params: toSearchParams(params),
    })
    return workQueueItemSchema.array().parse(response.data)
  },
}
