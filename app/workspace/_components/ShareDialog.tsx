"use client";

import { useEffect, useState } from "react";
import { Copy, Globe, Link2, Loader2, Lock, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PublicAccess = "private" | "view" | "edit";

const OPTIONS: {
  value: PublicAccess;
  label: string;
  description: string;
  icon: typeof Lock;
  danger?: boolean;
}[] = [
  {
    value: "private",
    label: "Private",
    description: "Only your team can open it.",
    icon: Lock,
  },
  {
    value: "view",
    label: "Anyone with the link can view",
    description: "They see live changes but cannot type or draw.",
    icon: Globe,
  },
  {
    value: "edit",
    label: "Anyone with the link can edit",
    description: "The link itself becomes a write key — anyone who has it can change this file.",
    icon: Pencil,
    danger: true,
  },
];

/** Owner-only control over who can open the file by URL. */
export default function ShareDialog({ filedId }: { filedId: string }) {
  const [open, setOpen] = useState(false);
  const [publicAccess, setPublicAccess] = useState<PublicAccess>("edit");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<PublicAccess | null>(null);

  const link =
    typeof window === "undefined" ? "" : `${window.location.origin}/workspace/${filedId}`;

  // Read the current setting when the dialog opens, so the UI always reflects
  // the server rather than a stale guess.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoading(true);
    fetch(`/api/files/${filedId}/share`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.publicAccess) setPublicAccess(data.publicAccess);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, filedId]);

  const save = async (next: PublicAccess) => {
    const previous = publicAccess;
    setPublicAccess(next);
    setSaving(next);

    try {
      const res = await fetch(`/api/files/${filedId}/share`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicAccess: next }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(
        next === "private"
          ? "Sharing turned off"
          : next === "view"
            ? "Anyone with the link can now view"
            : "Anyone with the link can now edit"
      );
    } catch (error) {
      setPublicAccess(previous);
      console.error("[share] failed to update public access:", error);
      toast.error("Could not update sharing");
    } finally {
      setSaving(null);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-8 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/20 transition-all rounded-lg border border-blue-500/30">
          <Link2 size={14} />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Share this workspace</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose who can open it with the link. Your team always has access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = publicAccess === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={loading || saving !== null}
                onClick={() => save(option.value)}
                className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors disabled:opacity-60 ${
                  active
                    ? "border-blue-500/60 bg-blue-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50"
                }`}
              >
                <Icon
                  size={15}
                  className={`mt-0.5 shrink-0 ${
                    active ? "text-blue-400" : option.danger ? "text-amber-400" : "text-zinc-400"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-zinc-100">
                    {option.label}
                    {saving === option.value && (
                      <Loader2 size={12} className="animate-spin text-zinc-400" />
                    )}
                  </span>
                  <span
                    className={`mt-0.5 block text-[11px] leading-relaxed ${
                      option.danger ? "text-amber-300/80" : "text-zinc-500"
                    }`}
                  >
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-2">
          <input
            readOnly
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent px-1 font-mono text-[11px] text-zinc-400 outline-none"
          />
          <Button
            type="button"
            onClick={copyLink}
            variant="outline"
            className="h-7 shrink-0 gap-1.5 border-zinc-700/60 bg-transparent px-3 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Copy size={12} />
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
