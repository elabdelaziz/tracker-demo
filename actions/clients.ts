'use server'

import { Client, PaginationParams, Project, Task } from '@/types/api'

const API_URL = process.env.MEMTIME_API_URL
const API_KEY = process.env.MEMTIME_API_KEY

if (!API_URL || !API_KEY) {
  throw new Error('Missing API_URL or API_KEY environment variables')
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

export async function getClients(params?: PaginationParams): Promise<Client[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', params.limit.toString())
  if (params?.offset) query.append('offset', params.offset.toString())
  if (params?.sortBy) query.append('sortBy', params.sortBy)
  if (params?.order) query.append('order', params.order)

  const response = await fetch(`${API_URL}/clients?${query.toString()}`, {
    headers,
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Failed to fetch clients', errorBody)
    throw new Error(errorBody || 'Failed to fetch clients')
  }

  return response.json()
}

export async function getProjects(clientId: number): Promise<Project[]> {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/projects?sortBy=id&order=asc`,
    {
      headers,
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`Failed to fetch projects for client ${clientId}`, errorBody)
    throw new Error(errorBody || 'Failed to fetch projects')
  }

  return response.json()
}

export async function getTasks(projectId: number): Promise<Task[]> {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/tasks?sortBy=name&order=asc`,
    {
      headers,
      next: { revalidate: 60 },
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`Failed to fetch tasks for project ${projectId}`, errorBody)
    throw new Error(errorBody || 'Failed to fetch tasks')
  }

  return response.json()
}
