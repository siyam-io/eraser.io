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
        <div className="flex items-center justify-between w-full cursor-pointer bg-zinc-800/40 hover:bg-zinc-800/80 transition-all px-4 py-3 rounded-xl border border-zinc-700/50 shadow-sm group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {selectedTeam?.teamName?.charAt(0).toUpperCase() || "T"}
            </div>
            <span className="font-semibold text-[15px] truncate text-zinc-100 group-hover:text-white transition-colors">
              {selectedTeam?.teamName || "Select Team"}
            </span>
          </div>
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 bg-[#1A1A1A] border-zinc-800 shadow-2xl rounded-xl ml-4 mt-2">
        <InsideHove selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
      </PopoverContent>
    </Popover>
  );
}
