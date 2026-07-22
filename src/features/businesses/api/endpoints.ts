export const BUSINESS_ENDPOINTS = {
  clientBusinesses: (clientId: number | string) => `/clients/${clientId}/businesses`,
  businessById: (clientId: number | string, businessId: number | string) => `/clients/${clientId}/businesses/${businessId}`,
} as const
