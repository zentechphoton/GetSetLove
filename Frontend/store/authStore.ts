'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, User } from '@/lib/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<User | null>
  register: (data: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => Promise<User | null>
  logout: () => Promise<void>
  initialize: () => void
  setHasHydrated: (state: boolean) => void
  setAuth: (auth: { user: User; token: string; isAuthenticated: boolean }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(email, password)
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
          }
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          return response.user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(data)
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
          }
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          return response.user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      initialize: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          const userStr = localStorage.getItem('user')
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr)
              set({
                user,
                token,
                isAuthenticated: true,
              })
            } catch (error) {
              console.error('Error parsing user data:', error)
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              })
            }
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            })
          }
        }
      },

      setAuth: ({ user, token, isAuthenticated }) => {
        set({
          user,
          token,
          isAuthenticated,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
