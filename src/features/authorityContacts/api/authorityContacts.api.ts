import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { AUTHORITY_CONTACT_ENDPOINTS } from './endpoints'
import type {
  AuthorityContactResponse,
  AuthorityContactCreatePayload,
  AuthorityContactUpdatePayload,
  AuthorityContactsListParams,
} from './contracts'

export const authorityContactsApi = {
  createAuthorityContact: async (
    clientId: number,
    payload: AuthorityContactCreatePayload,
  ): Promise<AuthorityContactResponse> => {
    const response = await api.post<AuthorityContactResponse>(
      AUTHORITY_CONTACT_ENDPOINTS.clientAuthorityContacts(clientId),
      payload,
    )
    return response.data
  },

  listAuthorityContacts: async (
    clientId: number,
    params: AuthorityContactsListParams,
  ): Promise<{
    items: AuthorityContactResponse[]
    page: number
    page_size: number
    total: number
  }> => {
    const response = await api.get<{
      items: AuthorityContactResponse[]
      page: number
      page_size: number
      total: number
    }>(AUTHORITY_CONTACT_ENDPOINTS.clientAuthorityContacts(clientId), {
      params: toQueryParams({
        contact_type: params.contact_type,
        page: params.page,
        page_size: params.page_size,
      }),
    })
    return response.data
  },

  getAuthorityContact: async (clientId: number, contactId: number): Promise<AuthorityContactResponse> => {
    const response = await api.get<AuthorityContactResponse>(
      AUTHORITY_CONTACT_ENDPOINTS.authorityContactById(clientId, contactId),
    )
    return response.data
  },

  updateAuthorityContact: async (
    clientId: number,
    contactId: number,
    payload: AuthorityContactUpdatePayload,
  ): Promise<AuthorityContactResponse> => {
    const response = await api.patch<AuthorityContactResponse>(
      AUTHORITY_CONTACT_ENDPOINTS.authorityContactById(clientId, contactId),
      payload,
    )
    return response.data
  },

  deleteAuthorityContact: async (clientId: number, contactId: number): Promise<void> => {
    await api.delete(AUTHORITY_CONTACT_ENDPOINTS.authorityContactById(clientId, contactId))
  },
}
