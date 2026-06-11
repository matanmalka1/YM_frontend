import type { BackendAction } from '@/lib/actions/types'
import type { PaginatedResponse } from '@/types'

export interface ChargeResponse {
  id: number
  client_record_id: number
  client_name: string | null
  office_client_number?: number | null
  business_id?: number | null
  business_name: string | null
  annual_report_id: number | null
  charge_type: string
  status: string
  amount: string
  period: string | null
  months_covered: number | null
  description: string | null
  created_at: string
  created_by: number | null
  issued_at: string | null
  issued_by: number | null
  paid_at: string | null
  paid_by: number | null
  canceled_at: string | null
  canceled_by: number | null
  cancellation_reason: string | null
  available_actions?: BackendAction[]
}

// Thin DTO for the charges list/table rows. Mirrors backend ChargeListItem.
// Detail-only fields (description, audit actors, cancellation reason,
// annual_report_id) live on ChargeResponse (GET /charges/{id}).
export interface ChargeListItem {
  id: number
  client_record_id: number
  client_name: string | null
  office_client_number?: number | null
  business_id?: number | null
  business_name: string | null
  charge_type: string
  status: string
  amount: string
  period: string | null
  months_covered: number | null
  created_at: string
  issued_at: string | null
  paid_at: string | null
  available_actions?: BackendAction[]
}

export interface ChargeStatusStat {
  count: number
  amount: string
}

export interface ChargeListStats {
  draft: ChargeStatusStat
  issued: ChargeStatusStat
  paid: ChargeStatusStat
  canceled: ChargeStatusStat
}

export type ChargesListResponse = PaginatedResponse<ChargeListItem> & { stats: ChargeListStats }

export interface ChargesListParams {
  client_record_id?: number
  business_id?: number
  status?: string
  charge_type?: string
  period?: string
  issued_after?: string
  issued_before?: string
  page?: number
  page_size?: number
}

export interface CreateChargePayload {
  client_record_id: number
  business_id?: number | null
  amount: string
  charge_type:
    | 'monthly_retainer'
    | 'annual_report_fee'
    | 'vat_filing_fee'
    | 'representation_fee'
    | 'consultation_fee'
    | 'other'
  period?: string | null
  months_covered?: number | null
  description?: string | null
  annual_report_id?: number | null
}

export interface BulkChargeActionPayload {
  charge_ids: number[]
  action: 'issue' | 'mark-paid' | 'cancel'
  cancellation_reason?: string
}

export interface BulkChargeFailedItem {
  id: number
  error: string
}

export interface BulkChargeActionResult {
  succeeded: number[]
  failed: BulkChargeFailedItem[]
}
