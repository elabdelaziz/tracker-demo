'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'

export function SiteHeader() {
  const pathname = usePathname()

  const title = pathname === '/time-entries' ? 'Time Entries' : 'Clients Tree'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 w-full justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  )
}
