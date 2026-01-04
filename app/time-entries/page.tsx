import { getTimeEntries } from '@/actions/time-entries'
import { TimeEntriesTable } from '@/components/time-entries/time-entries-table'
import { EntryFormDialog } from '@/components/time-entries/entry-form-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TimeEntriesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const limit =
    typeof resolvedParams.limit === 'string'
      ? parseInt(resolvedParams.limit)
      : 10
  const offset =
    typeof resolvedParams.offset === 'string'
      ? parseInt(resolvedParams.offset)
      : 0

  const allEntries = await getTimeEntries({
    limit: limit + 1,
    offset,
  })

  // Check if there are more pages
  const hasMore = allEntries.length > limit
  const entries = allEntries.slice(0, limit)

  return (
    <div className="flex flex-col h-full">
      <div className="flex my-4 mx-2 justify-start">
        <EntryFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          }
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <TimeEntriesTable
          data={entries}
          limit={limit}
          offset={offset}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
