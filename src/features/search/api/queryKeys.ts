import type { SearchMatchesParams, SearchParams } from './contracts'

export const searchQK = {
  clients: (params: SearchParams) => ['search', 'clients', params] as const,
  matches: (params: SearchMatchesParams) => ['search', 'matches', params] as const,
} as const
