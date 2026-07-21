export const AUTHORITY_CONTACT_ENDPOINTS = {
  clientAuthorityContacts: (clientId: number | string) => `/clients/${clientId}/authority-contacts`,
  authorityContactById: (clientId: number | string, id: number | string) => `/clients/${clientId}/authority-contacts/${id}`,
} as const
