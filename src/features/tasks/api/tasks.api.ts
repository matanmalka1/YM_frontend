import { api } from '@/api/client'
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
  type ClientTaskListParams,
} from './contracts'

const toSearchParams = (params?: TaskListParams): URLSearchParams | undefined => {
  if (!params) return undefined
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.priority) search.set('priority', params.priority)
  if (params.assigned_to_user_id != null) search.set('assigned_to_user_id', String(params.assigned_to_user_id))
  if (params.assigned_role) search.set('assigned_role', params.assigned_role)
  if (params.source_domain) search.set('source_domain', params.source_domain)
  if (params.source_id != null) search.set('source_id', String(params.source_id))
  if (params.due_before) search.set('due_before', params.due_before)
  if (params.due_after) search.set('due_after', params.due_after)
  if (params.page != null) search.set('page', String(params.page))
  if (params.page_size != null) search.set('page_size', String(params.page_size))
  return search
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

  listClientTasks: async (clientRecordId: number, params?: ClientTaskListParams): Promise<TaskListResponse> => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.assigned_to_user_id != null) search.set('assigned_to_user_id', String(params.assigned_to_user_id))
    if (params?.source_domain) search.set('source_domain', params.source_domain)
    if (params?.due_before) search.set('due_before', params.due_before)
    if (params?.due_after) search.set('due_after', params.due_after)
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.page_size != null) search.set('page_size', String(params.page_size))
    const response = await api.get<TaskListResponse>(TASKS_ENDPOINTS.clientTasks(clientRecordId), {
      params: search,
    })
    return taskListResponseSchema.parse(response.data)
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
