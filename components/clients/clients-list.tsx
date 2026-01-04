import { Client } from '@/types/api'
import { ClientTreeItem } from './client-tree-item'
import { PaginationControls } from '@/components/ui/pagination-controls'

interface ClientsListProps {
  clients: Client[]
  limit: number
  offset: number
  hasMore: boolean
}

export function ClientsList({
  clients,
  limit,
  offset,
  hasMore,
}: ClientsListProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {clients.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No clients found.
          </div>
        ) : (
          clients.map((client) => (
            <ClientTreeItem key={client.id} client={client} />
          ))
        )}
      </div>
      <div className="border-t p-2 bg-background">
        <PaginationControls
          limit={limit}
          offset={offset}
          currentCount={clients.length}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
