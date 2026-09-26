"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBillingStatus } from "@/app/hooks/useBillingStatus";
import Loader from "@/app/(routes)/dashboard/_components/Loader";
import { toast } from "sonner";

export default function BillingSettingsPage() {
  const router = useRouter();
  const { data: billing, isLoading, refetch } = useBillingStatus();
  const [loading, setLoading] = useState(false);

  // Reconcile with Stripe and refresh the local snapshot.
  const sync = async (showToast = false) => {
    try {
      const res = await fetch("/api/billing/sync", { method: "POST" });
      if (res.ok) {
        await refetch();
        if (showToast) toast.success("Plan updated");
      }
    } catch {
      // status endpoint self-heals too, so a failure here is non-fatal
    }
  };

  // After returning from Checkout, pull the subscription immediately instead of
  // waiting for the webhook.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("checkout=success")) {
      sync(true);
      window.history.replaceState({}, "", "/settings/billing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader /></div>;
  }

  const fileLimit = billing?.fileLimit ?? null;
  const fileCount = billing?.fileCount ?? 0;
  const percent = fileLimit ? Math.min((fileCount / fileLimit) * 100, 100) : 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-zinc-100">
      <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-6 border-b border-zinc-800/60 bg-[#0a0a0a]/90 backdrop-blur">
        <button onClick={() => router.push("/dashboard")} className="text-zinc-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Billing &amp; Plan</h1>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-3xl w-full mx-auto">
        <div className="rounded-2xl border border-zinc-800 bg-[#121212] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Current plan</p>
              <p className="text-2xl font-bold">{billing?.planName ?? "Free"}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => sync(true)} className="text-zinc-400 hover:text-white">
              Refresh
            </Button>
          </div>

          {billing?.status && (
            <p className="text-sm text-zinc-400 mb-6">
              Subscription status: <span className="text-zinc-200">{billing.status}</span>
            </p>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-zinc-300 font-medium">Files used</span>
              <span className="text-zinc-500">{fileCount} / {fileLimit ?? "∞"}</span>
            </div>
            <Progress value={percent} className="h-2 bg-zinc-800 [&>div]:bg-blue-500" />
          </div>

          <div className="flex flex-wrap gap-3">
            {billing?.plan === "pro" ? (
              <Button onClick={openPortal} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Manage subscription"}
              </Button>
            ) : (
              <Button onClick={() => router.push("/pricing")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Upgrade to Pro
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="bg-transparent border-zinc-700 text-zinc-200"
            >
              Back to dashboard
            </Button>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-6">
          Billing is powered by Stripe. Subscriptions are managed through the Stripe customer portal.
        </p>
      </main>
    </div>
  );
}
