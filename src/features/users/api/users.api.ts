import { api } from '@/api/client'
import { USER_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  UserResponse,
  UserListResponse,
  UserAuditLogListResponse,
  ListUsersParams,
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
  ListAuditLogsParams,
} from './contracts'

export const usersApi = {
  list: async (params: ListUsersParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(USER_ENDPOINTS.users, {
      params: toQueryParams(params),
    })
    return response.data
  },

  create: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(USER_ENDPOINTS.users, payload)
    return response.data
  },

  update: async (userId: number, payload: UpdateUserPayload): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>(USER_ENDPOINTS.userById(userId), payload)
    return response.data
  },

  activate: async (userId: number): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(USER_ENDPOINTS.userActivate(userId))
    return response.data
  },

  deactivate: async (userId: number): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(USER_ENDPOINTS.userDeactivate(userId))
    return response.data
  },

  resetPassword: async (userId: number, payload: ResetPasswordPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(USER_ENDPOINTS.userResetPassword(userId), payload)
    return response.data
  },

  listAuditLogs: async (params: ListAuditLogsParams): Promise<UserAuditLogListResponse> => {
    const response = await api.get<UserAuditLogListResponse>(USER_ENDPOINTS.userAuditLogs, {
      params: toQueryParams(params),
    })
    return response.data
  },
}
