export const ADVANCE_PAYMENT_ENDPOINTS = {
  clientAdvancePayments: (clientId: number | string) => `/clients/${clientId}/advance-payments`,
  clientAdvancePaymentById: (clientId: number | string, id: number | string) =>
    `/clients/${clientId}/advance-payments/${id}`,
  clientAdvancePaymentSuggest: (clientId: number | string) => `/clients/${clientId}/advance-payments/suggest`,
  clientAdvancePaymentsKPI: (clientId: number | string) => `/clients/${clientId}/advance-payments/kpi`,
  clientAdvancePaymentsGenerate: (clientId: number | string) => `/clients/${clientId}/advance-payments/generate`,
  clientAdvancePaymentPrefillTurnover: (clientId: number | string) =>
    `/clients/${clientId}/advance-payments/prefill-turnover`,
  advancePaymentsOverview: '/advance-payments/overview',
  advancePaymentsBatches: '/advance-payments/overview/batches',
} as const
