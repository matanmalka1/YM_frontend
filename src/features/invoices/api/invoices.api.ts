import { api } from '@/api/client'
import { INVOICE_ENDPOINTS } from './endpoints'
import type { InvoiceAttachRequest, InvoiceResponse } from './contracts'

export const invoicesApi = {
  attach: async (payload: InvoiceAttachRequest): Promise<InvoiceResponse> => {
    const response = await api.post<InvoiceResponse>(INVOICE_ENDPOINTS.invoices, payload)
    return response.data
  },

  getByChargeId: async (chargeId: number): Promise<InvoiceResponse> => {
    const response = await api.get<InvoiceResponse>(INVOICE_ENDPOINTS.invoiceByChargeId(chargeId))
    return response.data
  },
}
