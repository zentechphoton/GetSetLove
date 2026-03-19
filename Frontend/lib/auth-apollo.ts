import { 
  useMutation, 
  useQuery, 
  useApolloClient 
} from '@apollo/client'
import { 
  LOGIN_MUTATION, 
  REGISTER_MUTATION, 
  LOGOUT_MUTATION, 
  ME_QUERY 
} from './graphql/operations'
import { useAuthStore } from '@/store/authStore'

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

export interface RegisterInput {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Hook for Login
export function useLogin() {
  const { setAuth } = useAuthStore()
  const client = useApolloClient()

  const [loginMutation, { loading, error }] = useMutation<{
    login: AuthResponse
  }>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.login
      
      // Store token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      // Update auth store
      setAuth({ user, token, isAuthenticated: true })
      
      // Reset Apollo cache
      client.resetStore()
    },
    onError: (err) => {
      console.error('Login error:', err)
    },
  })

  const login = async (input: LoginInput) => {
    try {
      const result = await loginMutation({
        variables: { input },
      })
      return result.data?.login
    } catch (err) {
      throw err
    }
  }

  return { login, loading, error }
}

// Hook for Register
export function useRegister() {
  const { setAuth } = useAuthStore()
  const client = useApolloClient()

  const [registerMutation, { loading, error }] = useMutation<{
    register: AuthResponse
  }>(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.register
      
      // Store token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      // Update auth store
      setAuth({ user, token, isAuthenticated: true })
      
      // Reset Apollo cache
      client.resetStore()
    },
    onError: (err) => {
      console.error('Register error:', err)
    },
  })

  const register = async (input: RegisterInput) => {
    try {
      const result = await registerMutation({
        variables: { input },
      })
      return result.data?.register
    } catch (err) {
      throw err
    }
  }

  return { register, loading, error }
}

// Hook for Logout
export function useLogout() {
  const { clearAuth } = useAuthStore()
  const client = useApolloClient()

  const [logoutMutation, { loading, error }] = useMutation<{
    logout: boolean
  }>(LOGOUT_MUTATION, {
    onCompleted: () => {
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      // Clear auth store
      clearAuth()
      
      // Clear Apollo cache
      client.clearStore()
    },
    onError: (err) => {
      console.error('Logout error:', err)
      // Still clear local storage and cache even if mutation fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      clearAuth()
      client.clearStore()
    },
  })

  const logout = async () => {
    try {
      await logoutMutation()
    } catch (err) {
      // Even if mutation fails, clear everything
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      clearAuth()
      client.clearStore()
    }
  }

  return { logout, loading, error }
}

// Hook for getting current user
export function useMe() {
  const { data, loading, error, refetch } = useQuery<{
    me: User
  }>(ME_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    skip: typeof window === 'undefined', // Skip on server
  })

  return {
    user: data?.me || null,
    loading,
    error,
    refetch,
  }
}

