import type { PaginatedResponse } from '@/types'

export type SignatureRequestStatus = 'pending_signature' | 'signed' | 'declined' | 'expired' | 'canceled'

export type SignatureRequestType =
  | 'engagement_agreement'
  | 'annual_report_approval'
  | 'power_of_attorney'
  | 'vat_return_approval'
  | 'custom'

export interface SignatureRequestResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  business_id: number | null
  business_name: string | null
  created_by: number
  request_type: SignatureRequestType
  title: string
  description: string | null
  signer_name: string
  signer_email: string | null
  signer_phone: string | null
  status: SignatureRequestStatus
  content_hash: string | null
  storage_key: string | null
  annual_report_id: number | null
  document_id: number | null
  created_at: string
  updated_at: string | null
  sent_at: string | null
  expires_at: string | null
  signed_at: string | null
  declined_at: string | null
  canceled_at: string | null
  canceled_by: number | null
  decline_reason: string | null
  signed_document_key: string | null
}

export type SignatureRequestAuditAction =
  | 'signature_request.created'
  | 'signature_request.sent'
  | 'signature_request.viewed'
  | 'signature_request.signed'
  | 'signature_request.declined'
  | 'signature_request.canceled'
  | 'signature_request.expired'
  | 'signature_request.annual_report_signed'

export type SignatureRequestAuditActorType = 'user' | 'external_signer' | 'system'

interface SignatureRequestAuditItem {
  id: number
  action: string
  actor_type: SignatureRequestAuditActorType
  actor_display_name: string | null
  performed_at: string
  note: string | null
  client_record_id: number | null
  signer_name: string | null
  signer_email: string | null
  business_id: number | null
  annual_report_id: number | null
  document_id: number | null
  ip_address: string | null
  user_agent: string | null
  content_hash: string | null
  content_hash_missing: boolean | null
  signed_document_key: string | null
  reason: string | null
}

export interface SignatureRequestWithAudit extends SignatureRequestResponse {
  audit_trail: SignatureRequestAuditItem[]
}

export interface CreateSignatureRequestPayload {
  client_record_id: number
  business_id?: number
  request_type: SignatureRequestType
  title: string
  description?: string
  signer_name: string
  signer_email?: string
  signer_phone?: string
  annual_report_id?: number
  document_id?: number
  content_to_hash?: string
  expiry_days?: number
}

export interface CreateSignatureRequestResponse extends SignatureRequestResponse {
  signing_token: string
  signing_url_hint: string
}

export interface CancelSignatureRequestPayload {
  reason?: string
}

export interface ListPendingSignatureRequestsParams {
  page?: number
  page_size?: number
  client_record_id?: number | null
  request_type?: SignatureRequestType | null
  signer_email?: string | null
  created_after?: string | null
  created_before?: string | null
  expires_before?: string | null
}

export interface SignerViewResponse {
  request_id: number
  title: string
  description: string | null
  signer_name: string
  status: SignatureRequestStatus
  content_hash: string | null
  expires_at: string | null
  is_expired: boolean
}

export interface SignerDeclinePayload {
  reason?: string
}

export type SignatureRequestListResponse = PaginatedResponse<SignatureRequestResponse>
