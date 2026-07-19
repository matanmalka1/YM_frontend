export const documentsQK = {
  clientList: (clientId: number) => ['documents', 'client', clientId, 'list'] as const,
  clientDetail: (clientId: number, documentId: number) =>
    ['documents', 'client', clientId, 'detail', documentId] as const,
  clientSignals: (clientId: number) => ['documents', 'client', clientId, 'signals'] as const,
  binderRoot: ['documents', 'binder'] as const,
  versions: (clientId: number, docType: string, taxYear?: number) =>
    ['documents', 'client', clientId, 'versions', { docType, taxYear }] as const,
  byAnnualReport: (reportId: number) => ['documents', 'annual-report', reportId] as const,
  byBinder: (binderId: number, params?: { page?: number; page_size?: number }) =>
    ['documents', 'binder', binderId, 'list', params ?? {}] as const,
} as const
