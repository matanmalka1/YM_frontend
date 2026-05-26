import { CORE_ENDPOINTS } from './core-endpoints'
import type { AuthUser } from '@/types'
import { api, SKIP_AUTH_INTERCEPT_HEADER } from './client'
import { setAccessToken } from './auth-session'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokenResponse {
  access_token: string
  token_type: 'bearer'
  user: AuthUser
}

export interface RefreshResponse {
  access_token: string
  token_type: 'bearer'
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface ResetPasswordResponse {
  message: string
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthTokenResponse> => {
    const response = await api.post<AuthTokenResponse>(CORE_ENDPOINTS.authLogin, payload, {
      headers: { [SKIP_AUTH_INTERCEPT_HEADER]: '1' },
    })
    setAccessToken(response.data.access_token)
    return response.data
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>(CORE_ENDPOINTS.authRefresh, undefined, {
      headers: { [SKIP_AUTH_INTERCEPT_HEADER]: '1' },
    })
    setAccessToken(response.data.access_token)
    return response.data
  },

  me: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>(CORE_ENDPOINTS.authMe)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post(CORE_ENDPOINTS.authLogout, undefined, {
      headers: { [SKIP_AUTH_INTERCEPT_HEADER]: '1' },
    })
    setAccessToken(null)
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>(CORE_ENDPOINTS.authForgotPassword, payload, {
      headers: { [SKIP_AUTH_INTERCEPT_HEADER]: '1' },
    })
    return response.data
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>(CORE_ENDPOINTS.authResetPassword, payload, {
      headers: { [SKIP_AUTH_INTERCEPT_HEADER]: '1' },
    })
    return response.data
  },
}
