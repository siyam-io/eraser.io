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
      <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
        {/* Sidebar */}
        <div className="hidden border-r-2 border-foreground bg-background md:flex md:w-[280px] md:flex-col">
          <SideNav />
        </div>
        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div id="main" className="relative flex-1 overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
    </FileListContext.Provider>
  );
}
