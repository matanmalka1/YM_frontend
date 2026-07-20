export const CHARGE_ENDPOINTS = {
  charges: '/charges',
  chargeById: (chargeId: number | string) => `/charges/${chargeId}`,
  chargeIssue: (chargeId: number | string) => `/charges/${chargeId}/issue`,
  chargeMarkPaid: (chargeId: number | string) => `/charges/${chargeId}/mark-paid`,
  chargeCancel: (chargeId: number | string) => `/charges/${chargeId}/cancel`,
  chargesBulkAction: '/charges/bulk-action',
} as const

export const CHARGE_ROUTES = {
  list: '/charges',
  detail: (chargeId: number | string) => `/charges/${chargeId}`,
  clientDetail: (clientId: number | string, chargeId: number | string) => `/clients/${clientId}/charges/${chargeId}`,
} as const
