import { getTokenCookie } from '~/utils/util'
import type { DashboardData, DashboardKanbanData } from '~/utils/types'

export interface BudgetServiceOptions {
  apiUrl: string | unknown
}

export interface BudgetService {
  find(): Promise<DefaultResponse<DashboardData>>
  findKanban(): Promise<DefaultResponse<DashboardKanbanData>>
}

export default function budgetService({ apiUrl }: BudgetServiceOptions): BudgetService {
  return {

    async find(): Promise<DefaultResponse<DashboardData>> {
      const base = `${apiUrl}dashboard`
      return await $fetch(base, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },
    async findKanban(): Promise<DefaultResponse<DashboardKanbanData>> {
      const base = `${apiUrl}dashboard/kanban`
      return await $fetch(base, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    }
  }
}
