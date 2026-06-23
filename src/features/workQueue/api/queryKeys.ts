import type { WorkQueueParams } from './contracts'

const normalizeParams = (params?: WorkQueueParams) => ({
  client_record_id: params?.client_record_id ?? null,
  business_id: params?.business_id ?? null,
  search: params?.search ?? '',
  source_type: params?.source_type ?? null,
  urgency: params?.urgency ?? null,
  task_status: params?.task_status ?? null,
  linked: params?.linked ?? null,
  scope: params?.scope ?? null,
  page: params?.page ?? null,
  page_size: params?.page_size ?? null,
  exclude_source_types: (params?.exclude_source_types ?? []).toSorted(),
})

export const workQueueQK = {
  all: ['work-queue'] as const,
  lists: ['work-queue', 'list'] as const,
  list: (params?: WorkQueueParams) => ['work-queue', 'list', normalizeParams(params)] as const,
}
