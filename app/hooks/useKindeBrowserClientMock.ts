"use client";

import { useSession } from "next-auth/react";

export const useKindeBrowserClient = () => {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user ? {
      id: (session.user as any).id || (session.user as any).sub,
      email: session.user.email,
      given_name: session.user.name,
      family_name: "",
      picture: session.user.image || "/fallback.png"
    } : null
  };
};
