"use client";

import React from "react";
import { useAdminStats } from "@/app/hooks/useAdmin";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { TrendChart, BarChart } from "./_components/Charts";
import moment from "moment";

const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });

function StatCard({
  label,
  value,
  note,
  inverted = false,
}: {
  label: string;
  value: string;
  note?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`border-2 border-foreground p-6 ${
        inverted ? "bg-foreground text-background texture-vlines" : "bg-background"
      }`}
    >
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={`mt-3 font-display text-5xl leading-none font-black tracking-tighter ${
          inverted ? "text-background" : ""
        }`}
      >
        {value}
      </div>
      {note && (
        <div
          className={`mt-3 font-mono text-[10px] tracking-[0.15em] uppercase ${
            inverted ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          {note}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error, refetch, isFetching } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center p-16 text-foreground">
        <Loader label="Loading metrics" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <div className="border-2 border-foreground p-8 text-center">
          <p className="font-display text-2xl font-bold">Couldn’t load metrics</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 border-2 border-foreground bg-foreground px-6 py-3 font-mono text-xs tracking-widest text-background uppercase transition-colors duration-100 hover:bg-background hover:text-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const growth = data.growth.map((g) => ({ label: monthLabel(g.month), value: g.count }));
  const revenue = data.revenue.map((r) => ({
    label: monthLabel(r.month),
    value: r.cents,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-10">
      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered users"
          value={String(data.totalUsers)}
          note={data.bannedUsers > 0 ? `${data.bannedUsers} banned` : undefined}
        />
        <StatCard
          label="Active Pro"
          value={String(data.proUsers)}
          note="active / trialing"
          inverted
        />
        <StatCard
          label="Files created"
          value={String(data.totalFiles)}
          note="all time"
        />
        <StatCard
          label="MRR"
          value={data.mrrCents === null ? "—" : money(data.mrrCents, data.currency)}
          note={
            data.mrrCents === null
              ? data.stripeConnected
                ? "no active subscriptions"
                : "stripe not connected"
              : "from stripe, live"
          }
        />
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border-2 border-foreground">
          <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight">
              User growth
            </h2>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Last 12 months
            </span>
          </div>
          <div className="p-5">
            <TrendChart data={growth} valueLabel="Signups" emptyLabel="No signups in 12 months" />
          </div>
        </section>

        <section className="border-2 border-foreground">
          <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Revenue
            </h2>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {data.stripeConnected ? "Paid invoices · 6 months" : "Stripe offline"}
            </span>
          </div>
          <div className="p-5">
            <BarChart
              data={revenue}
              valueLabel="Revenue"
              formatValue={(c) => money(c, data.currency)}
              emptyLabel={
                data.stripeConnected
                  ? "No paid invoices yet"
                  : "Connect Stripe to see revenue"
              }
            />
          </div>
        </section>
      </div>

      {/* Activity */}
      <section className="mt-8 border-2 border-foreground">
        <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Recent activity
          </h2>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-2 border-foreground px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-100 hover:bg-foreground hover:text-background disabled:opacity-50"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {data.activity.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nothing yet — activity appears as users sign up and subscribe.
          </p>
        ) : (
          <ul>
            {data.activity.map((item, i) => (
              <li
                key={`${item.email}-${item.at}-${i}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border-light px-5 py-3.5 last:border-b-0"
              >
                <span
                  className={`border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${
                    item.type === "signup"
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground"
                  }`}
                >
                  {item.type === "signup" ? "signup" : "billing"}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {item.email}
                </span>
                <span className="text-sm text-muted-foreground">{item.detail}</span>
                <span className="ml-auto font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  {moment(item.at).fromNow()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
