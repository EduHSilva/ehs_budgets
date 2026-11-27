export type DefaultResponse<T> = {
  data: T
  message: string
  links: object
}

export type Page<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

export type User = {
  email: string
  username: string
  id: string
  token: string
  lastLogin?: string
  roles?: string[]
  apps?: string[]
}

export type UserDetails = {
  id: string
  createdDate?: string
  email: string
  username: string
  status?: string
  roles?: string[]
  companyName?: string | null
}

export type Client = {
  id?: string
  email: string
  name: string
  phone: string
  status?: string
  observations?: string
}

export type Item = {
  id?: string
  name: string
  description: string
  quantity: number
  price: number
}

export type Budget = {
  id?: string
  title: string
  description: string
  client: string
  clientName?: string
  approvalToken?: string
  validate: number
  items: Item[]
  terms?: string
  status?: string
  observations?: string
  total?: number
  kanbanOrder?: number
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskStatus = 'PENDING' | 'WORKING' | 'DONE' | 'DELAYED'

export type Task = {
  id: string
  title: string
  details: string | null
  startDate: string
  endDate: string | null
  type: string
  status: TaskStatus
  priority: TaskPriority
  clientId: string | null
  completedDate?: string | null
  createdDate?: string
}

export type DashboardData = {
  totalClients: number
  pendingServices: number
  workingServices: number
  totalReceived: number
  recentServices: Budget[]
}

export type DashboardKanbanData = {
  news: Budget[]
  working: Budget[]
  done: Budget[]
}
