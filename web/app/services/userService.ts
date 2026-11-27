import type { DefaultResponse, User, UserDetails } from '~/utils/types'
import { getTokenCookie } from '~/utils/util'
import { apiFetch } from '~/utils/apiFetch'

export interface UserServiceOptions {
  apiUrl: string | unknown
}

export interface UserUpdatePayload {
  username: string
  email: string
}

export interface UserService {
  login(email: string | null, password: string | null, tokenGmail: string | null): Promise<DefaultResponse<User>>

  getUser(): Promise<DefaultResponse<User>>

  register(username: string, email: string, password: string): Promise<DefaultResponse<User>>

  findById(id: string): Promise<DefaultResponse<UserDetails>>

  update(id: string, payload: UserUpdatePayload): Promise<DefaultResponse<UserDetails>>
}

export default function userService({ apiUrl }: UserServiceOptions): UserService {
  return {
    async login(email: string, password: string, tokenGmail: string): Promise<DefaultResponse<User>> {
      return await apiFetch(`${apiUrl}auth/login`, {
        method: 'POST',
        body: { email, password, tokenGmail, app: 'BUDGETS' }
      })
    },

    async getUser() {
      return await apiFetch(`${apiUrl}auth/me`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },

    async register(username: string, email: string, password: string) {
      return await apiFetch(`${apiUrl}auth/register`, {
        method: 'POST',
        body: { username, email, password, role: 'BUDGETS' }
      })
    },

    async findById(id: string): Promise<DefaultResponse<UserDetails>> {
      return await apiFetch(`${apiUrl}users/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },

    async update(id: string, payload: UserUpdatePayload): Promise<DefaultResponse<UserDetails>> {
      return await apiFetch(`${apiUrl}users/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'PUT',
        body: payload
      })
    }
  }
}
