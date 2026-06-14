import { createQueryKeys } from '@/lib/queryKeys'

export const usersQK = {
  ...createQueryKeys('users'),
  auditLogs: (params: object) => ['users', 'audit-logs', params] as const,
  activeOptions: () => ['users', 'active-options'] as const,
}
