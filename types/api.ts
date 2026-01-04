export interface Client {
  id: number
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  clientId: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  parent: number
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: number
  taskId: number
  userId: string
  comment: string
  start: string
  end: string
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface CreateTimeEntryInput {
  taskId: number
  comment: string
  start: string
  end: string
}

export interface UpdateTimeEntryInput extends CreateTimeEntryInput {
  id: number
}
