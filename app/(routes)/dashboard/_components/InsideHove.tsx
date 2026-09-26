"use client";

import { useUserTeams } from "@/app/hooks/useUserTeams";
import { useTeamActions } from "@/app/hooks/useTeamActions";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react";
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOutIcon, Settings, UserPlus2, Check, Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Loader from "./Loader";

type Team = { _id: string; teamName: string };

export default function InsideHove({ selectedTeamId, setSelectedTeamId }: any) {
  const { user } = useKindeBrowserClient();
  const { data: teamList, isLoading } = useUserTeams();
  const { rename, remove } = useTeamActions();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [busy, setBusy] = useState(false);

  const startEdit = (team: Team) => {
    setEditingId(team._id);
    setEditName(team.teamName);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      setBusy(true);
      await rename(editingId, editName.trim());
      toast.success("Team renamed");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename team");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;
    try {
      setBusy(true);
      await remove(teamToDelete._id);
      if (selectedTeamId === teamToDelete._id) {
        setSelectedTeamId(undefined);
      }
      toast.success("Team and its files deleted");
      setTeamToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete team");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <div className="p-4"><Loader /></div>;

  return (
    <div className="flex flex-col text-sm">
      <div className="p-2 space-y-1 max-h-[220px] overflow-y-auto">
        <div className="px-2 py-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Your Teams</div>

        {teamList?.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-zinc-500">No teams yet.</p>
        )}

        {teamList?.map((team: Team) => (
          <div
            key={team._id}
            className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
              selectedTeamId === team._id ? "bg-blue-600/10 text-blue-400" : "hover:bg-zinc-800 text-zinc-300"
            }`}
          >
            {editingId === team._id ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 bg-zinc-900 border-zinc-700 text-white text-[13px]"
                />
                <Button size="sm" onClick={saveEdit} disabled={busy} className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {busy ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedTeamId(team._id)}
                  className="flex items-center gap-2 truncate flex-1 text-left"
                >
                  <span className="truncate">{team.teamName}</span>
                  {selectedTeamId === team._id && <Check size={14} className="shrink-0" />}
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title="Rename team"
                    onClick={() => startEdit(team)}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    title="Delete team"
                    onClick={() => setTeamToDelete(team)}
                    className="p-1 rounded hover:bg-red-600/80 text-zinc-400 hover:text-white"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-800/50" />

      <div className="p-2 space-y-1">
        <div
          onClick={() => router.push("/teams/create")}
          className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <UserPlus2 size={16} />
          <span className="font-medium text-[13px]">Join or Create Team</span>
        </div>
        <div
          onClick={() => router.push("/settings/billing")}
          className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
        >
          <Settings size={16} />
          <span className="font-medium text-[13px]">Billing &amp; Settings</span>
        </div>
      </div>

      <Separator className="bg-zinc-800/50" />

      <div className="p-3 bg-zinc-900/50 rounded-b-xl">
        <div className="flex items-center gap-3 mb-4">
          <Image
            className="rounded-full border border-zinc-700 shadow-sm"
            alt="user logo"
            height={32}
            width={32}
            src={user?.picture || "/fallback.png"}
          />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-zinc-100 truncate">{user?.given_name}</p>
            <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors text-[13px] font-medium px-1">
            <LogOutIcon size={14} />
            <span>Log out</span>
          </div>
        </div>
      </div>

      <Dialog open={!!teamToDelete} onOpenChange={(open) => !open && setTeamToDelete(null)}>
        <DialogContent className="bg-[#121212] border border-zinc-800 text-white sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete “{teamToDelete?.teamName}”?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This permanently deletes the team and <strong className="text-red-400">all of its files</strong>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTeamToDelete(null)} className="bg-transparent border-zinc-700 text-zinc-300">
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
              {busy ? <Loader2 size={14} className="animate-spin" /> : "Delete team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
