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

export function useTeamActions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["teams"] });
    await queryClient.invalidateQueries({ queryKey: ["files"] });
  }, [queryClient]);

  const rename = useCallback(
    async (teamId: string, teamName: string) => {
      await request(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName }),
      });
      await invalidate();
    },
    [invalidate]
  );

  const remove = useCallback(
    async (teamId: string) => {
      await request(`/api/teams/${teamId}`, { method: "DELETE" });
      await invalidate();
    },
    [invalidate]
  );

  return { rename, remove };
}
