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
      <div className="flex h-[50vh] flex-col items-center justify-center border-2 border-border-light p-8 text-center">
        <span className="mb-5 flex size-14 items-center justify-center border-2 border-foreground">
          <FileText size={22} strokeWidth={1.5} />
        </span>
        <p className="font-display text-2xl font-bold tracking-tight">
          No team selected
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose or create a team from the sidebar.
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center border-2 border-border-light p-8 text-center">
        <span className="mb-5 flex size-14 items-center justify-center border-2 border-foreground">
          <FileText size={22} strokeWidth={1.5} />
        </span>
        <p className="font-display text-2xl font-bold tracking-tight">
          No files found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new file from the sidebar to get started.
        </p>
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
      <div className="w-full overflow-hidden border-2 border-foreground">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground font-mono text-[10px] tracking-[0.15em] text-background uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="hidden px-6 py-4 font-medium md:table-cell">Created</th>
              <th className="hidden px-6 py-4 font-medium lg:table-cell">Last Edited</th>
              <th className="px-6 py-4 font-medium">Author</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {data.map((file: File) => (
              <tr
                key={file._id}
                onClick={() => router.push("workspace/" + file._id)}
                className="group cursor-pointer transition-colors duration-100 hover:bg-foreground hover:text-background"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center border-2 border-foreground transition-colors duration-100 group-hover:border-background">
                      <FileText size={16} strokeWidth={1.5} />
                    </span>
                    <span className="truncate font-medium">
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
                      className={`ml-1 transition-opacity duration-100 ${
                        file.starred
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Star size={14} strokeWidth={1.5} fill={file.starred ? "currentColor" : "none"} />
                    </button>
                  </div>
                </td>
                <td className="hidden px-6 py-4 text-muted-foreground group-hover:text-background/70 md:table-cell">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Clock size={13} strokeWidth={1.5} />
                    {moment(file.createdAt).format("MMM D, YYYY")}
                  </div>
                </td>
                <td className="hidden px-6 py-4 font-mono text-xs text-muted-foreground group-hover:text-background/70 lg:table-cell">
                  {file.editedAt ? moment(file.editedAt).fromNow() : "Never"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <Image
                      height={28}
                      width={28}
                      className="border-2 border-foreground transition-colors duration-100 group-hover:border-background"
                      src={user?.picture || "/fallback.png"}
                      alt="avatar"
                    />
                    <span className="hidden font-mono text-xs text-muted-foreground group-hover:text-background/70 sm:inline-block">
                      You
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={`Actions for ${file.fileName}`}
                        className="p-2 text-muted-foreground opacity-0 transition-all duration-100 group-hover:opacity-100 hover:!bg-background hover:!text-foreground focus:opacity-100"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={() => router.push("workspace/" + file._id)}
                        className="cursor-pointer text-sm font-medium"
                      >
                        <FileText size={15} strokeWidth={1.5} /> Open File
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFileToRename(file);
                          setRenameValue(file.fileName);
                        }}
                        className="cursor-pointer text-sm font-medium"
                      >
                        <Pencil size={15} strokeWidth={1.5} /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            () => setStarred(file._id, !file.starred),
                            file.starred ? "Removed star" : "Starred"
                          )
                        }
                        className="cursor-pointer text-sm font-medium"
                      >
                        <Star size={15} strokeWidth={1.5} fill={file.starred ? "currentColor" : "none"} />{" "}
                        {file.starred ? "Remove star" : "Add star"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          runAction(
                            () => setArchived(file._id, !file.archive),
                            file.archive ? "Restored from archive" : "Archived"
                          )
                        }
                        className="cursor-pointer text-sm font-medium"
                      >
                        {file.archive ? (
                          <ArchiveRestore size={15} strokeWidth={1.5} />
                        ) : (
                          <Archive size={15} strokeWidth={1.5} />
                        )}
                        {file.archive ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <div className="mx-2 my-1.5 h-px bg-foreground" />
                      <DropdownMenuItem
                        onClick={() => setFileToDelete(file)}
                        className="cursor-pointer text-sm font-semibold"
                      >
                        <Trash2 size={15} strokeWidth={1.5} /> Delete
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
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
            />
          </div>
          <Button
            disabled={busy || !renameValue.trim()}
            onClick={() => {
              if (!fileToRename) return;
              runAction(() => rename(fileToRename._id, renameValue.trim()), "File renamed");
              setFileToRename(null);
            }}
            className="w-full"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : "Save name"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete “{fileToDelete?.fileName}”?</DialogTitle>
            <DialogDescription>
              This permanently deletes the file and its content. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFileToDelete(null)}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                if (!fileToDelete) return;
                runAction(() => remove(fileToDelete._id), "File deleted");
                setFileToDelete(null);
              }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : "Delete file"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
