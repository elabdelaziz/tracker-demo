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

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function parseErrorResponse(errorBody: string, defaultMessage: string): string {
  try {
    const parsed = JSON.parse(errorBody)
    return parsed.error || defaultMessage
  } catch {
    return defaultMessage
  }
}

export async function getTimeEntries(
  params?: PaginationParams
): Promise<ActionResult<TimeEntry[]>> {
  try {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())

    query.append('sortBy', params?.sortBy || 'start')
    query.append('order', params?.order || 'asc')

    const response = await fetch(
      `${API_URL}/time-entries?${query.toString()}`,
      {
        headers,
        next: { tags: ['time-entries'], revalidate: 60 },
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Failed to fetch time entries', errorBody)
      if (response.status === 429 || errorBody.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: 'Failed to fetch time entries' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err) {
    console.error('Error fetching time entries', err)
    return { success: false, error: 'Failed to fetch time entries' }
  }
}

export async function createTimeEntry(
  data: CreateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    const response = await fetch(`${API_URL}/time-entries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create time entry', errorText)

      const errorMessage = parseErrorResponse(
        errorText,
        'Failed to create time entry'
      )

      if (response.status === 429 || errorText.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorMessage }
    }

    revalidatePath('/time-entries')
    const resultData = await response.json()
    return { success: true, data: resultData }
  } catch (err) {
    console.error('Error creating time entry', err)
    return { success: false, error: 'Failed to create time entry' }
  }
}

export async function updateTimeEntry(
  data: UpdateTimeEntryInput
): Promise<ActionResult<TimeEntry>> {
  try {
    const { id, ...body } = data
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to update time entry ${id}`, errorText)

      const errorMessage = parseErrorResponse(
        errorText,
        'Failed to update time entry'
      )

      if (response.status === 429 || errorText.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorMessage }
    }

    revalidatePath('/time-entries')
    const resultData = await response.json()
    return { success: true, data: resultData }
  } catch (err) {
    console.error('Error updating time entry', err)
    return { success: false, error: 'Failed to update time entry' }
  }
}

export async function deleteTimeEntry(
  id: number
): Promise<ActionResult<boolean>> {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to delete time entry ${id}`, errorText)

      const errorMessage = parseErrorResponse(
        errorText,
        'Failed to delete time entry'
      )

      if (response.status === 429 || errorText.includes('Too many requests')) {
        return { success: false, error: 'Too many requests' }
      }
      return { success: false, error: errorMessage }
    }

    revalidatePath('/time-entries')
    return { success: true, data: true }
  } catch (err) {
    console.error('Error deleting time entry', err)
    return { success: false, error: 'Failed to delete time entry' }
  }
}
