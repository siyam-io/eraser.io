import React from "react";
import SideNavTop from "./SideNavTop";
import SideNavMiddle from "./SideNavMiddle";
import SideNavBottom from "./SideNavBottom";

export default function SideNav() {
  return (
    <aside className="w-full flex flex-col h-full bg-[#121212]">
      <div className="flex-shrink-0 pt-6 px-4 border-b border-zinc-800/50 pb-4">
        <SideNavTop />
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <SideNavMiddle />
      </div>
      <div className="flex-shrink-0 p-4 border-t border-zinc-800/50">
        <SideNavBottom />
      </div>
    </aside>
  );
}
