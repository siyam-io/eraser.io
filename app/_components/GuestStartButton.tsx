"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  label?: string;
  loadingLabel?: string;
  className?: string;
  showArrow?: boolean;
};

/**
 * Opens an anonymous workspace without an account.
 *
 * Uses POST /api/guest/files to provision or retrieve a guest workspace,
 * sets the HTTP-only cookie, and transitions to the workspace instantly.
 */
export default function GuestStartButton({
  label = "Try it without an account",
  loadingLabel = "Opening…",
  className = "inline-flex items-center gap-3 border-2 border-background bg-transparent px-8 py-4 font-mono text-xs font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-background hover:text-foreground disabled:opacity-60",
  showArrow = true,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const start = async () => {
    if (pending) return;
    setPending(true);

    try {
      const res = await fetch("/api/guest/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not start a guest workspace");
      }

      window.location.href = `/workspace/${data.fileId}`;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={start}
      disabled={pending}
      className={className}
    >
      {pending ? loadingLabel : label}
      {showArrow && <span aria-hidden="true">→</span>}
    </button>
  );
}
