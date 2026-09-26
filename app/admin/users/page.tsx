"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import moment from "moment";
import { Search, MoreHorizontal, Eye, ShieldCheck, ShieldOff, Ban, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { useAdminUsers, type AdminUser } from "@/app/hooks/useAdmin";

async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

const Select = ({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex items-center gap-2">
    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-2 border-foreground bg-background px-3 py-2 font-mono text-[11px] tracking-[0.15em] uppercase focus:outline-none"
    >
      {children}
    </select>
  </label>
);

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  // Debounce the search box so typing doesn't fire a query per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useAdminUsers({ search, role, plan, page });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin"] });

  const patchUser = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      request(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: (_d, vars) => {
      invalidate();
      const what =
        vars.patch.role !== undefined
          ? `role → ${vars.patch.role}`
          : vars.patch.banned !== undefined
            ? vars.patch.banned ? "banned" : "unbanned"
            : "updated";
      toast.success(`User ${what}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      request(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: (data) => {
      invalidate();
      setToDelete(null);
      toast.success(
        `Deleted ${data.email} · ${data.deleted.files} files · ${data.deleted.teams} teams`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-10">
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label
            htmlFor="admin-user-search"
            className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
          >
            Search users
          </label>
          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute top-1/2 left-0 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="admin-user-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="email or name…"
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Select label="Role" value={role} onChange={(v) => { setRole(v); setPage(1); }}>
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
          <Select label="Plan" value={plan} onChange={(v) => { setPlan(v); setPage(1); }}>
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </Select>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {data ? `${data.total} total` : "—"}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center border-2 border-border-light p-16 text-foreground">
            <Loader label="Loading users" />
          </div>
        ) : error ? (
          <div className="border-2 border-foreground p-8 text-center">
            <p className="font-display text-xl font-bold">Couldn’t load users</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : !data || data.users.length === 0 ? (
          <div className="border-2 border-border-light p-16 text-center">
            <p className="font-display text-2xl font-bold">No users found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search or clear the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-foreground">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-foreground font-mono text-[10px] tracking-[0.15em] text-background uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-medium">User</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Plan</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Joined</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => router.push(`/admin/users/${user._id}`)}
                    className="group cursor-pointer transition-colors duration-100 hover:bg-foreground hover:text-background"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{user.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${
                          user.role === "admin"
                            ? "border-current bg-foreground text-background group-hover:bg-background group-hover:text-foreground"
                            : "border-current"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] uppercase">
                      {user.plan}
                      {user.plan === "pro" &&
                        user.subscriptionStatus &&
                        ` · ${user.subscriptionStatus}`}
                    </td>
                    <td className="px-5 py-3.5">
                      {user.banned ? (
                        <span className="border border-current px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
                          banned
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                          active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                      {moment(user.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label={`Actions for ${user.email}`}
                            className="p-2 text-muted-foreground transition-all duration-100 group-hover:opacity-100 hover:!bg-background hover:!text-foreground focus:opacity-100 data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                          >
                            <Eye size={15} strokeWidth={1.5} /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              patchUser.mutate({
                                id: user._id,
                                patch: {
                                  role: user.role === "admin" ? "user" : "admin",
                                },
                              })
                            }
                          >
                            {user.role === "admin" ? (
                              <>
                                <ShieldOff size={15} strokeWidth={1.5} /> Demote to user
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={15} strokeWidth={1.5} /> Make admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              patchUser.mutate({
                                id: user._id,
                                patch: { banned: !user.banned },
                              })
                            }
                          >
                            <Ban size={15} strokeWidth={1.5} />
                            {user.banned ? "Unban" : "Ban user"}
                          </DropdownMenuItem>
                          <div className="mx-2 my-1.5 h-px bg-foreground" />
                          <DropdownMenuItem
                            className="cursor-pointer font-semibold"
                            onClick={() => setToDelete(user)}
                          >
                            <Trash2 size={15} strokeWidth={1.5} /> Delete…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete “{toDelete?.email}”?</DialogTitle>
            <DialogDescription>
              This permanently deletes the user together with every file and team
              they own — a GDPR-style hard delete. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              disabled={deleteUser.isPending}
              onClick={() => toDelete && deleteUser.mutate(toDelete._id)}
            >
              {deleteUser.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Delete everything"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
