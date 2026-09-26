"use client";

import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import React, { useContext } from "react";
import DashboardHeader from "./_components/DashboardHeader";
import FileTable from "./_components/FileTable";
import { useTeamFiles } from "@/app/hooks/useTeamFiles";
import { FileListContext } from "@/app/_context/FilesListContext";
import Loader from "./_components/Loader";

const VIEW_TITLES: Record<string, string> = {
  all: "All Files",
  recent: "Recent",
  starred: "Starred",
  archived: "Archived",
};

export default function Dashboard() {
  const { user }: any = useKindeBrowserClient();
  const { getFiles, view } = useContext(FileListContext);
  const { data = [], isLoading } = useTeamFiles(getFiles, view);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background gradients for ultra-premium feel */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-900/15 via-blue-900/5 to-transparent pointer-events-none" />

      <DashboardHeader />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-10 mt-4">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back{user?.given_name ? `, ${user.given_name}` : ""}
          </h2>
          <p className="text-zinc-400 text-lg">
            {VIEW_TITLES[view] ?? "Files"} · manage your system designs and whiteboards.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center"><Loader /></div>
        ) : (
          <FileTable getFiles={getFiles} data={data} />
        )}
      </main>
    </div>
  );
}
