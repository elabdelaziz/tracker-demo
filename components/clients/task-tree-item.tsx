import { Task } from '@/types/api'
import { FileText } from 'lucide-react'

interface TaskTreeItemProps {
  task: Task
}

export function TaskTreeItem({ task }: TaskTreeItemProps) {
  return (
    <div className="flex items-center gap-2 py-1 pl-4 text-sm text-muted-foreground">
      <FileText className="h-4 w-4" />
      <span>{task.name}</span>
    </div>
  )
}
