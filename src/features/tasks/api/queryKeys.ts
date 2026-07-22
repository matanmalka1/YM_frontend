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
  search: params?.search ?? null,
  sort_by: params?.sort_by ?? 'created_at',
  order: params?.order ?? 'desc',
  page: params?.page ?? 1,
  page_size: params?.page_size ?? 20,
})

export const tasksQK = {
  all: ['tasks'] as const,
  list: (params?: TaskListParams) => ['tasks', 'list', normalizeParams(params)] as const,
  detail: (id: number) => ['tasks', 'detail', id] as const,
  linkableSources: (clientRecordId: number) => ['tasks', 'linkable-sources', clientRecordId] as const,
}
