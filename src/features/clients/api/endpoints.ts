export const CLIENT_ENDPOINTS = {
  clients: '/clients',
  clientsSidebar: '/clients/sidebar',
  clientById: (clientId: number | string) => `/clients/${clientId}`,
  clientRestore: (clientId: number | string) => `/clients/${clientId}/restore`,
  clientStatusCard: (clientId: number | string) => `/clients/${clientId}/status-card`,
  clientConflictByIdNumber: (idNumber: string) => `/clients/conflict/${encodeURIComponent(idNumber)}`,
  clientsExport: '/clients/export',
  clientsTemplate: '/clients/template',
  clientsImport: '/clients/import',
  clientsPreviewImpact: '/clients/preview-impact',
} as const

export const CLIENT_ROUTES = {
  list: '/clients',
  detail: (clientId: number | string) => `/clients/${clientId}`,
  tab: (clientId: number | string, tab: string) =>
    tab === 'details' ? `/clients/${clientId}` : `/clients/${clientId}/${tab}`,
  timeline: (clientId: number | string) => `/clients/${clientId}/timeline`,
  charges: (clientId: number | string) => `/clients/${clientId}/charges`,
  chargeDetail: (clientId: number | string, chargeId: number | string) => `/clients/${clientId}/charges/${chargeId}`,
  vat: (clientId: number | string) => `/clients/${clientId}/vat`,
  vatDetail: (clientId: number | string, workItemId: number | string) => `/clients/${clientId}/vat/${workItemId}`,
  taxCalendar: (clientId: number | string) => `/clients/${clientId}/tax-calendar`,
  advancePayments: (clientId: number | string) => `/clients/${clientId}/advance-payments`,
  advancePaymentDetail: (clientId: number | string, paymentId: number | string) =>
    `/clients/${clientId}/advance-payments/${paymentId}`,
  annualReports: (clientId: number | string) => `/clients/${clientId}/annual-reports`,
  annualReportDetail: (clientId: number | string, reportId: number | string) =>
    `/clients/${clientId}/annual-reports/${reportId}`,
  documents: (clientId: number | string) => `/clients/${clientId}/documents`,
  tasks: (clientId: number | string) => `/clients/${clientId}/tasks`,
  communication: (clientId: number | string) => `/clients/${clientId}/communication`,
  businessDetail: (clientId: number | string, businessId: number | string) =>
    `/clients/${clientId}/businesses/${businessId}`,
} as const
