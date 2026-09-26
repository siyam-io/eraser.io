"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import moment from "moment";
import { Loader2, ExternalLink, Eye, Ban, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import {
  useAdminSubscriptions,
  type AdminSubscriptionRow,
} from "@/app/hooks/useAdmin";

async function post(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const statusOf = (row: AdminSubscriptionRow) =>
  row.stripeStatus ?? row.dbStatus ?? "none";

const isActive = (s: string) => s === "active" || s === "trialing";

const FILTERS = ["all", "active", "canceled", "past due", "none"] as const;
type Filter = (typeof FILTERS)[number];

const matches = (row: AdminSubscriptionRow, filter: Filter) => {
  const s = statusOf(row);
  if (filter === "all") return true;
  if (filter === "active") return isActive(s);
  if (filter === "canceled") return s === "canceled";
  if (filter === "past due") return s === "past_due" || s === "unpaid";
  return s === "none";
};

const StatusChip = ({ status }: { status: string }) => (
  <span
    className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${
      isActive(status)
        ? "border-foreground bg-foreground text-background"
        : "border-foreground"
    }`}
  >
    {status}
  </span>
);

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useAdminSubscriptions();
  const [filter, setFilter] = useState<Filter>("all");

  const action = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "cancel_at_period_end" | "restore" | "cancel_now";
    }) => post(`/api/admin/users/${id}/subscription`, { action }),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success(
        vars.action === "cancel_at_period_end"
          ? "Subscription will cancel at period end"
          : vars.action === "restore"
            ? "Subscription renewal restored"
            : "Subscription canceled immediately"
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-16 text-foreground">
        <Loader label="Loading subscriptions" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <div className="border-2 border-foreground p-8 text-center">
          <p className="font-display text-2xl font-bold">
            Couldn’t load subscriptions
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const rows = data.rows.filter((r) => matches(r, filter));

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-10">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Customers", value: data.summary.total, note: "ever subscribed" },
          { label: "Active", value: data.summary.active, note: "active / trialing", inverted: true },
          { label: "Canceled", value: data.summary.canceled, note: "ended" },
          {
            label: "Past due",
            value: data.summary.pastDue,
            note: data.stripeConnected ? "needs attention" : "stripe offline",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`border-2 border-foreground p-5 ${
              "inverted" in card && card.inverted
                ? "bg-foreground text-background"
                : "bg-background"
            }`}
          >
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              {card.label}
            </div>
            <div className="mt-2 font-display text-4xl leading-none font-black tracking-tighter">
              {card.value}
            </div>
            <div className="mt-2 font-mono text-[9px] tracking-[0.15em] text-muted-foreground uppercase">
              {card.note}
            </div>
          </div>
        ))}
      </div>

      {!data.stripeConnected && (
        <div className="mt-6 border-2 border-foreground bg-foreground p-4 text-background">
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase">
            Stripe not connected — showing database mirrors only
          </p>
          <p className="mt-1 text-sm text-background/80">
            Set STRIPE_SECRET_KEY in .env to see live statuses, prices, and
            invoice links.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-foreground pb-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border-2 border-foreground px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 ${
                filter === f
                  ? "bg-foreground text-background"
                  : "hover:bg-foreground hover:text-background"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          {rows.length} of {data.rows.length}
        </span>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="mt-6 border-2 border-border-light p-16 text-center">
          <p className="font-display text-2xl font-bold">Nothing here</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No subscriptions match the “{filter}” filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border-2 border-foreground">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-foreground font-mono text-[10px] tracking-[0.15em] text-background uppercase">
              <tr>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Price</th>
                <th className="px-5 py-3.5 font-medium">Renews</th>
                <th className="px-5 py-3.5 font-medium">Invoice</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {rows.map((row) => {
                const status = statusOf(row);
                const active = isActive(status);
                return (
                  <tr
                    key={row.userId}
                    className="group transition-colors duration-100 hover:bg-foreground hover:text-background"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{row.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                        {row.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${
                          active
                            ? "border-current bg-foreground text-background group-hover:bg-background group-hover:text-foreground"
                            : "border-current"
                        }`}
                      >
                        {status}
                      </span>
                      {row.cancelAtPeriodEnd && (
                        <span className="ml-2 font-mono text-[9px] tracking-[0.15em] uppercase">
                          cancels at period end
                        </span>
                      )}
                      {row.banned && (
                        <span className="ml-2 font-mono text-[9px] tracking-[0.15em] uppercase">
                          · banned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      {row.priceLabel ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                      {row.currentPeriodEnd
                        ? moment(row.currentPeriodEnd).format("MMM D, YYYY")
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {row.invoiceUrl ? (
                        <a
                          href={row.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 underline decoration-2 underline-offset-4"
                        >
                          Open <ExternalLink size={12} strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="font-mono text-[11px] text-muted-foreground group-hover:text-background/70">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${row.userId}`}
                          className="border border-current px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-100 hover:!bg-background hover:!text-foreground"
                        >
                          <Eye size={11} strokeWidth={1.5} className="mr-1 inline" />
                          View
                        </Link>
                        {active && !row.cancelAtPeriodEnd && (
                          <button
                            disabled={action.isPending}
                            onClick={() =>
                              action.mutate({
                                id: row.userId,
                                action: "cancel_at_period_end",
                              })
                            }
                            className="border border-current px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-100 hover:!bg-background hover:!text-foreground disabled:opacity-50"
                          >
                            <Ban size={11} strokeWidth={1.5} className="mr-1 inline" />
                            Cancel
                          </button>
                        )}
                        {active && row.cancelAtPeriodEnd && (
                          <button
                            disabled={action.isPending}
                            onClick={() =>
                              action.mutate({ id: row.userId, action: "restore" })
                            }
                            className="border border-current px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-100 hover:!bg-background hover:!text-foreground disabled:opacity-50"
                          >
                            <RotateCcw size={11} strokeWidth={1.5} className="mr-1 inline" />
                            Restore
                          </button>
                        )}
                        {active && row.stripeCustomerId && (
                          <button
                            disabled={action.isPending}
                            onClick={() => {
                              if (
                                confirm(
                                  `Cancel ${row.email} immediately? They lose Pro at once.`
                                )
                              ) {
                                action.mutate({ id: row.userId, action: "cancel_now" });
                              }
                            }}
                            className="border border-current px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-100 hover:!bg-background hover:!text-foreground disabled:opacity-50"
                          >
                            <XCircle size={11} strokeWidth={1.5} className="mr-1 inline" />
                            Cancel now
                          </button>
                        )}
                        {action.isPending && action.variables?.id === row.userId && (
                          <Loader2 size={13} className="animate-spin" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 border-t border-border-light pt-4 font-mono text-[10px] leading-relaxed tracking-[0.15em] text-muted-foreground uppercase">
        Cancellations run through the Stripe API and are mirrored back to the
        user record — webhooks remain the source of truth.
      </p>
    </div>
  );
}
