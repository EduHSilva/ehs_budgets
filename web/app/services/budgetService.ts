import { getTokenCookie } from '~/utils/util'
import { apiFetch } from '~/utils/apiFetch'
import type { Budget } from '~/utils/types'

export interface BudgetServiceOptions {
  apiUrl: string | unknown
}

export interface BudgetService {
  find(page: number, title: string | null, status: string | null, size?: number): Promise<DefaultResponse<Page<Budget>>>

  add(budget: Budget): Promise<Budget>

  update(id: string, budget: Budget): Promise<Budget>

  delete(id: string): Promise<void>

  findById(id: string): Promise<DefaultResponse<Budget>>
}

export default function budgetService({ apiUrl }: BudgetServiceOptions): BudgetService {
  return {

    async find(page: number, title: string | null, status: string | null, size = 10): Promise<DefaultResponse<Page<Budget>>> {
      let base = `${apiUrl}budgets?page=${page}&size=${size}`
      if (title != null && title != '') {
        base += `&title=${title}`
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

    async add(budget: Budget): Promise<Budget> {
      return await apiFetch(`${apiUrl}budgets`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'POST',
        body: budget
      })
    },

    async findById(id: string): Promise<DefaultResponse<Budget>> {
      return await apiFetch(`${apiUrl}budgets/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'GET'
      })
    },

    async update(id: string, budget: Budget): Promise<Budget> {
      return await apiFetch(`${apiUrl}budgets/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'PUT',
        body: budget
      })
    },

    async delete(id: string): Promise<void> {
      return await apiFetch(`${apiUrl}budgets/${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'DELETE'
      })
    }
  }
}
