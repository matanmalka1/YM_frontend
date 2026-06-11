import { createQueryKeys } from '@/lib/queryKeys'

export const bindersQK = {
  ...createQueryKeys('binders'),
  detailFallback: () => ['binders', 'detail', 'none'] as const,
  open: (page: number, pageSize: number) => ['binders', 'open', { page, page_size: pageSize }] as const,
  forClient: (clientId: number) => ['binders', 'client', clientId] as const,
  forClientPage: (clientId: number, page: number, pageSize: number) =>
    ['binders', 'client', clientId, { page, page_size: pageSize }] as const,
  audit: (binderId: number) => ['binders', 'audit', binderId] as const,
  intakes: (binderId: number) => ['binders', 'intakes', binderId] as const,
}
