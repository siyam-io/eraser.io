import { Button } from '@/components/ui/button'
import { ChevronLeft, Folder, Save, Share, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import React from 'react'
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";

export default function WorkspaceHeader({ setcommandToSave, fileName }: any) {
  const router = useRouter()
  const { user } = useKindeBrowserClient()

  return (
    <header className="flex items-center justify-between h-[60px] w-full px-5 border-b border-zinc-800/80 bg-[#0a0a0a]/95 backdrop-blur-md text-white shadow-sm z-50 relative">
      <div className="flex items-center gap-5">
        {/* Logo / Back */}
        <div 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="flex -space-x-2.5 mix-blend-screen opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 rounded-full bg-[#D02020]" />
            <div className="w-5 h-5 bg-[#1040C0]" />
            <div className="w-5 h-5 bg-[#F0C020] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          </div>
        </div>

        <div className="h-5 w-[1px] bg-zinc-700/80 rounded-full" />
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] font-medium tracking-wide">
          <div className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-800/50" onClick={() => router.push('/dashboard')}>
            <Folder size={14} />
            <span>Workspace</span>
          </div>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800/40 rounded-md border border-zinc-700/50 text-zinc-200">
            <span className="truncate max-w-[200px]">{fileName || "Untitled Document"}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Saved to cloud" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Active Users */}
        <div className="hidden sm:flex items-center -space-x-2.5 mr-2" title="Active collaborators">
          <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] overflow-hidden shadow-sm relative z-20 hover:z-50 hover:scale-110 transition-transform cursor-pointer">
            <Image src={user?.picture || "/fallback.png"} alt="user" width={28} height={28} className="object-cover" />
          </div>
          <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white z-10 shadow-sm relative hover:z-50 hover:scale-110 transition-transform cursor-pointer">
            +2
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setcommandToSave(true)}
            variant="outline"
            className="h-8 px-4 text-xs font-semibold bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white gap-2 transition-all border-zinc-700/60 rounded-lg"
          >
            <Save size={14} className="text-zinc-400" />
            Save
          </Button>
          <Button className="h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/20 transition-all rounded-lg border border-blue-500/30">
            <Share size={14} />
            Share
          </Button>
        </div>
      </div>
    </header>
  )
}
