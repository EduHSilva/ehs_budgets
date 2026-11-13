import { getTokenCookie } from '~/utils/util'
import { apiFetch } from '~/utils/apiFetch'
import type { Client } from '~/utils/types'

export interface ClientServiceOptions {
  apiUrl: string | unknown
}

export interface ClientService {
  find(page: number, name: string | null, status: string | null, size?: number): Promise<DefaultResponse<Page<Client>>>

  add(client: Client): Promise<Client>

  update(id: string, client: Client): Promise<Client>

  delete(id: string): Promise<void>
}

export default function clientService({ apiUrl }: ClientServiceOptions): ClientService {
  return {

    async find(page: number, name: string | null, status: string | null, size = 10) {
      let base = `${apiUrl}clients?page=${page}&size=${size}`
      if (name != null && name != '') {
        base += `&name=${name}`
      }
      if (status != null && status != '') {
        base += `&status=${status}`
      }
      return await apiFetch(base, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },

    async add(client: Client): Promise<Client> {
      return await apiFetch(`${apiUrl}clients`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'POST',
        body: client
      })
    },

    async update(id: string, client: Client): Promise<Client> {
      return await apiFetch(`${apiUrl}clients/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'PUT',
        body: {
          name: client.name,
          email: client.email,
          phone: client.phone,
          observations: client.observations,
          status: client.status
        }
      })
    },

    async delete(id: string): Promise<void> {
      return await apiFetch(`${apiUrl}clients/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'DELETE'
      })
    }
  }
}
