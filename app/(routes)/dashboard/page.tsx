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
    <div className="relative flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-6 md:p-10">
        <div className="mb-10 mt-4">
          <div className="flex items-center gap-4">
            <span className="h-1 w-10 bg-foreground" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {VIEW_TITLES[view] ?? "Files"}
            </span>
          </div>
          <h2 className="mt-5 font-display text-4xl leading-tight font-black tracking-tighter md:text-5xl">
            Welcome back
            {user?.given_name ? (
              <>
                , <span className="font-normal italic">{user.given_name}</span>
              </>
            ) : null}
          </h2>
          <p className="mt-3 text-muted-foreground">
            Manage your system designs and whiteboards.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center text-foreground">
            <Loader />
          </div>
        ) : (
          <FileTable getFiles={getFiles} data={data} />
        )}
      </main>
    </div>
  );
}
