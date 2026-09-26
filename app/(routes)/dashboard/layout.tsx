"use client";

import { FileListContext } from "@/app/_context/FilesListContext";
import type { FileView } from "@/app/hooks/useTeamFiles";
import { useState } from "react";
import SideNav from "./_components/SideNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [getFiles, setGetFiles] = useState<string | undefined>();
  const [view, setView] = useState<FileView>("all");

  return (
    <FileListContext.Provider value={{ getFiles, setGetFiles, view, setView }}>
      <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-[280px] md:flex-col border-r border-zinc-800/50 bg-[#121212]">
          <SideNav />
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto bg-[#0a0a0a] relative">
            {children}
          </main>
        </div>
      </div>
    </FileListContext.Provider>
  );
}
