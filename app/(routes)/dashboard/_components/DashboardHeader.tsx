import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { Search, Share, Bell, Menu } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function DashboardHeader() {
  const { user } = useKindeBrowserClient()

  return (
    <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between border-b-2 border-foreground bg-background/90 px-4 backdrop-blur-md md:px-8">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <div className="flex items-center gap-4">
        {/* Mobile menu placeholder */}
        <button className="text-muted-foreground transition-colors duration-100 hover:text-foreground md:hidden">
          <Menu size={20} />
        </button>
        <h1 className="hidden font-display text-lg font-bold tracking-tight md:block">
          Workspace
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative hidden w-full max-w-sm items-center md:flex">
          <Search size={15} strokeWidth={1.5} className="absolute left-0 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="h-9 w-full pl-7 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="flex size-8 items-center justify-center border-2 border-transparent text-muted-foreground transition-colors duration-100 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <Bell size={16} strokeWidth={1.5} />
          </button>
          <Button variant="outline" size="sm" className="hidden h-9 sm:flex">
            <Share size={14} />
            <span>Share</span>
          </Button>
          <div className="ml-1 size-8 cursor-pointer overflow-hidden border-2 border-foreground transition-colors duration-100 hover:bg-foreground">
            <Image
              alt="user logo"
              width={32}
              height={32}
              src={user?.picture || "/fallback.png"}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
