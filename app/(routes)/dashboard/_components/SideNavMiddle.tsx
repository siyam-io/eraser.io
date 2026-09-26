"use client";

import { Blocks, Clock, Star, Archive } from "lucide-react";
import React, { useContext } from "react";
import { FileListContext } from "@/app/_context/FilesListContext";
import type { FileView } from "@/app/hooks/useTeamFiles";

export default function SideNavMiddle() {
  const { view, setView } = useContext(FileListContext);

  const items: { icon: React.ReactNode; label: string; value: FileView }[] = [
    { icon: <Blocks size={16} strokeWidth={1.5} />, label: "All Files", value: "all" },
    { icon: <Clock size={16} strokeWidth={1.5} />, label: "Recent", value: "recent" },
    { icon: <Star size={16} strokeWidth={1.5} />, label: "Starred", value: "starred" },
    { icon: <Archive size={16} strokeWidth={1.5} />, label: "Archived", value: "archived" },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-1">
        <div className="mb-3 px-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Workspace
        </div>
        {items.map((item) => {
          const active = view === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[15px] transition-colors duration-100 ${
                active
                  ? "bg-foreground font-medium text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
