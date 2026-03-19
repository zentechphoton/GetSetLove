import axios from 'axios'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: Array<string | number>
  }>
}

class GraphQLClient {
  private url: string

  constructor(url: string) {
    this.url = url
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  async request<T = any>(
    query: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<T> {
    try {
      const response = await axios.post<GraphQLResponse<T>>(
        this.url,
        {
          query,
          variables,
          operationName,
        },
        {
          headers: this.getHeaders(),
        }
      )

      if (response.data.errors) {
        const errorMessage = response.data.errors[0]?.message || 'GraphQL error'
        throw new Error(errorMessage)
      }

      if (!response.data.data) {
        throw new Error('No data returned from GraphQL query')
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
      }
      throw error
    }
  }

  query<T = any>(
    query: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<T> {
    return this.request<T>(query, variables, operationName)
  }

  mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<T> {
    return this.request<T>(mutation, variables, operationName)
  }
}

export const graphqlClient = new GraphQLClient(GRAPHQL_URL)

// GraphQL Queries and Mutations
export const AUTH_QUERIES = {
  LOGIN: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user {
          id
          username
          email
          first_name
          last_name
          avatar
          role
          is_verified
          is_premium
          created_at
          updated_at
        }
      }
    }
  `,
  REGISTER: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        token
        user {
          id
          username
          email
          first_name
          last_name
          avatar
          role
          is_verified
          is_premium
          created_at
          updated_at
        }
      }
    }
  `,
  LOGOUT: `
    mutation Logout {
      logout
    }
  `,
  ME: `
    query Me {
      me {
        id
        username
        email
        first_name
        last_name
        avatar
        role
        is_verified
        is_premium
        created_at
        updated_at
      }
    }
  `,
}

