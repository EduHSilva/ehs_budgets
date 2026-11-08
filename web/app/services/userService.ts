import type { DefaultResponse, User } from '~/utils/types'
import { getTokenCookie } from '~/utils/util'

export interface UserServiceOptions {
  apiUrl: string | unknown
}

export interface UserService {
  login(email: string | null, password: string | null, tokenGmail: string | null): Promise<DefaultResponse<User>>

  getUser(): Promise<DefaultResponse<User>>

  register(username: string, email: string, password: string): Promise<DefaultResponse<User>>
}

export default function userService({ apiUrl }: UserServiceOptions): UserService {
  return {
    async login(email: string, password: string, tokenGmail: string): Promise<DefaultResponse<User>> {
      return await $fetch(`${apiUrl}auth/login`, {
        method: 'POST',
        body: { email, password, tokenGmail }
      })
    },

    async getUser() {
      return await $fetch(`${apiUrl}auth/me`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },

    async register(username: string, email: string, password: string) {
      return await $fetch(`${apiUrl}auth/register`, {
        method: 'POST',
        body: { username, email, password, role: 'BUDGETS' }
      })
    }
  }
}
