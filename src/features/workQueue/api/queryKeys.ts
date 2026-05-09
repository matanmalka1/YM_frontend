import type { WorkQueueParams } from './contracts'

const normalizeParams = (params?: WorkQueueParams) => ({
  client_record_id: params?.client_record_id ?? null,
  business_id: params?.business_id ?? null,
  exclude_source_types: [...(params?.exclude_source_types ?? [])].sort(),
})

export const workQueueQK = {
  all: ['work-queue'] as const,
  list: (params?: WorkQueueParams) => ['work-queue', 'list', normalizeParams(params)] as const,
}
