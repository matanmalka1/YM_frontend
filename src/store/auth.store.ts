import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { authApi } from '../api/auth.api'
import { setAccessToken } from '../api/auth-session'
import { getErrorMessage } from '../utils/utils'
import type { AuthState } from './auth.types'

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isLoading: false,
      hasBootstrapped: false,
      error: null,

      bootstrap: async () => {
        if (get().hasBootstrapped || get().isLoading) return
        set({ isLoading: true, error: null })

        try {
          await authApi.refresh()
          const user = await authApi.me()
          set({
            user,
            isLoading: false,
            hasBootstrapped: true,
            error: null,
          })
        } catch {
          setAccessToken(null)
          set({
            user: null,
            isLoading: false,
            hasBootstrapped: true,
            error: null,
          })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.login({ email, password })
          set({
            user: response.user,
            error: null,
            isLoading: false,
            hasBootstrapped: true,
          })
        } catch (error: unknown) {
          setAccessToken(null)
          set({
            user: null,
            error: getErrorMessage(error, 'שגיאה בהתחברות'),
            isLoading: false,
            hasBootstrapped: true,
          })
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          setAccessToken(null)
        } finally {
          set({
            user: null,
            isLoading: false,
            hasBootstrapped: true,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),

      resetSession: () => {
        setAccessToken(null)
        set({
          user: null,
          isLoading: false,
          hasBootstrapped: true,
          error: null,
        })
      },
    }),
    { name: 'AuthStore' },
  ),
)
