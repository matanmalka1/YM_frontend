export const DOCUMENT_ENDPOINTS = {
  documentsUpload: '/documents/upload',
  documentsByClient: (clientId: number | string) => `/documents/client/${clientId}`,
  documentSignalsByClient: (clientId: number | string) => `/documents/client/${clientId}/signals`,
  documentVersionsByClient: (clientId: number | string) => `/documents/client/${clientId}/versions`,
  documentsByAnnualReport: (reportId: number | string) => `/documents/annual-report/${reportId}`,
  documentDelete: (clientId: number | string, id: number | string) => `/documents/client/${clientId}/${id}`,
  documentReplace: (clientId: number | string, id: number | string) => `/documents/client/${clientId}/${id}/replace`,
  documentDownloadUrl: (id: number | string) => `/documents/${id}/download-url`,
} as const
