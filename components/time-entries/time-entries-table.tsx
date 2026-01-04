'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { TimeEntry } from '@/types/api'
import { TimeEntryActions } from './time-entry-actions'

interface TimeEntriesTableProps {
  data: TimeEntry[]
  limit: number
  offset: number
  hasMore: boolean
}

export function TimeEntriesTable({
  data,
  limit,
  offset,
  hasMore,
}: TimeEntriesTableProps) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="rounded-md border flex-1 mx-2 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">ID</TableHead>
              <TableHead className="w-[60px]">Task ID</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>{entry.taskId}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {entry.comment}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.start).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.end).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <TimeEntryActions entry={entry} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No time entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="border-t py-4">
        <PaginationControls
          limit={limit}
          offset={offset}
          currentCount={data.length}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
