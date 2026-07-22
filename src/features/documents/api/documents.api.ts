import { api } from '@/api/client'
import { DOCUMENT_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  PermanentDocumentListResponse,
  DocumentVersionsResponse,
  OperationalSignalsResponse,
  ListDocumentsByClientParams,
  ListDocumentsByBinderParams,
  PermanentDocumentResponse,
  UploadDocumentPayload,
  UpdateDocumentPayload,
} from './contracts'

export const documentsApi = {
  // ── Queries ──────────────────────────────────────────────────────────────

  listByClient: async (clientId: number, params?: ListDocumentsByClientParams): Promise<PermanentDocumentListResponse> => {
    const response = await api.get<PermanentDocumentListResponse>(
      DOCUMENT_ENDPOINTS.documentsByClient(clientId),
      params ? { params: toQueryParams(params) } : undefined,
    )
    return response.data
  },

  getDownloadUrl: async (clientId: number, id: number): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>(DOCUMENT_ENDPOINTS.documentDownloadUrl(clientId, id))
    return response.data
  },

  getById: async (clientId: number, documentId: number): Promise<PermanentDocumentResponse> => {
    const response = await api.get<PermanentDocumentResponse>(DOCUMENT_ENDPOINTS.documentDetail(clientId, documentId))
    return response.data
  },

  getSignalsByClient: async (clientId: number): Promise<OperationalSignalsResponse> => {
    const response = await api.get<OperationalSignalsResponse>(DOCUMENT_ENDPOINTS.documentSignalsByClient(clientId))
    return response.data
  },

  getVersions: async (clientId: number, documentType: string, taxYear?: number): Promise<DocumentVersionsResponse> => {
    const response = await api.get<DocumentVersionsResponse>(DOCUMENT_ENDPOINTS.documentVersionsByClient(clientId), {
      params: toQueryParams({
        document_type: documentType,
        ...(taxYear != null ? { tax_year: taxYear } : {}),
      }),
    })
    return response.data
  },

  listByBinder: async (binderId: number, params?: ListDocumentsByBinderParams): Promise<PermanentDocumentListResponse> => {
    const response = await api.get<PermanentDocumentListResponse>(
      DOCUMENT_ENDPOINTS.documentsByBinder(binderId),
      params ? { params: toQueryParams(params) } : undefined,
    )
    return response.data
  },

  // ── Mutations ────────────────────────────────────────────────────────────

  upload: async (payload: UploadDocumentPayload): Promise<PermanentDocumentResponse> => {
    const formData = new FormData()
    formData.append('client_record_id', String(payload.client_record_id))
    if (payload.business_id != null) {
      formData.append('business_id', String(payload.business_id))
    }
    formData.append('document_type', payload.document_type)
    formData.append('file', payload.file)
    if (payload.tax_year != null) {
      formData.append('tax_year', String(payload.tax_year))
    }
    if (payload.annual_report_id != null) {
      formData.append('annual_report_id', String(payload.annual_report_id))
    }
    const response = await api.post<PermanentDocumentResponse>(DOCUMENT_ENDPOINTS.documentsUpload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteDocument: async (clientId: number, id: number): Promise<void> => {
    await api.delete(DOCUMENT_ENDPOINTS.documentDelete(clientId, id))
  },

  updateDocument: async (clientId: number, id: number, payload: UpdateDocumentPayload): Promise<PermanentDocumentResponse> => {
    const response = await api.patch<PermanentDocumentResponse>(DOCUMENT_ENDPOINTS.documentDetail(clientId, id), payload)
    return response.data
  },

  replaceDocument: async (clientId: number, id: number, file: File): Promise<PermanentDocumentResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.put<PermanentDocumentResponse>(DOCUMENT_ENDPOINTS.documentReplace(clientId, id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}
