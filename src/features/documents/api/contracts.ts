import type { DocumentType } from '../documents.constants'

export interface PermanentDocumentResponse {
  id: number
  client_record_id: number
  client_name: string | null
  business_id: number | null
  scope: 'client' | 'business'
  document_type: string
  storage_key: string
  tax_year: number | null
  is_present: boolean
  uploaded_by: number
  uploaded_at: string
  version: number
  superseded_by: number | null
  status: string
  annual_report_id: number | null
  binder_id: number | null
  original_filename: string | null
  file_size_bytes: number | null
  mime_type: string | null
  approved_by: number | null
  approved_at: string | null
  rejected_by: number | null
  rejected_at: string | null
  is_deleted: boolean
}

export interface PermanentDocumentListResponse {
  items: PermanentDocumentResponse[]
  total: number
  page: number
  page_size: number
}

export interface DocumentVersionsResponse {
  items: PermanentDocumentResponse[]
  limit?: number
  has_more: boolean
}

export interface OperationalSignalsResponse {
  client_record_id: number
  missing_documents: string[]
}

export interface UploadDocumentPayload {
  client_record_id: number
  business_id?: number | null
  document_type:
    | 'id_copy'
    | 'power_of_attorney'
    | 'engagement_agreement'
    | 'tax_form'
    | 'receipt'
    | 'invoice_doc'
    | 'bank_approval'
    | 'withholding_certificate'
    | 'nii_approval'
    | 'other'
  file: File
  tax_year?: number | null
  annual_report_id?: number | null
}

export interface ListDocumentsByClientParams {
  tax_year?: number
  document_type?: string
  status?: string
  page?: number
  page_size?: number
}

export interface ListDocumentsByBinderParams {
  page?: number
  page_size?: number
}

export interface UpdateDocumentPayload {
  document_type?: DocumentType
  original_filename?: string
  tax_year?: number | null
}
