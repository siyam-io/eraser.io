import { useKindeBrowserClient } from "@/app/hooks/useKindeBrowserClientMock";
import { useQuery } from "@tanstack/react-query";

export const useUserTeams = () => {
  const { user } = useKindeBrowserClient();

  return useQuery({
    queryKey: ["teams", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // The server derives the user from the session; no email query param needed.
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      const teams = await res.json();

      // Self-heal accounts that have no team yet (e.g. sessions started before
      // onboarding existed) so file creation is never blocked.
      if (Array.isArray(teams) && teams.length === 0) {
        await fetch("/api/onboarding", { method: "POST" });
        const retry = await fetch("/api/teams");
        if (retry.ok) return await retry.json();
      }

      return teams;
    },
  });
};
