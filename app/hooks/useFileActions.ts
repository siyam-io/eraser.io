"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Request failed");
  }
  return res.json().catch(() => null);
}

export function useFileActions() {
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["files"] }),
    [queryClient]
  );

  const update = useCallback(
    async (fileId: string, patch: Record<string, unknown>) => {
      await request(`/api/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      await invalidate();
    },
    [invalidate]
  );

  const remove = useCallback(
    async (fileId: string) => {
      await request(`/api/files/${fileId}`, { method: "DELETE" });
      await invalidate();
    },
    [invalidate]
  );

  return {
    rename: (fileId: string, fileName: string) => update(fileId, { fileName }),
    setStarred: (fileId: string, starred: boolean) => update(fileId, { starred }),
    setArchived: (fileId: string, archive: boolean) => update(fileId, { archive }),
    remove,
  };
}
