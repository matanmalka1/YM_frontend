import type { TaskListParams } from './contracts'

const normalizeParams = (params?: TaskListParams) => ({
  client_record_id: params?.client_record_id ?? null,
  status: params?.status ?? null,
  priority: params?.priority ?? null,
  assigned_to_user_id: params?.assigned_to_user_id ?? null,
  assigned_role: params?.assigned_role ?? null,
  source_domain: params?.source_domain ?? null,
  source_id: params?.source_id ?? null,
  due_before: params?.due_before ?? null,
  due_after: params?.due_after ?? null,
  page: params?.page ?? 1,
  page_size: params?.page_size ?? 20,
})

export const tasksQK = {
  all: ['tasks'] as const,
  lists: ['tasks', 'list'] as const,
  list: (params?: TaskListParams) => ['tasks', 'list', normalizeParams(params)] as const,
  detail: (id: number) => ['tasks', 'detail', id] as const,
}
