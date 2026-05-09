import { api } from '@/api/client'
import { TASK_ENDPOINTS } from './endpoints'
import {
  deadlineTaskSchema,
  unifiedItemSchema,
  type DeadlineTask,
  type TasksParams,
  type UnifiedItem,
} from './contracts'

const toSearchParams = (params?: TasksParams): URLSearchParams | undefined => {
  if (!params) return undefined

  const search = new URLSearchParams()
  if (params.client_record_id != null) search.set('client_record_id', String(params.client_record_id))
  if (params.business_id != null) search.set('business_id', String(params.business_id))
  if (params.include_reminders != null) search.set('include_reminders', String(params.include_reminders))
  params.exclude_source_types?.forEach((type) => search.append('exclude_source_types', type))
  return search
}

export const tasksApi = {
  list: async (params?: TasksParams): Promise<DeadlineTask[]> => {
    const response = await api.get<DeadlineTask[]>(TASK_ENDPOINTS.tasks, {
      params: toSearchParams(params),
    })
    return deadlineTaskSchema.array().parse(response.data)
  },

  unified: async (params?: TasksParams): Promise<UnifiedItem[]> => {
    const response = await api.get<UnifiedItem[]>(TASK_ENDPOINTS.unified, {
      params: toSearchParams(params),
    })
    return unifiedItemSchema.array().parse(response.data)
  },
}
