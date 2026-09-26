import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { Search, Share, Bell, Menu } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function DashboardHeader() {
  const { user } = useKindeBrowserClient()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-[68px] px-4 md:px-8 border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu placeholder */}
        <button className="md:hidden text-zinc-400 hover:text-white transition-colors">
           <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-zinc-100 hidden md:block tracking-wide">Workspace</h1>
      </div>
      
      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className="relative hidden md:flex items-center max-w-md w-full">
          <Search size={16} className="absolute left-3.5 text-zinc-500" />
          <Input 
            placeholder="Search files..." 
            className="w-full bg-zinc-900/60 border-zinc-800/80 text-sm pl-10 rounded-full focus-visible:ring-1 focus-visible:ring-blue-500/50 text-zinc-200 h-9 transition-all" 
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="text-zinc-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800">
             <Bell size={18} />
          </button>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 h-9 px-4 rounded-full transition-all">
            <Share size={14} />
            <span className="font-medium text-xs">Share</span>
          </Button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-700 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all ml-1">
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
