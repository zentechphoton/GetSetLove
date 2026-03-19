import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
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
`

export const REGISTER_MUTATION = gql`
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
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export const ME_QUERY = gql`
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
`

