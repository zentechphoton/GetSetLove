import api from './api'
import { graphqlClient, AUTH_QUERIES } from './graphql'

export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  role?: 'user' | 'admin' | 'super_admin'
  is_verified?: boolean
  is_premium?: boolean
  created_at: string
  updated_at: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  // GraphQL implementation
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const data = await graphqlClient.mutate<{ login: LoginResponse }>(
        AUTH_QUERIES.LOGIN,
        {
          input: {
            email,
            password,
          },
        },
        'Login'
      )
      return data.login
    } catch (error) {
      // Fallback to REST API if GraphQL fails
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      })
      return response.data
    }
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const result = await graphqlClient.mutate<{ register: LoginResponse }>(
        AUTH_QUERIES.REGISTER,
        {
          input: {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
          },
        },
        'Register'
      )
      return result.register
    } catch (error) {
      // Fallback to REST API if GraphQL fails
      const response = await api.post<LoginResponse>('/auth/register', data)
      return response.data
    }
  },

  async logout(): Promise<void> {
    try {
      await graphqlClient.mutate<{ logout: boolean }>(AUTH_QUERIES.LOGOUT, {}, 'Logout')
    } catch (error) {
      console.error('GraphQL logout error:', error)
      // Fallback to REST API
      try {
        await api.post('/auth/logout')
      } catch (restError) {
        console.error('REST logout error:', restError)
      }
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const data = await graphqlClient.query<{ me: User }>(AUTH_QUERIES.ME, {}, 'Me')
      return data.me
    } catch (error) {
      // Fallback to REST API if GraphQL fails
      const response = await api.get<User>('/auth/me')
      return response.data
    }
  },
}
