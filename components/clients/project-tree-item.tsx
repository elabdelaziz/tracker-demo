'use client'
import { useState, useEffect, useCallback } from 'react'
import { Project, Task } from '@/types/api'
import { getTasks } from '@/actions/clients'
import { ChevronRight, ChevronDown, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskTreeItem } from './task-tree-item'
import { Spinner } from '@/components/ui/spinner'
import { useRateLimit } from '@/components/providers/rate-limit-provider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ProjectTreeItemProps {
  project: Project
}

export function ProjectTreeItem({ project }: ProjectTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { checkRateLimit, reportRateLimit } = useRateLimit()

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedTasks = await getTasks(project.id)
      setTasks(fetchedTasks)
      setHasLoaded(true)
    } catch (error) {
      console.error('Failed to load tasks', error)
      let msg = 'Failed to load tasks'
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message)
          msg = parsed.error || error.message
        } catch {
          msg = error.message
        }
      }
      if (msg.includes('Too many requests')) {
        reportRateLimit()
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [project.id, reportRateLimit])

  const handleToggle = async () => {
    const nextOpen = !isOpen
    if (nextOpen && checkRateLimit()) {
      setIsOpen(nextOpen)
      setError('Too many requests. Waiting for cooldown...')
      return
    }
    setIsOpen(nextOpen)

    if (nextOpen && !hasLoaded) {
      await loadTasks()
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
        <div className="flex items-center gap-2 text-sm font-medium">
          <Folder className="h-4 w-4 text-blue-500" />
          {project.name}
        </div>
      </div>
      <CollapsibleContent className="pl-6 border-l ml-3 space-y-1">
        {isLoading ? (
          <div className="py-2 pl-2">
            <Spinner size="sm" />
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => <TaskTreeItem key={task.id} task={task} />)
        ) : error ? (
          <div className="py-1 text-xs text-destructive flex items-center gap-2">
            {error}
          </div>
        ) : isOpen && hasLoaded ? (
          <div className="py-1 text-xs text-muted-foreground">
            No tasks found
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
