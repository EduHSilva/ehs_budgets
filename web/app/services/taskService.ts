import { getTokenCookie } from '~/utils/util'
import { apiFetch } from '~/utils/apiFetch'
import type { Task, TaskPriority, TaskStatus } from '~/utils/types'

export interface TaskInput {
  title: string
  details?: string | null
  startDate: string
  priority?: TaskPriority
  clientId?: string | null
  clearClient?: boolean
}

export interface TaskServiceOptions {
  apiUrl: string | unknown
}

export interface TaskService {
  findRange(start: string, end: string, size?: number, page?: number): Promise<DefaultResponse<Page<Task>>>

  add(task: TaskInput): Promise<DefaultResponse<Task>>

  update(id: string, task: Partial<TaskInput> & { status?: TaskStatus }): Promise<DefaultResponse<Task>>

  complete(id: string): Promise<DefaultResponse<Task>>

  delete(id: string): Promise<void>
}

export default function taskService({ apiUrl }: TaskServiceOptions): TaskService {
  return {

    async findRange(start: string, end: string, size = 100, page = 0): Promise<DefaultResponse<Page<Task>>> {
      const query = new URLSearchParams({
        page: String(page),
        size: String(size),
        start,
        end
      })

      return await apiFetch(`${apiUrl}?${query.toString()}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        }
      })
    },

    async add(task: TaskInput): Promise<DefaultResponse<Task>> {
      return await apiFetch(`${apiUrl}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'POST',
        body: {
          title: task.title,
          details: task.details ?? '',
          startDate: task.startDate,
          priority: task.priority ?? 'MEDIUM',
          clientId: task.clientId ?? null,
          type: 'UNIQUE'
        }
      })
    },

    async update(id: string, task: Partial<TaskInput> & { status?: TaskStatus }): Promise<DefaultResponse<Task>> {
      return await apiFetch(`${apiUrl}${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'PUT',
        body: task
      })
    },

    async complete(id: string): Promise<DefaultResponse<Task>> {
      return await apiFetch(`${apiUrl}${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'PUT',
        body: { status: 'DONE' }
      })
    },

    async delete(id: string): Promise<void> {
      return await apiFetch(`${apiUrl}${id}`, {
        headers: {
          Authorization: 'Bearer ' + getTokenCookie().value?.token
        },
        method: 'DELETE'
      })
    }
  }
}
