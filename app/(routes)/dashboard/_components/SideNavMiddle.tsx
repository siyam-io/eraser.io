"use client";

import { Blocks, Clock, Star, Archive } from "lucide-react";
import React, { useContext } from "react";
import { FileListContext } from "@/app/_context/FilesListContext";
import type { FileView } from "@/app/hooks/useTeamFiles";

export default function SideNavMiddle() {
  const { view, setView } = useContext(FileListContext);

  const items: { icon: React.ReactNode; label: string; value: FileView }[] = [
    { icon: <Blocks size={18} />, label: "All Files", value: "all" },
    { icon: <Clock size={18} />, label: "Recent", value: "recent" },
    { icon: <Star size={18} />, label: "Starred", value: "starred" },
    { icon: <Archive size={18} />, label: "Archived", value: "archived" },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-1.5">
        <div className="px-3 mb-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Workspace</div>
        {items.map((item) => {
          const active = view === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-left ${
                active
                  ? "bg-zinc-800/80 text-white shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
              }`}
            >
              <span className={active ? "text-blue-400" : ""}>{item.icon}</span>
              <span className="font-medium text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
