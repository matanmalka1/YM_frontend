import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from './auth-session'

export const AUTH_EXPIRED_EVENT = 'auth:expired'
export const SKIP_AUTH_INTERCEPT_HEADER = 'X-Skip-Auth-Intercept'

const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean
}

let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  refreshPromise ??= refreshClient
    .post<{ access_token: string }>('/auth/refresh')
    .then((response) => {
      const token = response.data.access_token
      setAccessToken(token)
      return token
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

const expireAuthSession = (): void => {
  setAccessToken(null)
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const skipIntercept = error.config?.headers?.[SKIP_AUTH_INTERCEPT_HEADER] === '1'
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (error.response?.status === 401 && !skipIntercept && originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true

      try {
        const token = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch {
        expireAuthSession()
      }
    }

    return Promise.reject(error)
  },
)
