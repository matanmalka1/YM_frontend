export const SIGNATURE_REQUEST_ENDPOINTS = {
  signatureRequests: '/signature-requests',
  signatureRequestsPending: '/signature-requests/pending',
  signatureRequestById: (id: number | string) => `/signature-requests/${id}`,
  clientSignatureRequestCancel: (clientId: number | string, id: number | string) =>
    `/clients/${clientId}/signature-requests/${id}/cancel`,
  clientSignatureRequests: (clientId: number | string) => `/clients/${clientId}/signature-requests`,
  signerView: (token: string) => `/sign/${token}`,
  signerApprove: (token: string) => `/sign/${token}/approve`,
  signerDecline: (token: string) => `/sign/${token}/decline`,
} as const
