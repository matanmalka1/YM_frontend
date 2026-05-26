import type { AuthUser } from '@/types'

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  hasBootstrapped: boolean
  error: string | null
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  resetSession: () => void
}
