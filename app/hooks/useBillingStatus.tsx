"use client";

import { useQuery } from "@tanstack/react-query";

export type BillingStatus = {
  plan: string;
  planName: string;
  status: string | null;
  fileCount: number;
  fileLimit: number | null;
  canCreateFile: boolean;
};

export const useBillingStatus = () => {
  return useQuery({
    queryKey: ["billing", "status"],
    queryFn: async (): Promise<BillingStatus> => {
      const res = await fetch("/api/billing/status");
      if (!res.ok) throw new Error("Failed to load billing status");
      return await res.json();
    },
  });
};
