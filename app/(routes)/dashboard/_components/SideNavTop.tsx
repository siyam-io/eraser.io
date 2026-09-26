"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserTeams } from "@/app/hooks/useUserTeams";
import { FileListContext } from "@/app/_context/FilesListContext";
import InsideHove from "./InsideHove";

export default function SideNavTop() {
  const [open, setOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const { setGetFiles } = useContext(FileListContext);
  const { data: teams = [] } = useUserTeams();

  useEffect(() => {
    if (teams.length === 0) {
      // No teams (e.g. after deleting the last one) — clear the selection.
      if (selectedTeamId) setSelectedTeamId(undefined);
      return;
    }

    // Fall back to the first team when the selected one no longer exists
    // (deleted) or nothing is selected yet.
    const stillExists = teams.some((team: any) => team._id === selectedTeamId);
    if (!stillExists) {
      setSelectedTeamId(teams[0]._id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    setGetFiles(selectedTeamId);
  }, [selectedTeamId, setGetFiles]);

  const selectedTeam = teams.find((team: any) => team._id === selectedTeamId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="group flex w-full cursor-pointer items-center justify-between border-2 border-foreground px-3 py-2.5 transition-colors duration-100 hover:bg-foreground hover:text-background">
          <div className="flex min-w-0 items-center gap-3">
            {/* Square monochrome avatar — inversion, not gradient */}
            <span className="flex size-8 shrink-0 items-center justify-center bg-foreground font-mono text-sm font-medium text-background group-hover:bg-background group-hover:text-foreground">
              {selectedTeam?.teamName?.charAt(0).toUpperCase() || "T"}
            </span>
            <span className="truncate text-[15px] font-medium">
              {selectedTeam?.teamName || "Select Team"}
            </span>
          </div>
          <div className="shrink-0">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="ml-4 mt-2 w-[260px] p-0">
        <InsideHove selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
      </PopoverContent>
    </Popover>
  );
}
