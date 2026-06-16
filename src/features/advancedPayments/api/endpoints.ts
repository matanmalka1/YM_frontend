export const ADVANCE_PAYMENT_ENDPOINTS = {
  clientAdvancePayments: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments`,
  clientAdvancePaymentById: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}`,
  clientAdvancePaymentsKPI: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments/kpi`,
  clientAdvancePaymentsGenerate: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/generate`,
  clientAdvancePaymentPrefillTurnover: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/prefill-turnover`,
  advancePaymentsOverview: '/advance-payments/overview',
  advancePaymentsBatches: '/advance-payments/overview/batches',
} as const
