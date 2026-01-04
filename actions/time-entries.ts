'use server'

import {
  TimeEntry,
  PaginationParams,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
} from '@/types/api'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.MEMTIME_API_URL
const API_KEY = process.env.MEMTIME_API_KEY

if (!API_URL || !API_KEY) {
  throw new Error('Missing API_URL or API_KEY environment variables')
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

export async function getTimeEntries(
  params?: PaginationParams
): Promise<TimeEntry[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.append('limit', params.limit.toString())
  if (params?.offset) query.append('offset', params.offset.toString())

  query.append('sortBy', params?.sortBy || 'start')
  query.append('order', params?.order || 'asc')

  const response = await fetch(`${API_URL}/time-entries?${query.toString()}`, {
    headers,
    next: { tags: ['time-entries'], revalidate: 60 },
  })

  if (!response.ok) {
    console.error('Failed to fetch time entries', await response.text())
    return []
  }

  return response.json()
}

export async function createTimeEntry(data: CreateTimeEntryInput) {
  const response = await fetch(`${API_URL}/time-entries`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to create time entry', errorText)
    throw new Error(errorText || 'Failed to create time entry')
  }

  revalidatePath('/time-entries')
  return response.json()
}

export async function updateTimeEntry(data: UpdateTimeEntryInput) {
  const { id, ...body } = data
  const response = await fetch(`${API_URL}/time-entries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to update time entry ${id}`, errorText)
    throw new Error(errorText || 'Failed to update time entry')
  }

  revalidatePath('/time-entries')
  return response.json()
}

export async function deleteTimeEntry(id: number) {
  const response = await fetch(`${API_URL}/time-entries/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Failed to delete time entry ${id}`, errorText)
    throw new Error(errorText || 'Failed to delete time entry')
  }

  revalidatePath('/time-entries')
  return true
}
