"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  MoreHorizontal,
  Trash2,
  Star,
  Archive,
  ArchiveRestore,
  Pencil,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { useFileActions } from "@/app/hooks/useFileActions";
import moment from "moment";
import { toast } from "sonner";

type File = {
  _id: string;
  fileName: string;
  createdAt: string | number;
  editedAt?: string | number;
  starred?: boolean;
  archive?: boolean;
};

export default function FileTable({ getFiles, data }: any) {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const { rename, setStarred, setArchived, remove } = useFileActions();

  const [fileToRename, setFileToRename] = useState<File | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!getFiles) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <div className="w-16 h-16 mb-4 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800/50">
          <FileText size={24} className="text-zinc-600" />
        </div>
        <p className="font-medium text-lg text-zinc-300">No team selected</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <div className="w-20 h-20 mb-5 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800/50 shadow-inner">
          <FileText size={32} className="text-zinc-600" />
        </div>
        <p className="font-semibold text-xl text-zinc-300">No files found</p>
        <p className="text-[15px] mt-2 text-zinc-500">Create a new file from the sidebar to get started.</p>
      </div>
    );
  }

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    try {
      setBusy(true);
      await fn();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-zinc-800/60 bg-[#121212] overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] font-bold text-zinc-500 bg-zinc-900/40 uppercase tracking-wider border-b border-zinc-800/60">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 hidden md:table-cell">Created</th>
              <th className="px-6 py-4 hidden lg:table-cell">Last Edited</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {data.map((file: File) => (
              <tr
                key={file._id}
                onClick={() => router.push("workspace/" + file._id)}
                className="group hover:bg-zinc-800/40 transition-all cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <span className="font-semibold text-[15px] text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {file.fileName}
                    </span>
                    <button
                      type="button"
                      title={file.starred ? "Remove star" : "Star file"}
                      onClick={(e) => {
                        e.stopPropagation();
                        runAction(
                          () => setStarred(file._id, !file.starred),
                          file.starred ? "Removed star" : "Starred"
                        );
                      }}
                      className={`ml-1 p-1 rounded transition-opacity ${
                        file.starred ? "opacity-100 text-yellow-400" : "opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-yellow-400"
                      }`}
                    >
                      <Star size={15} fill={file.starred ? "currentColor" : "none"} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-500 hidden md:table-cell font-medium">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-600" />
                    {moment(file.createdAt).format("MMM D, YYYY")}
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-500 hidden lg:table-cell font-medium">
                  {file.editedAt ? moment(file.editedAt).fromNow() : "Never"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <Image
                      height={28}
                      width={28}
                      className="rounded-full border-2 border-zinc-700 shadow-sm"
                      src={user?.picture || "/fallback.png"}
                      alt="avatar"
                    />
                    <span className="text-zinc-400 font-medium text-xs hidden sm:inline-block">You</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors focus:outline-none opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-[#1A1A1A] border-zinc-800 shadow-2xl rounded-xl p-1.5">
                      <DropdownMenuItem
                        onClick={() => router.push("workspace/" + file._id)}
                        className="text-zinc-300 hover:text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white cursor-pointer rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <FileText size={16} /> Open File
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFileToRename(file);
                          setRenameValue(file.fileName);
                        }}
                        className="text-zinc-300 hover:text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white cursor-pointer rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Pencil size={16} /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            () => setStarred(file._id, !file.starred),
                            file.starred ? "Removed star" : "Starred"
                          )
                        }
                        className="text-zinc-300 hover:text-white hover:bg-yellow-600 focus:bg-yellow-600 focus:text-white cursor-pointer rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Star size={16} fill={file.starred ? "currentColor" : "none"} />{" "}
                        {file.starred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            () => setArchived(file._id, !file.archive),
                            file.archive ? "Restored from archive" : "Archived"
                          )
                        }
                        className="text-zinc-300 hover:text-white hover:bg-blue-600 focus:bg-blue-600 focus:text-white cursor-pointer rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        {file.archive ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        {file.archive ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <div className="h-px bg-zinc-800 my-1.5 mx-2" />
                      <DropdownMenuItem
                        onClick={() => setFileToDelete(file)}
                        className="text-red-400 hover:text-white hover:bg-red-600 focus:bg-red-600 focus:text-white cursor-pointer rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rename dialog */}
      <Dialog open={!!fileToRename} onOpenChange={(open) => !open && setFileToRename(null)}>
        <DialogContent className="bg-[#121212] border border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Rename file</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Give this file a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && fileToRename && renameValue.trim()) {
                  runAction(() => rename(fileToRename._id, renameValue.trim()), "File renamed");
                  setFileToRename(null);
                }
              }}
              className="bg-zinc-900 border-zinc-700 focus-visible:ring-blue-500 text-white"
            />
          </div>
          <Button
            disabled={busy || !renameValue.trim()}
            onClick={() => {
              if (!fileToRename) return;
              runAction(() => rename(fileToRename._id, renameValue.trim()), "File renamed");
              setFileToRename(null);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : "Save name"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent className="bg-[#121212] border border-zinc-800 text-white sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete “{fileToDelete?.fileName}”?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This permanently deletes the file and its content. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
              className="bg-transparent border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                if (!fileToDelete) return;
                runAction(() => remove(fileToDelete._id), "File deleted");
                setFileToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : "Delete file"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
