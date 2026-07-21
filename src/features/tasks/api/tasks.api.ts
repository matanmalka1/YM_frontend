import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { TASKS_ENDPOINTS } from './endpoints'
import {
  taskSchema,
  taskListResponseSchema,
  taskBulkActionResponseSchema,
  type Task,
  type TaskCreateRequest,
  type TaskUpdateRequest,
  type TaskListParams,
  type TaskListResponse,
  type TaskBulkActionResponse,
} from './contracts'

const toSearchParams = (params?: TaskListParams): URLSearchParams | undefined => {
  if (!params) return undefined
  return toQueryParams(params)
}

export const tasksApi = {
  list: async (params?: TaskListParams): Promise<TaskListResponse> => {
    const response = await api.get<TaskListResponse>(TASKS_ENDPOINTS.list, {
      params: toSearchParams(params),
    })
    return taskListResponseSchema.parse(response.data)
  },

  get: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(TASKS_ENDPOINTS.get(id))
    return taskSchema.parse(response.data)
  },

  create: async (data: TaskCreateRequest): Promise<Task> => {
    const response = await api.post<Task>(TASKS_ENDPOINTS.create, data)
    return taskSchema.parse(response.data)
  },

  update: async (id: number, data: TaskUpdateRequest): Promise<Task> => {
    const response = await api.patch<Task>(TASKS_ENDPOINTS.update(id), data)
    return taskSchema.parse(response.data)
  },

  complete: async (id: number): Promise<Task> => {
    const response = await api.post<Task>(TASKS_ENDPOINTS.complete(id))
    return taskSchema.parse(response.data)
  },

  cancel: async (id: number): Promise<Task> => {
    const response = await api.post<Task>(TASKS_ENDPOINTS.cancel(id))
    return taskSchema.parse(response.data)
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(TASKS_ENDPOINTS.delete(id))
  },

  bulkComplete: async (taskIds: number[], idempotencyKey: string): Promise<TaskBulkActionResponse> => {
    const response = await api.post<TaskBulkActionResponse>(
      TASKS_ENDPOINTS.bulkComplete,
      { task_ids: taskIds },
      { headers: { 'X-Idempotency-Key': idempotencyKey } },
    )
    return taskBulkActionResponseSchema.parse(response.data)
  },

  bulkAssign: async (
    taskIds: number[],
    assigneeUserId: number | null,
    idempotencyKey: string,
  ): Promise<TaskBulkActionResponse> => {
    const response = await api.post<TaskBulkActionResponse>(
      TASKS_ENDPOINTS.bulkAssign,
      { task_ids: taskIds, assignee_user_id: assigneeUserId },
      { headers: { 'X-Idempotency-Key': idempotencyKey } },
    )
    return taskBulkActionResponseSchema.parse(response.data)
  },
}
