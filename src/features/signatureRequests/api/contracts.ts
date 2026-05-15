import type { PaginatedResponse } from '@/types'

export type SignatureRequestStatus = 'draft' | 'pending_signature' | 'signed' | 'declined' | 'expired' | 'canceled'

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
  sent_at: string | null
  expires_at: string | null
  signed_at: string | null
  declined_at: string | null
  canceled_at: string | null
  canceled_by: number | null
  decline_reason: string | null
  signed_document_key: string | null
}

export interface AuditEvent {
  id: number
  event_type: string
  actor_type: string
  actor_id: number | null
  actor_name: string | null
  ip_address: string | null
  notes: string | null
  occurred_at: string
}

export interface SignatureRequestWithAudit extends SignatureRequestResponse {
  audit_trail: AuditEvent[]
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
}

export interface CreateAndSendSignatureRequestPayload extends CreateSignatureRequestPayload {
  expiry_days?: number
}

export interface SendSignatureRequestPayload {
  expiry_days?: number
}

export interface SendSignatureRequestResponse extends SignatureRequestResponse {
  signing_token: string
  signing_url_hint: string
}

export interface CancelSignatureRequestPayload {
  reason?: string
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
