import type { AuthorityContactsListParams } from './contracts'

export const authorityContactsQK = {
  forClient: (clientId: number) => ['authority-contacts', 'client', clientId] as const,
  list: (clientId: number, params: AuthorityContactsListParams) =>
    [...authorityContactsQK.forClient(clientId), 'list', params] as const,
  detail: (clientId: number, contactId: number) => [...authorityContactsQK.forClient(clientId), 'detail', contactId] as const,
} as const
