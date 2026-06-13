import type { PaginatedResponse } from '@/types'
import type { CorrespondenceType } from '../constants'

export interface CorrespondenceEntry {
  id: number
  client_record_id: number
  business_id: number | null
  contact_id: number | null
  correspondence_type: CorrespondenceType
  subject: string
  notes: string | null
  occurred_at: string
  created_by: number
  created_at: string
  updated_at: string | null
}

export interface CreateCorrespondencePayload {
  business_id?: number | null
  contact_id?: number | null
  correspondence_type: CorrespondenceEntry['correspondence_type']
  subject: string
  notes?: string | null
  occurred_at: string
}

export interface UpdateCorrespondencePayload {
  business_id?: number | null
  contact_id?: number | null
  correspondence_type?: CorrespondenceEntry['correspondence_type']
  subject?: string
  notes?: string | null
  occurred_at?: string
}

export type CorrespondenceListResponse = PaginatedResponse<CorrespondenceEntry>

export interface ListCorrespondenceParams {
  page?: number
  page_size?: number
  business_id?: number | null
  correspondence_type?: CorrespondenceType | null
  contact_id?: number | null
  occurred_after?: string | null
  occurred_before?: string | null
  order?: 'asc' | 'desc'
}
