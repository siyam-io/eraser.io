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

  if (isLoading)
    return (
      <div className="p-4 text-foreground">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-col text-sm">
      <div className="max-h-[220px] space-y-0.5 overflow-y-auto p-2">
        <div className="px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Your Teams
        </div>

        {teamList?.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-muted-foreground">No teams yet.</p>
        )}

        {teamList?.map((team: Team) => (
          <div
            key={team._id}
            className={`group flex items-center justify-between gap-2 px-3 py-2 transition-colors duration-100 ${
              selectedTeamId === team._id
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            }`}
          >
            {editingId === team._id ? (
              <div className="flex w-full items-center gap-2">
                <Input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 text-[13px]"
                />
                <Button size="sm" onClick={saveEdit} disabled={busy} className="h-7 px-2">
                  {busy ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedTeamId(team._id)}
                  className="flex flex-1 truncate items-center gap-2 text-left"
                >
                  <span className="truncate">{team.teamName}</span>
                  {selectedTeamId === team._id && <Check size={14} className="shrink-0" />}
                </button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                  <button
                    type="button"
                    title="Rename team"
                    onClick={() => startEdit(team)}
                    className="p-1 hover:bg-background hover:text-foreground"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    title="Delete team"
                    onClick={() => setTeamToDelete(team)}
                    className="p-1 hover:bg-background hover:text-foreground"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-0.5 p-2">
        <div
          onClick={() => router.push("/teams/create")}
          className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-100 hover:bg-muted hover:text-foreground"
        >
          <UserPlus2 size={15} strokeWidth={1.5} />
          <span className="text-[13px] font-medium">Join or Create Team</span>
        </div>
        <div
          onClick={() => router.push("/settings/billing")}
          className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-100 hover:bg-muted hover:text-foreground"
        >
          <Settings size={15} strokeWidth={1.5} />
          <span className="text-[13px] font-medium">Billing &amp; Settings</span>
        </div>
      </div>

      <Separator />

      <div className="bg-muted p-3">
        <div className="mb-4 flex items-center gap-3">
          <Image
            className="border-2 border-foreground"
            alt="user logo"
            height={32}
            width={32}
            src={user?.picture || "/fallback.png"}
          />
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.given_name}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <div onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer">
          <div className="flex items-center gap-2 px-1 text-[13px] font-medium text-muted-foreground transition-colors duration-100 hover:text-foreground hover:underline">
            <LogOutIcon size={14} strokeWidth={1.5} />
            <span>Log out</span>
          </div>
        </div>
      </div>

      <Dialog open={!!teamToDelete} onOpenChange={(open) => !open && setTeamToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete “{teamToDelete?.teamName}”?</DialogTitle>
            <DialogDescription>
              This permanently deletes the team and <strong className="text-foreground underline decoration-2 underline-offset-2">all of its files</strong>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTeamToDelete(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : "Delete team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
