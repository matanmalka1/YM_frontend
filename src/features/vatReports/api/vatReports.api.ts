import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { downloadBlob } from '@/utils/download'
import { VAT_ENDPOINTS } from './endpoints'
import type {
  VatWorkItemResponse,
  VatWorkItemListResponse,
  VatWorkItemsListParams,
  VatWorkItemLookupResponse,
  VatWorkItemGroupsResponse,
  VatWorkItemGroupsParams,
  VatWorkItemGroupItemsResponse,
  VatWorkItemGroupItemsParams,
  VatWorkItemStatusSummaryParams,
  VatWorkItemStatusSummaryResponse,
  CreateVatWorkItemPayload,
  VatPeriodOptionsResponse,
  VatInvoiceResponse,
  VatInvoiceListResponse,
  CreateVatInvoicePayload,
  UpdateVatInvoicePayload,
  VatAuditTrailResponse,
  VatClientSummaryResponse,
  FileVatReturnPayload,
} from './contracts'

export const vatReportsApi = {
  list: async (params: VatWorkItemsListParams): Promise<VatWorkItemListResponse> => {
    const response = await api.get<VatWorkItemListResponse>(VAT_ENDPOINTS.vatWorkItems, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getStatusSummary: async (params: VatWorkItemStatusSummaryParams): Promise<VatWorkItemStatusSummaryResponse> => {
    const response = await api.get<VatWorkItemStatusSummaryResponse>(VAT_ENDPOINTS.vatWorkItemStatusSummary, {
      params: toQueryParams(params),
    })
    return response.data
  },

  lookup: async (clientId: number, period: string): Promise<VatWorkItemLookupResponse | null> => {
    const response = await api.get<VatWorkItemLookupResponse | null>(VAT_ENDPOINTS.vatWorkItemLookup, {
      params: toQueryParams({ client_record_id: clientId, period }),
    })
    return response.data
  },

  getById: async (id: number): Promise<VatWorkItemResponse> => {
    const response = await api.get<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItemById(id))
    return response.data
  },

  create: async (payload: CreateVatWorkItemPayload): Promise<VatWorkItemResponse> => {
    const response = await api.post<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItems, payload)
    return response.data
  },

  getPeriodOptions: async (clientId: number, year?: number): Promise<VatPeriodOptionsResponse> => {
    const response = await api.get<VatPeriodOptionsResponse>(VAT_ENDPOINTS.vatPeriodOptions(clientId), {
      params: toQueryParams({ year }),
    })
    return response.data
  },

  markMaterialsComplete: async (id: number): Promise<VatWorkItemResponse> => {
    const response = await api.post<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItemMaterialsComplete(id))
    return response.data
  },

  markReadyForReview: async (id: number): Promise<VatWorkItemResponse> => {
    const response = await api.post<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItemReadyForReview(id))
    return response.data
  },

  sendBack: async (id: number, correctionNote: string): Promise<VatWorkItemResponse> => {
    const response = await api.post<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItemSendBack(id), {
      correction_note: correctionNote,
    })
    return response.data
  },

  fileVatReturn: async (id: number, payload: FileVatReturnPayload): Promise<VatWorkItemResponse> => {
    const response = await api.post<VatWorkItemResponse>(VAT_ENDPOINTS.vatWorkItemFile(id), payload)
    return response.data
  },

  listInvoices: async (id: number): Promise<VatInvoiceListResponse> => {
    const response = await api.get<VatInvoiceListResponse>(VAT_ENDPOINTS.vatWorkItemInvoices(id))
    return response.data
  },

  addInvoice: async (id: number, payload: CreateVatInvoicePayload): Promise<VatInvoiceResponse> => {
    const response = await api.post<VatInvoiceResponse>(VAT_ENDPOINTS.vatWorkItemInvoices(id), payload)
    return response.data
  },

  updateInvoice: async (
    id: number,
    invoiceId: number,
    payload: UpdateVatInvoicePayload,
  ): Promise<VatInvoiceResponse> => {
    const response = await api.patch<VatInvoiceResponse>(VAT_ENDPOINTS.vatWorkItemInvoiceById(id, invoiceId), payload)
    return response.data
  },

  deleteInvoice: async (id: number, invoiceId: number): Promise<void> => {
    await api.delete(VAT_ENDPOINTS.vatWorkItemInvoiceById(id, invoiceId))
  },

  getAuditTrail: async (
    id: number,
    params: { limit?: number; offset?: number } = {},
  ): Promise<VatAuditTrailResponse> => {
    const response = await api.get<VatAuditTrailResponse>(VAT_ENDPOINTS.vatWorkItemAudit(id), {
      params: toQueryParams(params),
    })
    return response.data
  },

  listByClient: async (clientId: number): Promise<VatWorkItemListResponse> => {
    const response = await api.get<VatWorkItemListResponse>(VAT_ENDPOINTS.vatWorkItemsByClient(clientId))
    return response.data
  },

  getClientSummary: async (
    clientId: number,
    params?: { from_year?: number; to_year?: number },
  ): Promise<VatClientSummaryResponse> => {
    const response = await api.get<VatClientSummaryResponse>(VAT_ENDPOINTS.vatClientSummary(clientId), {
      params: params ? toQueryParams(params) : undefined,
    })
    return response.data
  },

  listGroups: async (params: VatWorkItemGroupsParams = {}): Promise<VatWorkItemGroupsResponse> => {
    const response = await api.get<VatWorkItemGroupsResponse>(VAT_ENDPOINTS.vatWorkItemGroups, {
      params: toQueryParams(params),
    })
    return response.data
  },

  listGroupItems: async (
    groupKey: string,
    params: VatWorkItemGroupItemsParams = {},
  ): Promise<VatWorkItemGroupItemsResponse> => {
    const response = await api.get<VatWorkItemGroupItemsResponse>(VAT_ENDPOINTS.vatWorkItemGroupItems(groupKey), {
      params: toQueryParams(params),
    })
    return response.data
  },

  exportClientVat: async (clientId: number, format: 'excel' | 'pdf', year: number): Promise<void> => {
    const response = await api.get<Blob>(VAT_ENDPOINTS.vatClientExport(clientId), {
      params: toQueryParams({ format, year }),
      responseType: 'blob',
    })
    const contentDisposition = response.headers['content-disposition']
    const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/)
    const ext = format === 'excel' ? 'xlsx' : 'pdf'
    const filename = filenameMatch?.[1] || `vat_client_${clientId}_${year}.${ext}`
    const mimeType =
      format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
    const contentType = response.headers['content-type']
    downloadBlob(response.data, filename, typeof contentType === 'string' ? contentType : mimeType)
  },
}
