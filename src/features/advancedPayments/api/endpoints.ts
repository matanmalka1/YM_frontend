export const ADVANCE_PAYMENT_ENDPOINTS = {
  clientAdvancePayments: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments`,
  clientAdvancePaymentById: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}`,
  clientAdvancePaymentsKPI: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments/kpi`,
  clientAdvancePaymentsGenerate: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments/generate`,
  clientAdvancePaymentRefreshTurnover: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}/refresh-turnover`,
  clientAdvancePaymentsRefreshTurnover: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/refresh-turnover`,
  clientAdvancePaymentsBulkRateUpdate: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/bulk-rate-update`,
  advancePaymentsOverview: '/advance-payments/overview',
  advancePaymentsBatches: '/advance-payments/overview/batches',
  advancePaymentsBulkMarkPaid: '/advance-payments/bulk-mark-paid',
} as const
