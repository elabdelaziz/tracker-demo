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

  const allClients = await getClients({
    limit: limit + 1,
    offset,
    sortBy: 'id',
    order: 'asc',
  })

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
