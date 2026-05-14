import { api } from '@/api/client'
import { WORK_QUEUE_ENDPOINTS } from './endpoints'
import { workQueueListResponseSchema, workQueueSummarySchema, type WorkQueueListResponse, type WorkQueueParams, type WorkQueueSummary } from './contracts'

const toSearchParams = (params?: WorkQueueParams): URLSearchParams | undefined => {
  if (!params) return undefined

  const search = new URLSearchParams()
  if (params.client_record_id != null) search.set('client_record_id', String(params.client_record_id))
  if (params.business_id != null) search.set('business_id', String(params.business_id))
  if (params.include_task_history) search.set('include_task_history', 'true')
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.source_type) search.set('source_type', params.source_type)
  if (params.urgency) search.set('urgency', params.urgency)
  if (params.task_status) search.set('task_status', params.task_status)
  if (params.linked) search.set('linked', params.linked)
  if (params.scope) search.set('scope', params.scope)
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.offset != null) search.set('offset', String(params.offset))
  params.exclude_source_types?.forEach((type) => search.append('exclude_source_types', type))
  return search
}

export const workQueueApi = {
  list: async (params?: WorkQueueParams): Promise<WorkQueueListResponse> => {
    const response = await api.get<WorkQueueListResponse>(WORK_QUEUE_ENDPOINTS.list, {
      params: toSearchParams(params),
    })
    return workQueueListResponseSchema.parse(response.data)
  },
  getSummary: async (params?: WorkQueueParams): Promise<WorkQueueSummary> => {
    const response = await api.get<WorkQueueSummary>(WORK_QUEUE_ENDPOINTS.summary, {
      params: toSearchParams(params),
    })
    return workQueueSummarySchema.parse(response.data)
  },
}
