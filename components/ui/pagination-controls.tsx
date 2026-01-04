'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
  limit: number
  offset: number
  currentCount: number // Number of items on the current page
  hasMore?: boolean // Optional - if provided, uses this for next button. Otherwise computes from currentCount.
  className?: string
}

export function PaginationControls({
  limit,
  offset,
  currentCount,
  hasMore: hasMoreProp,
  className = '',
}: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newLimit.toString())
    params.set('offset', '0') // Reset offset when limit changes
    router.push(`?${params.toString()}`)
  }

  const handlePrevious = () => {
    const newOffset = Math.max(0, offset - limit)
    const params = new URLSearchParams(searchParams.toString())
    params.set('offset', newOffset.toString())
    router.push(`?${params.toString()}`)
  }

  const handleNext = () => {
    const newOffset = offset + limit
    const params = new URLSearchParams(searchParams.toString())
    params.set('offset', newOffset.toString())
    router.push(`?${params.toString()}`)
  }

  // Use provided hasMore or fallback to computing from currentCount
  const hasMore =
    hasMoreProp !== undefined ? hasMoreProp : currentCount >= limit

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select value={limit.toString()} onValueChange={handleLimitChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder={limit.toString()} />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevious}
          disabled={offset === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">
          {offset + 1} - {offset + currentCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNext}
          disabled={!hasMore}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </div>
    </div>
  )
}
