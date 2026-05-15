export const signatureRequestsQK = {
  all: ['signature-requests'] as const,
  signer: (token: string | undefined) => ['signer', token] as const,
  businessNamesBatch: (businessIds: number[]) => ['business-names-batch', businessIds] as const,
  forClient: (clientId: number) => ['signature-requests', 'client', clientId] as const,
  forClientPage: (clientId: number, params: object) => ['signature-requests', 'client', clientId, params] as const,
  detail: (id: number) => ['signature-requests', 'detail', id] as const,
  pending: (params: object) => ['signature-requests', 'pending', params] as const,
} as const
