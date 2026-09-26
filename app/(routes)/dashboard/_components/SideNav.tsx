import React from "react";
import SideNavTop from "./SideNavTop";
import SideNavMiddle from "./SideNavMiddle";
import SideNavBottom from "./SideNavBottom";

export default function SideNav() {
  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex-shrink-0 border-b-2 border-foreground px-4 pt-6 pb-4">
        <SideNavTop />
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        <SideNavMiddle />
      </div>
      <div className="flex-shrink-0 border-t-2 border-foreground p-4">
        <SideNavBottom />
      </div>
    </aside>
  );
}
