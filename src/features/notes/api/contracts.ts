import type { PaginatedResponse } from '@/types'

export interface EntityNote {
  id: number
  entity_type: string
  entity_id: number
  note: string
  created_by: number | null
  created_by_name: string | null
  created_at: string
  updated_at: string | null
}

export interface CreateNotePayload {
  note: string
}

export interface UpdateNotePayload {
  note: string
}

export type EntityNoteListResponse = PaginatedResponse<EntityNote>
