// ── Domain enums ──────────────────────────────────────────────────────────────

export type TimelineBinderStatus = 'none' | 'in_office' | 'ready_for_pickup' | 'returned'

// ── Metadata ──────────────────────────────────────────────────────────────────

export interface TimelineEventMetadata {
  // binder status change
  old_status?: TimelineBinderStatus | null
  new_status?: TimelineBinderStatus | null
  // charge / invoice
  amount?: number | string | null
  provider?: string | null
  external_invoice_id?: string | number | null
  // annual report
  history_id?: number | null
  annual_report_id?: number | null
  tax_year?: number | string | null
  form_type?: string | null
  from_status?: string | null
  to_status?: string | null
  note?: string | null
  // signature lifecycle
  signature_request_id?: number | null
  request_type?: string | null
  status?: string | null
  document_id?: number | null
  signer_name?: string | null
  reason?: string | null
  notes?: string | null
  [key: string]: unknown
}

// ── Core event ────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  event_type: string
  timestamp: string
  binder_id: number | null
  charge_id: number | null
  description: string
  metadata?: TimelineEventMetadata | null
}

// ── API contracts ─────────────────────────────────────────────────────────────

export interface TimelineResponse {
  client_record_id: number
  events: TimelineEvent[]
  page: number
  page_size: number
  total: number
}

export interface TimelineParams {
  page?: number
  page_size?: number
}
