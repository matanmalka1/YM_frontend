import type { SearchItemsParams } from './contracts'

export const searchQK = {
  clients: (filters: object) => ['search', 'clients', filters] as const,
  items: (params: SearchItemsParams) => ['search', 'items', params] as const,
} as const
