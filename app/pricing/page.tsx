"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBillingStatus } from "@/app/hooks/useBillingStatus";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import SectionHeading from "../_components/SectionHeading";
import Faq from "../_components/Faq";

type PriceInfo = { amount: number | null; currency: string; interval: string | null } | null;

const COMPARISON: [string, string, string][] = [
  ["Files", "Up to 5", "Unlimited"],
  ["Document editor + whiteboard", "yes", "yes"],
  ["Built-in templates", "All 12", "All 12"],
  ["Archive, starred & recent views", "yes", "yes"],
  ["Team spaces", "yes", "yes"],
  ["Priority support", "no", "yes"],
];

const FAQS = [
  {
    q: "Is Free actually free?",
    a: "Yes — the Free plan includes up to 5 files with the full document editor, whiteboard, templates, and archive/starred views. No trial clock, no card required.",
  },
  {
    q: "What counts as a file?",
    a: "Each document-whiteboard pair you create in a team is one file. Five files is enough to run a small project; Pro removes the ceiling entirely.",
  },
  {
    q: "How do I cancel?",
    a: "Through the Stripe customer portal, in two clicks. Your plan stays active until the end of the current billing period, and your files remain yours.",
  },
  {
    q: "Is yearly billing cheaper?",
    a: "Yes — switch the interval toggle to yearly to see annual pricing. Same features, billed once a year instead of twelve times.",
  },
  {
    q: "Which payment methods work?",
    a: "All major cards through Stripe. Subscription details, invoices, and card updates all live in the same customer portal.",
  },
];

function Cell({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
        <Check size={15} strokeWidth={1.5} />
        Included
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center gap-2 text-muted-foreground group-hover:text-background/70">
        <Minus size={15} strokeWidth={1.5} />
      </span>
    );
  }
  return <span className="font-mono text-xs tracking-[0.1em] uppercase">{value}</span>;
}

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
    <>
      <Header />
      <main id="main" className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-24 lg:px-12">
          {/* Masthead */}
          <div className="flex items-center gap-4">
            <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              Pricing
            </span>
          </div>
          <h1 className="mt-8 font-display text-5xl leading-[0.9] font-black tracking-tighter md:text-7xl">
            Plans that <span className="font-normal italic">scale</span> with you
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted-foreground">
            Start free. Upgrade when you need unlimited files.
          </p>

          {/* Interval toggle — segmented, rectangular, instant */}
          <div className="mt-10 flex justify-center border-b-4 border-foreground pb-12">
            <div
              role="group"
              aria-label="Billing interval"
              className="inline-flex border-2 border-foreground"
            >
              {(["monthly", "yearly"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={interval === option}
                  onClick={() => setInterval(option)}
                  className={`px-6 py-3 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors duration-100 ${
                    interval === option
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Plans — Pro tier extends vertically and inverts */}
          <div className="mx-auto mt-6 grid max-w-4xl gap-6 md:mt-14 md:grid-cols-2">
            {plans.map((plan) => {
              const inverted = Boolean(plan.cta);
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col border-2 border-foreground p-8 md:p-10 ${
                    inverted
                      ? "bg-foreground text-background md:z-10 md:-my-6"
                      : "bg-background"
                  }`}
                >
                  {inverted && (
                    <span className="absolute -top-4 left-8 border-2 border-background bg-background px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-foreground uppercase">
                      Recommended
                    </span>
                  )}

                  <h2 className="font-display text-2xl font-black tracking-tight">
                    {plan.name}
                  </h2>
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      inverted ? "text-background/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.blurb}
                  </p>
                  <p className="mt-6 font-display text-4xl font-black tracking-tighter">
                    {plan.price}
                  </p>

                  <ul className="mt-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-center gap-3 border-b py-3 text-sm ${
                          inverted
                            ? "border-background/20 text-background/90"
                            : "border-border-light text-muted-foreground"
                        } last:border-b-0`}
                      >
                        <Check size={16} strokeWidth={1.5} className="shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {plan.cta ? (
                      isPro ? (
                        <Button
                          variant="outline"
                          onClick={openPortal}
                          disabled={loading}
                          className={`w-full ${
                            inverted
                              ? "border-background bg-transparent text-background hover:bg-background hover:text-foreground"
                              : ""
                          }`}
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Manage billing"
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={startCheckout}
                          disabled={loading}
                          className={`w-full ${
                            inverted
                              ? "border-background bg-background text-foreground hover:bg-transparent hover:text-background"
                              : ""
                          }`}
                        >
                          {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Upgrade to Pro"
                          )}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="w-full"
                      >
                        Current plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan comparison */}
          <section className="mt-24">
            <SectionHeading
              eyebrow="Compare"
              title={
                <>Free <span className="font-normal italic">vs.</span> Pro</>
              }
              description="Every line, stated plainly — no asterisks three scrolls down."
            />

            <div className="mt-10 overflow-x-auto border-2 border-foreground">
              <table className="w-full min-w-[540px] text-left">
                <thead className="bg-foreground font-mono text-[10px] tracking-[0.15em] text-background uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Capability</th>
                    <th className="px-6 py-4 font-medium">Free</th>
                    <th className="px-6 py-4 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {COMPARISON.map(([feature, free, pro]) => (
                    <tr
                      key={feature}
                      className="group transition-colors duration-100 hover:bg-foreground hover:text-background"
                    >
                      <td className="px-6 py-4 text-sm font-medium">{feature}</td>
                      <td className="px-6 py-4">
                        <Cell value={free} />
                      </td>
                      <td className="px-6 py-4">
                        <Cell value={pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-24">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading
                  eyebrow="FAQ"
                  title={
                    <>Billing, <span className="font-normal italic">answered</span></>
                  }
                />
              </div>
              <div className="lg:col-span-8">
                <Faq items={FAQS} />
              </div>
            </div>
          </section>

          <p className="mx-auto mt-16 max-w-4xl border-t border-border-light pt-6 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            Prices in USD · Billed via Stripe · Cancel anytime
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
