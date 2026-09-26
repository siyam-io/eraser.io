"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { useAdminSettings } from "@/app/hooks/useAdmin";

async function put(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

function Toggle({
  label,
  description,
  value,
  pending,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  pending?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border-light py-5 last:border-b-0">
      <div className="max-w-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={pending}
        onClick={() => onChange(!value)}
        className={`flex shrink-0 items-center gap-2 border-2 border-foreground px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 disabled:opacity-50 ${value
            ? "bg-foreground text-background"
            : "bg-background text-foreground hover:bg-foreground hover:text-background"
          }`}
      >
        {pending && <Loader2 size={12} className="animate-spin" />}
        {value ? "On" : "Off"}
      </button>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2.5 border-2 border-foreground ${ok ? "bg-foreground" : "bg-background"
        }`}
    />
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useAdminSettings();

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) => put(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16 text-foreground">
        <Loader label="Loading settings" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <div className="border-2 border-foreground p-8 text-center">
          <p className="font-display text-2xl font-bold">Couldn’t load settings</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const { settings, environment } = data;

  return (
    <div className="mx-auto w-full max-w-4xl p-6 md:p-10">
      <div className="border-b-4 border-foreground pb-6">
        <div className="flex items-center gap-4">
          <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Platform
          </span>
        </div>
        <h2 className="mt-5 font-display text-4xl leading-none font-black tracking-tighter md:text-5xl">
          Global settings
        </h2>
      </div>

      {/* Controls */}
      <section className="mt-8 border-2 border-foreground">
        <div className="border-b-2 border-foreground px-5 py-3.5">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Access &amp; availability
          </h3>
        </div>
        <div className="px-5">
          <Toggle
            label="Allow new signups"
            description="When off, registration is rejected and only existing accounts can sign in."
            value={settings.allowSignups}
            pending={save.isPending}
            onChange={(next) => save.mutate({ allowSignups: next })}
          />
          <Toggle
            label="Maintenance mode"
            description="Blocks every sign-in except administrator accounts, so the platform can never lock its operators out."
            value={settings.maintenance}
            pending={save.isPending}
            onChange={(next) => save.mutate({ maintenance: next })}
          />
        </div>
        {settings.maintenance && (
          <div className="border-t-2 border-foreground bg-foreground px-5 py-3 text-background">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase">
              Maintenance is ON — non-admin sign-ins are being rejected
            </p>
          </div>
        )}
      </section>

      {/* Environment */}
      <section className="mt-8 border-2 border-foreground">
        <div className="border-b-2 border-foreground px-5 py-3.5">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Environment status
          </h3>
        </div>
        <ul className="px-5">
          {[
            {
              label: "Stripe (payments)",
              ok: environment.stripe,
              hint: "STRIPE_SECRET_KEY",
            },
            {
              label: "Google OAuth",
              ok: environment.googleOAuth,
              hint: "GOOGLE_CLIENT_ID / SECRET",
            },
            {
              label: "MongoDB",
              ok: environment.mongodb,
              hint: "MONGODB_URI",
            },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between border-b border-border-light py-3.5 last:border-b-0"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <StatusDot ok={row.ok} />
                {row.label}
              </span>
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                {row.ok ? "configured" : `missing · ${row.hint}`}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between border-b border-border-light py-3.5 last:border-b-0">
            <span className="text-sm font-medium">Runtime</span>
            <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              {environment.nodeEnv}
            </span>
          </li>
          <li className="flex items-center justify-between py-3.5">
            <span className="text-sm font-medium">Accounts</span>
            <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              {environment.userCount} users · {environment.adminCount} admins
            </span>
          </li>
        </ul>
      </section>

    </div>
  );
}
