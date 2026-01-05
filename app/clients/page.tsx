import { getClients } from '@/actions/clients'
import { ClientsList } from '@/components/clients/clients-list'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const limit =
    typeof resolvedParams.limit === 'string'
      ? parseInt(resolvedParams.limit)
      : 10
  const offset =
    typeof resolvedParams.offset === 'string'
      ? parseInt(resolvedParams.offset)
      : 0

  const result = await getClients({
    limit: limit + 1,
    offset,
    sortBy: 'id',
    order: 'asc',
  })

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-destructive p-8">
          <p className="font-medium">Failed to load clients</p>
          <p className="text-sm text-muted-foreground mt-1">{result.error}</p>
        </div>
      </div>
    )
  }

  const allClients = result.data
  const hasMore = allClients.length > limit
  const clients = allClients.slice(0, limit)

  return (
    <ClientsList
      clients={clients}
      limit={limit}
      offset={offset}
      hasMore={hasMore}
    />
  )
}
