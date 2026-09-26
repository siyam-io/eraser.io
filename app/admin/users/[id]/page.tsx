"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import moment from "moment";
import {
  ArrowLeft,
  Trash2,
  Ban,
  ShieldCheck,
  ShieldOff,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { useAdminUser } from "@/app/hooks/useAdmin";

async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-2 border-foreground">
      <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-3.5">
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useAdminUser(id);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setRole(data.user.role);
    }
  }, [data?.user]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const saveProfile = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      request(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("User updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeUser = useMutation({
    mutationFn: () => request(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: (res) => {
      invalidate();
      toast.success(`Deleted ${res.email}`);
      router.push("/admin/users");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16 text-foreground">
        <Loader label="Loading user" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <div className="border-2 border-foreground p-8 text-center">
          <p className="font-display text-2xl font-bold">
            {error instanceof Error && /not found/i.test(error.message)
              ? "User not found"
              : "Couldn’t load user"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Link
            href="/admin/users"
            className="mt-6 inline-block border-2 border-foreground bg-foreground px-6 py-3 font-mono text-xs tracking-widest text-background uppercase transition-colors duration-100 hover:bg-background hover:text-foreground"
          >
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const { user, teams, fileStats, recentFiles, isSelf } = data;

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-10">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase transition-colors duration-100 hover:text-foreground"
      >
        <ArrowLeft size={13} strokeWidth={1.5} /> All users
      </Link>

      {/* Identity header */}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6 border-b-4 border-foreground pb-6">
        <div>
          <h1 className="font-display text-5xl leading-none font-black tracking-tighter md:text-6xl">
            {user.name}
          </h1>
          <p className="mt-3 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span
            className={`border-2 border-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase ${
              user.role === "admin" ? "bg-foreground text-background" : ""
            }`}
          >
            {user.role}
          </span>
          <span className="border-2 border-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            {user.plan}
          </span>
          {user.banned && (
            <span className="border-2 border-foreground bg-foreground px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-background uppercase">
              banned
            </span>
          )}
          <span className="border-2 border-border-light px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            joined {moment(user.createdAt).format("MMM D, YYYY")}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Usage */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Teams", value: teams.length },
              { label: "Files", value: fileStats.total },
              { label: "Active", value: fileStats.active },
              { label: "Archived", value: fileStats.archived },
            ].map((stat) => (
              <div key={stat.label} className="border-2 border-foreground p-4">
                <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
                  {stat.label}
                </div>
                <div className="mt-2 font-display text-3xl leading-none font-black tracking-tight">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <Panel title="Subscription">
            {user.stripeCustomerId ? (
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-border-light pb-2">
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Status
                  </dt>
                  <dd className="font-medium">
                    {user.subscriptionStatus ?? "none"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border-light pb-2">
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Renews
                  </dt>
                  <dd className="font-medium">
                    {user.currentPeriodEnd
                      ? moment(user.currentPeriodEnd).format("MMM D, YYYY")
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border-light pb-2 sm:col-span-2">
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Stripe customer
                  </dt>
                  <dd className="font-mono text-[11px]">{user.stripeCustomerId}</dd>
                </div>
                <div className="sm:col-span-2">
                  <a
                    href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
                  >
                    Open in Stripe <ExternalLink size={12} strokeWidth={1.5} />
                  </a>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No Stripe customer — this user has never checked out.
              </p>
            )}
          </Panel>

          <Panel title="Teams">
            {teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams yet.</p>
            ) : (
              <ul className="divide-y divide-border-light">
                {teams.map((team) => (
                  <li
                    key={team._id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-medium">{team.teamName}</span>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                      {moment(team.createdAt).format("MMM D, YYYY")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent files">
            {recentFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files yet.</p>
            ) : (
              <ul className="divide-y divide-border-light">
                {recentFiles.map((file) => (
                  <li
                    key={file._id}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <span className="truncate text-sm font-medium">
                      {file.fileName}
                    </span>
                    <span className="flex shrink-0 items-center gap-3 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                      {file.starred && <span>★ starred</span>}
                      {file.archive && <span>archived</span>}
                      {moment(file.editedAt ?? file.createdAt).fromNow()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Right column — access controls */}
        <div className="space-y-6">
          <Panel title="Access">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="admin-user-name"
                  className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
                >
                  Display name
                </label>
                <div className="flex gap-3">
                  <Input
                    id="admin-user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    disabled={saveProfile.isPending || name.trim() === user.name}
                    onClick={() => saveProfile.mutate({ name: name.trim() })}
                  >
                    {saveProfile.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-user-role"
                  className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
                >
                  Role
                </label>
                <div className="flex gap-3">
                  <select
                    id="admin-user-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    disabled={isSelf}
                    className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono text-[11px] tracking-[0.15em] uppercase focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <Button
                    variant="outline"
                    disabled={isSelf || saveProfile.isPending || role === user.role}
                    onClick={() => saveProfile.mutate({ role })}
                  >
                    {role === "admin" ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <ShieldOff size={14} />
                    )}
                    Apply
                  </Button>
                </div>
                {isSelf && (
                  <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                    You can’t change your own access
                  </p>
                )}
              </div>

              <div className="border-t border-border-light pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isSelf || saveProfile.isPending}
                  onClick={() => saveProfile.mutate({ banned: !user.banned })}
                >
                  <Ban size={14} />
                  {user.banned ? "Unban user" : "Ban user"}
                </Button>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Banned users are signed out of the API immediately and can no
                  longer log in.
                </p>
              </div>

              <div className="border-t border-border-light pt-4">
                <Button
                  className="w-full"
                  disabled={isSelf || removeUser.isPending}
                  onClick={() => setConfirmDelete(true)}
                >
                  {removeUser.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete user
                </Button>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Removes the account plus {fileStats.total} files and{" "}
                  {teams.length} teams. Permanent.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete {user.email}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the account, {fileStats.total} files, and{" "}
              {teams.length} teams. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              disabled={removeUser.isPending}
              onClick={() => removeUser.mutate()}
            >
              {removeUser.isPending ? (
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
