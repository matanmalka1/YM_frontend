export interface InvoiceResponse {
  id: number
  charge_id: number
  provider: string
  external_invoice_id: string
  document_url?: string | null
  issued_at: string
  created_at: string
}

export interface InvoiceAttachRequest {
  charge_id: number
  provider: string
  external_invoice_id: string
  issued_at: string
  document_url?: string | null
}
