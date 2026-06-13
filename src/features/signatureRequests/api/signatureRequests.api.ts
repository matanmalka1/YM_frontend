// axios is imported directly here to construct publicApi — an unauthenticated
// client that hits the root base URL (not /api/v1) for public signing routes.
// The shared `api` client from @/api/client cannot be reused for these routes
// because it carries auth cookies and the wrong base URL.
import axios from 'axios'
import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { SIGNATURE_REQUEST_ENDPOINTS } from './endpoints'
import type {
  SignatureRequestListResponse,
  SignatureRequestWithAudit,
  CreateSignatureRequestPayload,
  CreateSignatureRequestResponse,
  SignatureRequestResponse,
  CancelSignatureRequestPayload,
  SignerViewResponse,
  SignerDeclinePayload,
  ListPendingSignatureRequestsParams,
} from './contracts'

export const signatureRequestsApi = {
  // ── Queries ──────────────────────────────────────────────────────────────

  listForClient: async (
    clientId: number,
    params?: { page?: number; page_size?: number; status?: string },
  ): Promise<SignatureRequestListResponse> => {
    const response = await api.get<SignatureRequestListResponse>(
      SIGNATURE_REQUEST_ENDPOINTS.clientSignatureRequests(clientId),
      { params },
    )
    return response.data
  },

  listPending: async (params: ListPendingSignatureRequestsParams = {}): Promise<SignatureRequestListResponse> => {
    const response = await api.get<SignatureRequestListResponse>(SIGNATURE_REQUEST_ENDPOINTS.signatureRequestsPending, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getById: async (id: number): Promise<SignatureRequestWithAudit> => {
    const response = await api.get<SignatureRequestWithAudit>(SIGNATURE_REQUEST_ENDPOINTS.signatureRequestById(id))
    return response.data
  },

  // ── Mutations ────────────────────────────────────────────────────────────

  create: async (payload: CreateSignatureRequestPayload): Promise<CreateSignatureRequestResponse> => {
    const response = await api.post<CreateSignatureRequestResponse>(
      SIGNATURE_REQUEST_ENDPOINTS.signatureRequests,
      payload,
    )
    return response.data
  },

  cancel: async (
    clientRecordId: number,
    id: number,
    payload?: CancelSignatureRequestPayload,
  ): Promise<SignatureRequestResponse> => {
    const response = await api.post<SignatureRequestResponse>(
      SIGNATURE_REQUEST_ENDPOINTS.clientSignatureRequestCancel(clientRecordId, id),
      payload ?? {},
    )
    return response.data
  },
}

// Public signer API (no auth — bypasses /api/v1 prefix)
const publicApi = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
    : 'http://localhost:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const signerApi = {
  view: async (token: string): Promise<SignerViewResponse> => {
    const response = await publicApi.get<SignerViewResponse>(SIGNATURE_REQUEST_ENDPOINTS.signerView(token))
    return response.data
  },

  approve: async (token: string): Promise<SignerViewResponse> => {
    const response = await publicApi.post<SignerViewResponse>(SIGNATURE_REQUEST_ENDPOINTS.signerApprove(token))
    return response.data
  },

  decline: async (token: string, payload?: SignerDeclinePayload): Promise<SignerViewResponse> => {
    const response = await publicApi.post<SignerViewResponse>(
      SIGNATURE_REQUEST_ENDPOINTS.signerDecline(token),
      payload ?? {},
    )
    return response.data
  },
}
