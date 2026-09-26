"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

/* ------------------------------------------------------------------ types */

export type AdminStats = {
  totalUsers: number;
  proUsers: number;
  totalFiles: number;
  bannedUsers: number;
  mrrCents: number | null;
  currency: string;
  stripeConnected: boolean;
  growth: { month: string; count: number }[];
  revenue: { month: string; cents: number }[];
  activity: {
    type: "signup" | "subscription";
    email: string;
    name: string;
    detail: string;
    at: string;
  }[];
};

export type AdminUsersPage = {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin";
  banned?: boolean;
  plan: "free" | "pro";
  subscriptionStatus?: string | null;
  createdAt: string;
};

export type AdminUserDetail = {
  user: AdminUser & {
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: string | null;
    updatedAt: string;
  };
  teams: { _id: string; teamName: string; createdAt: string }[];
  fileStats: { total: number; active: number; archived: number };
  recentFiles: {
    _id: string;
    fileName: string;
    createdAt: string;
    editedAt?: string | null;
    archive?: boolean;
    starred?: boolean;
  }[];
  isSelf: boolean;
};

export type AdminSubscriptionRow = {
  userId: string;
  name: string;
  email: string;
  banned: boolean;
  plan: string;
  dbStatus: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeStatus: string | null;
  priceLabel: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
  invoiceUrl: string | null;
};

export type AdminSubscriptions = {
  rows: AdminSubscriptionRow[];
  summary: { total: number; active: number; canceled: number; pastDue: number };
  stripeConnected: boolean;
};

export type AdminSettingsResponse = {
  settings: { allowSignups: boolean; maintenance: boolean };
  environment: {
    stripe: boolean;
    googleOAuth: boolean;
    mongodb: boolean;
    nodeEnv: string;
    userCount: number;
    adminCount: number;
  };
};

/* ------------------------------------------------------------------ hooks */

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => getJson<AdminStats>("/api/admin/stats"),
    refetchInterval: 60_000,
  });

export type UsersQuery = {
  search: string;
  role: string;
  plan: string;
  page: number;
};

export const useAdminUsers = ({ search, role, plan, page }: UsersQuery) =>
  useQuery({
    queryKey: ["admin", "users", { search, role, plan, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        search,
        role,
        plan,
        page: String(page),
        pageSize: "10",
      });
      return getJson<AdminUsersPage>(`/api/admin/users?${params.toString()}`);
    },
    placeholderData: keepPreviousData,
  });

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => getJson<AdminUserDetail>(`/api/admin/users/${id}`),
    enabled: Boolean(id),
  });

export const useAdminSubscriptions = () =>
  useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => getJson<AdminSubscriptions>("/api/admin/subscriptions"),
  });

export const useAdminSettings = () =>
  useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => getJson<AdminSettingsResponse>("/api/admin/settings"),
  });
