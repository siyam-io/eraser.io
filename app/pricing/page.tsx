"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBillingStatus } from "@/app/hooks/useBillingStatus";

type PriceInfo = { amount: number | null; currency: string; interval: string | null } | null;

function formatPrice(price: PriceInfo, interval: "monthly" | "yearly"): string {
  if (!price?.amount) return interval === "yearly" ? "Yearly" : "Monthly";
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (price.currency || "usd").toUpperCase(),
    maximumFractionDigits: price.amount % 100 === 0 ? 0 : 2,
  }).format(price.amount / 100);
  return `${value} / ${interval === "yearly" ? "yr" : "mo"}`;
}

export default function PricingPage() {
  const router = useRouter();
  const { data: billing } = useBillingStatus();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [prices, setPrices] = useState<{ monthly: PriceInfo; yearly: PriceInfo }>({
    monthly: null,
    yearly: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setPrices(data))
      .catch(() => {});
  }, []);

  const isPro = billing?.plan === "pro";

  const startCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        toast.error(data?.error || "Could not start checkout");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Could not start checkout");
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        toast.error(data?.error || "Could not open billing portal");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Could not open billing portal");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      blurb: "For trying the workspace out.",
      features: ["Up to 5 files", "Document editor + whiteboard", "Archive & starred files"],
      cta: null,
    },
    {
      id: "pro",
      name: "Pro",
      price: formatPrice(prices[interval], interval),
      blurb: "For individuals and small teams shipping real work.",
      features: ["Unlimited files", "Archive, starred & recent views", "Priority support"],
      cta: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800/60">
        <Link href="/" className="font-bold tracking-tight text-lg">ERASIOR</Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">Dashboard</Link>
          <Link href="/settings/billing" className="text-sm text-zinc-400 hover:text-white">Billing</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">Plans that scale with you</h1>
          <p className="text-zinc-400">Start free. Upgrade when you need unlimited files.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setInterval(option)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors capitalize ${
                  interval === option ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.cta ? "border-blue-600/50 bg-gradient-to-b from-blue-950/30 to-[#121212]" : "border-zinc-800 bg-[#121212]"
              }`}
            >
              <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
              <p className="text-zinc-400 text-sm mb-4">{plan.blurb}</p>
              <p className="text-3xl font-black mb-6">{plan.price}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={16} className="text-blue-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.cta ? (
                isPro ? (
                  <Button variant="outline" onClick={openPortal} disabled={loading} className="w-full bg-transparent border-zinc-700 text-zinc-200">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Manage billing"}
                  </Button>
                ) : (
                  <Button onClick={startCheckout} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Upgrade to Pro"}
                  </Button>
                )
              ) : (
                <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full bg-transparent border-zinc-700 text-zinc-200">
                  Current plan
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
