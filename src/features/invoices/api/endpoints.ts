export const INVOICE_ENDPOINTS = {
  invoices: '/invoices',
  invoiceByChargeId: (chargeId: number | string) => `/invoices/charge/${chargeId}`,
} as const
