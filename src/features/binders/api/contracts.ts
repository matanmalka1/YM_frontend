import type { BinderCapacityStatus, BinderLocationStatus, BinderResponse } from '../types'
import type { NotificationDetail } from '@/features/notifications'
import type { PaginatedResponse } from '@/types'

export interface BinderDetailResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  client_id_number?: string | null
  binder_number: string
  period_start: string | null
  period_end: string | null
  location_status: BinderLocationStatus
  capacity_status: BinderCapacityStatus
  handed_over_at: string | null
  handover_recipient_name: string | null
  days_in_office: number | null
}

export type BinderListResponseExtended = PaginatedResponse<BinderDetailResponse>

export interface BinderReadyForHandoverResponse {
  binder: BinderResponse
  notification: NotificationDetail | null
}

export type BinderMarkReadyForHandoverBulkResponse = BinderReadyForHandoverResponse[]

export interface BinderMarkReadyForHandoverBulkPayload {
  client_record_id: number
  until_period_year: number
  until_period_month: number
}

export interface BinderHandoverToClientBulkPayload {
  client_record_id: number
  binder_ids: number[]
  received_by_name: string
  handed_over_at: string
  until_period_year: number
  until_period_month: number
  notes?: string | null
}

export interface BinderHandoverToClientBulkResponse {
  id: number
  client_record_id: number
  received_by_name: string
  handed_over_at: string
  until_period_year: number
  until_period_month: number
  binder_ids: number[]
  notes: string | null
  created_at: string
}

export interface BinderIntakeUpdatePayload {
  received_at?: string
  received_by?: number
  notes?: string | null
  client_record_id?: number
  binder_id?: number
}
