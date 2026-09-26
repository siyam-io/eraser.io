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
    return (
      <div className="flex min-h-screen justify-center bg-background p-10 text-foreground">
        <Loader />
      </div>
    );
  }

  const fileLimit = billing?.fileLimit ?? null;
  const fileCount = billing?.fileCount ?? 0;
  const percent = fileLimit ? Math.min((fileCount / fileLimit) * 100, 100) : 100;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-foreground bg-background px-6">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
          className="flex size-8 items-center justify-center border-2 border-foreground transition-colors duration-100 hover:bg-foreground hover:text-background"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <h1 className="font-display text-lg font-bold tracking-tight">
          Billing &amp; Plan
        </h1>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 p-6 md:p-10">
        <div className="border-2 border-foreground p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Current plan
              </p>
              <p className="mt-1 font-display text-3xl font-black tracking-tight">
                {billing?.planName ?? "Free"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => sync(true)}>
              Refresh
            </Button>
          </div>

          {billing?.status && (
            <p className="mb-6 font-mono text-xs text-muted-foreground">
              Subscription status:{" "}
              <span className="text-foreground">{billing.status}</span>
            </p>
          )}

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Files used</span>
              <span className="font-mono text-xs text-muted-foreground">
                {fileCount} / {fileLimit ?? "∞"}
              </span>
            </div>
            <Progress value={percent} className="h-2 bg-border-light" />
          </div>

          <div className="flex flex-wrap gap-3">
            {billing?.plan === "pro" ? (
              <Button onClick={openPortal} disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Manage subscription"
                )}
              </Button>
            ) : (
              <Button onClick={() => router.push("/pricing")}>Upgrade to Pro</Button>
            )}
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>

        <p className="mt-6 border-t border-border-light pt-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
          Billing is powered by Stripe. Subscriptions are managed through the
          Stripe customer portal.
        </p>
      </main>
    </div>
  );
}
