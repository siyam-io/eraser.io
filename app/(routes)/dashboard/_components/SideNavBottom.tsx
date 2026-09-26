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
    { name: "Templates", icon: <Layers3 size={15} strokeWidth={1.5} />, onClick: undefined as (() => void) | undefined },
    { name: "GitHub Sync", icon: <Github size={15} strokeWidth={1.5} />, onClick: undefined as (() => void) | undefined },
    { name: "Archived files", icon: <Archive size={15} strokeWidth={1.5} />, onClick: () => setView("archived") },
  ];

  const limitReached = billing ? !billing.canCreateFile : false;
  const fileLimit = billing?.fileLimit ?? null;
  const fileCount = billing?.fileCount ?? 0;
  const percent = fileLimit ? Math.min((fileCount / fileLimit) * 100, 100) : 100;

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={limitReached} className="h-10 w-full gap-2">
            <Plus size={16} />
            <span>New File</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new file</DialogTitle>
            <DialogDescription>
              Give your new workspace file a name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. System Architecture"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
            />
          </div>
          <Button onClick={handleCreateFile} className="w-full">
            Create File
          </Button>
        </DialogContent>
      </Dialog>

      <div className="mt-2 space-y-0.5">
        {menu.map((item, i) => (
          <div
            key={i}
            onClick={item.onClick}
            className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors duration-100 ${
              item.onClick
                ? "cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                : "cursor-default text-muted-foreground opacity-60"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 border-2 border-foreground p-3.5">
        <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.15em] uppercase">
          <span>{billing?.planName ?? "Free"} plan</span>
          <span className="text-muted-foreground">
            {fileCount} / {fileLimit ?? "∞"}
          </span>
        </div>
        <Progress value={percent} className="mb-2 h-1.5 bg-border-light" />
        {limitReached ? (
          <p className="text-[11px] leading-tight font-semibold">
            File limit reached.{" "}
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="underline decoration-2 underline-offset-2"
            >
              Upgrade to Pro
            </button>
          </p>
        ) : billing?.plan === "pro" ? (
          <p className="text-[11px] leading-tight text-muted-foreground">
            Unlimited files on Pro.{" "}
            <button
              type="button"
              onClick={() => router.push("/settings/billing")}
              className="text-foreground underline underline-offset-2"
            >
              Manage billing
            </button>
          </p>
        ) : (
          <p className="text-[11px] leading-tight text-muted-foreground">
            Free plan limits active.{" "}
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="text-foreground underline underline-offset-2"
            >
              Upgrade for unlimited files
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
