import { useQuery } from "@tanstack/react-query";

export type FileView = "all" | "recent" | "starred" | "archived";

export const useTeamFiles = (teamId: string | undefined, view: FileView = "all") => {
  return useQuery({
    queryKey: ["files", teamId, view],
    queryFn: async () => {
      if (!teamId) return [];
      const res = await fetch(`/api/files?teamId=${teamId}&view=${view}`);
      if (!res.ok) throw new Error("Failed to fetch files");
      return await res.json();
    },
  });
};
