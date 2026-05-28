import type { PaginatedResponse } from '@/types'

export interface UserResponse {
  id: number
  full_name: string
  email: string
  phone: string | null
  role: 'advisor' | 'secretary'
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export type UserListResponse = PaginatedResponse<UserResponse>

export interface UserAuditLogResponse {
  id: number
  action: string
  actor_user_id: number | null
  target_user_id: number | null
  email: string | null
  status: 'success' | 'failure'
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type UserAuditLogListResponse = PaginatedResponse<UserAuditLogResponse>

export interface ListUsersParams {
  page?: number
  page_size?: number
  is_active?: 'true' | 'false'
  search?: string
}

export interface CreateUserPayload {
  full_name: string
  email: string
  phone?: string | null
  role: 'advisor' | 'secretary'
  password: string
}

export interface UpdateUserPayload {
  full_name?: string
  phone?: string | null
  role?: 'advisor' | 'secretary'
  email?: string
}

export interface ResetPasswordPayload {
  new_password: string
}

export interface ListAuditLogsParams {
  page?: number
  page_size?: number
  action?: string
  target_user_id?: number
  actor_user_id?: number
  email?: string
  from?: string
  to?: string
}
