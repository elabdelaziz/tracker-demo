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

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getClients(
  params?: PaginationParams
): Promise<ActionResult<Client[]>> {
  try {
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
      if (response.status === 429 || errorBody.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorBody || 'Failed to fetch clients' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err) {
    console.error('Error fetching clients', err)
    return { success: false, error: 'Failed to fetch clients' }
  }
}

export async function getProjects(
  clientId: number
): Promise<ActionResult<Project[]>> {
  try {
    const response = await fetch(
      `${API_URL}/clients/${clientId}/projects?sortBy=id&order=asc`,
      {
        headers,
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(
        `Failed to fetch projects for client ${clientId}`,
        errorBody
      )
      if (response.status === 429 || errorBody.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorBody || 'Failed to fetch projects' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err) {
    console.error('Error fetching projects', err)
    return { success: false, error: 'Failed to fetch projects' }
  }
}

export async function getTasks(
  projectId: number
): Promise<ActionResult<Task[]>> {
  try {
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
      if (response.status === 429 || errorBody.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorBody || 'Failed to fetch tasks' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err) {
    console.error('Error fetching tasks', err)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}
