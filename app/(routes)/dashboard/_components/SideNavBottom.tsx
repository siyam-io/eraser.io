"use client";

import { Github, Layers3, Plus, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { FileListContext } from "@/app/_context/FilesListContext";
import { useBillingStatus } from "@/app/hooks/useBillingStatus";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function SideNavBottom() {
  const [fileName, setFileName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { getFiles, setView } = useContext(FileListContext);
  const { data: billing } = useBillingStatus();
  const queryClient = useQueryClient();
  const router = useRouter();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
    queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
  };

  const handleCreateFile = async () => {
    if (!fileName.trim()) return;

    // Never fail silently: guide the user instead of doing nothing.
    if (!getFiles) {
      toast.error("Select a team before creating a file");
      setIsOpen(false);
      router.push("/teams/create");
      return;
    }

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName.trim(), teamId: getFiles }),
      });

      if (res.ok) {
        toast.success("File created successfully!");
        setIsOpen(false);
        setFileName("");
        refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to create file");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const menu = [
    { name: "Templates", icon: <Layers3 size={16} />, onClick: undefined as (() => void) | undefined },
    { name: "GitHub Sync", icon: <Github size={16} />, onClick: undefined as (() => void) | undefined },
    { name: "Archived files", icon: <Archive size={16} />, onClick: () => setView("archived") },
  ];

  const limitReached = billing ? !billing.canCreateFile : false;
  const fileLimit = billing?.fileLimit ?? null;
  const fileCount = billing?.fileCount ?? 0;
  const percent = fileLimit ? Math.min((fileCount / fileLimit) * 100, 100) : 100;

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={limitReached}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all rounded-lg h-10 gap-2 font-medium"
          >
            <Plus size={18} />
            <span>New File</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#121212] border border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Create a new file</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Give your new workspace file a name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. System Architecture"
              className="bg-zinc-900 border-zinc-700 focus-visible:ring-blue-500 text-white"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
            />
          </div>
          <Button onClick={handleCreateFile} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Create File
          </Button>
        </DialogContent>
      </Dialog>

      <div className="space-y-1 mt-2">
        {menu.map((item, i) => (
          <div
            key={i}
            onClick={item.onClick}
            className={`flex items-center gap-3 px-2 py-2 text-[13px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors rounded-md ${
              item.onClick ? "cursor-pointer hover:bg-zinc-800/50" : "cursor-default opacity-60"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3.5 mt-2">
        <div className="flex items-center justify-between mb-2.5 text-xs font-semibold">
          <span className="text-zinc-300">{billing?.planName ?? "Free"} plan</span>
          <span className="text-zinc-500">
            {fileCount} / {fileLimit ?? "∞"}
          </span>
        </div>
        <Progress value={percent} className="h-1.5 bg-zinc-800 [&>div]:bg-blue-500 mb-2" />
        {limitReached ? (
          <p className="text-[11px] text-red-400 font-medium leading-tight">
            File limit reached.{" "}
            <button type="button" onClick={() => router.push("/pricing")} className="underline hover:text-red-300">
              Upgrade to Pro
            </button>
          </p>
        ) : billing?.plan === "pro" ? (
          <p className="text-[11px] text-zinc-500 leading-tight">
            Unlimited files on Pro.{" "}
            <button type="button" onClick={() => router.push("/settings/billing")} className="underline hover:text-zinc-300">
              Manage billing
            </button>
          </p>
        ) : (
          <p className="text-[11px] text-zinc-500 leading-tight">
            Free plan limits active.{" "}
            <button type="button" onClick={() => router.push("/pricing")} className="underline hover:text-zinc-300">
              Upgrade for unlimited files
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
