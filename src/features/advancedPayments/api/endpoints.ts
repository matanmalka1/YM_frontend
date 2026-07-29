export const ADVANCE_PAYMENT_ENDPOINTS = {
  clientAdvancePayments: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments`,
  clientAdvancePaymentById: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}`,
  clientAdvancePaymentsKPI: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments/kpi`,
  clientAdvancePaymentsGenerate: (clientRecordId: number | string) => `/clients/${clientRecordId}/advance-payments/generate`,
  clientAdvancePaymentReadiness: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}/readiness`,
  clientAdvancePaymentStatus: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}/status`,
  clientAdvancePaymentChain: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}/chain`,
  clientAdvancePaymentRefreshTurnover: (clientRecordId: number | string, id: number | string) =>
    `/clients/${clientRecordId}/advance-payments/${id}/refresh-turnover`,
  clientAdvancePaymentsRefreshTurnover: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/refresh-turnover`,
  clientAdvancePaymentsBulkRateUpdate: (clientRecordId: number | string) =>
    `/clients/${clientRecordId}/advance-payments/bulk-rate-update`,
  advancePaymentsOverview: '/advance-payments/overview',
  advancePaymentsBatches: '/advance-payments/overview/batches',
  advancePaymentsBulkMarkPaid: '/advance-payments/bulk-mark-paid',
  advancePaymentsBulkGenerate: '/advance-payments/bulk-generate',
  advancePaymentsBulkGeneratePreview: '/advance-payments/bulk-generate/preview',
} as const
