'use client'
import { useState, useEffect } from 'react'
import { Client, Project } from '@/types/api'
import { getProjects } from '@/actions/clients'
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectTreeItem } from './project-tree-item'
import { Spinner } from '@/components/ui/spinner'
import { useRateLimit } from '@/components/providers/rate-limit-provider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ClientTreeItemProps {
  client: Client
}

export function ClientTreeItem({ client }: ClientTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { checkRateLimit, reportRateLimit } = useRateLimit()

  const loadProjects = async () => {
    setIsLoading(true)
    setError(null)

    const result = await getProjects(client.id)

    if (!result.success) {
      console.error('Failed to load projects', result.error)
      if (result.error.includes('Too many requests')) {
        reportRateLimit()
      }
      setError(result.error)
    } else {
      setProjects(result.data)
      setHasLoaded(true)
    }

    setIsLoading(false)
  }

  const handleToggle = async () => {
    const nextOpen = !isOpen
    if (nextOpen && checkRateLimit()) {
      setIsOpen(nextOpen)
      setError('Too many requests. Waiting for cooldown...')
      return
    }
    setIsOpen(nextOpen)

    if (nextOpen && !hasLoaded) {
      await loadProjects()
    }
  }

  // Auto-close entries opened during rate limit after 5 seconds
  useEffect(() => {
    if (isOpen && error?.includes('Too many requests')) {
      const timeout = setTimeout(() => {
        setIsOpen(false)
        setError(null)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [isOpen, error])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center space-x-2 py-1">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-emerald-500" />
          {client.name}
        </div>
      </div>
      <CollapsibleContent className="pl-6 border-l ml-3 space-y-1">
        {isLoading ? (
          <div className="py-2 pl-2">
            <Spinner size="sm" />
          </div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectTreeItem key={project.id} project={project} />
          ))
        ) : error ? (
          <div className="py-1 text-xs text-destructive flex items-center gap-2">
            {error}
          </div>
        ) : isOpen && hasLoaded ? (
          <div className="py-1 text-xs text-muted-foreground">
            No projects found
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
